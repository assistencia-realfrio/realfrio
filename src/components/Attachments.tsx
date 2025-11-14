import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, Trash2, Download, Eye } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";
import { v4 as uuidv4 } from 'uuid';
import { Skeleton } from "@/components/ui/skeleton";
import { stripUuidFromFile } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query"; // Importar useQueryClient

interface Attachment {
  id: string; // ID do metadado
  name: string; // Nome original do arquivo
  file_path: string; // Caminho completo no storage
  type: 'image' | 'document' | 'other';
  size: string;
  uploadedBy: string;
  date: string;
  fileUrl: string;
}

interface AttachmentsProps {
  orderId: string;
}

const AttachmentPreviewDialog: React.FC<{
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  fileUrl: string;
  fileType: 'image' | 'document' | 'other';
  fileName: string;
}> = ({ isOpen, onOpenChange, fileUrl, fileType, fileName }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{fileName}</DialogTitle>
        </DialogHeader>
        <div className="flex-grow overflow-auto p-2">
          {fileType === 'image' ? (
            <AspectRatio ratio={16 / 9} className="bg-muted">
              <img src={fileUrl} alt={fileName} className="rounded-md object-contain w-full h-full" />
            </AspectRatio>
          ) : fileType === 'document' ? (
            <iframe src={fileUrl} className="w-full h-full border-none" title={fileName}>
              Seu navegador não suporta iframes. Você pode <a href={fileUrl} target="_blank" rel="noopener noreferrer">baixar o arquivo</a>.
            </iframe>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>Este tipo de arquivo não pode ser visualizado diretamente.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const Attachments: React.FC<AttachmentsProps> = ({ orderId }) => {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewFileUrl, setPreviewFileUrl] = useState("");
  const [previewFileType, setPreviewFileType] = useState<'image' | 'document' | 'other'>('other');
  const [previewFileName, setPreviewFileName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingAttachments, setIsLoadingAttachments] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const bucketName = 'order_attachments';
  const folderPath = `${orderId}`;

  const getFileType = (mimeType: string): 'image' | 'document' | 'other' => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType === 'application/pdf') return 'document';
    return 'other';
  };

  const fetchAttachments = async () => {
    if (!user?.id) {
      setIsLoadingAttachments(false);
      return;
    }

    setIsLoadingAttachments(true);
    try {
      // 1. Buscar metadados da tabela
      const { data: metadata, error: metadataError } = await supabase
        .from('order_attachments_metadata')
        .select(`
          id, 
          file_path, 
          file_name, 
          created_at, 
          user_id,
          profiles (first_name, last_name)
        `)
        .eq('service_order_id', orderId)
        .order('created_at', { ascending: false });

      if (metadataError) throw metadataError;

      const fetched: Attachment[] = metadata.map((meta: any) => {
        const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(meta.file_path);
        
        // Tentativa de inferir o tipo pelo nome do arquivo, já que o mimeType não está no metadado
        let fileType: 'image' | 'document' | 'other' = 'other';
        if (meta.file_name.match(/\.(jpeg|jpg|png|gif)$/i)) {
          fileType = 'image';
        } else if (meta.file_name.match(/\.pdf$/i)) {
          fileType = 'document';
        }

        const firstName = meta.profiles?.first_name || '';
        const lastName = meta.profiles?.last_name || '';
        const userFullName = `${firstName} ${lastName}`.trim() || 'Usuário Desconhecido';

        return {
          id: meta.id,
          name: meta.file_name,
          file_path: meta.file_path,
          type: fileType,
          size: "N/A", // Tamanho não está no metadado, mantemos N/A por enquanto
          uploadedBy: userFullName,
          date: new Date(meta.created_at).toLocaleDateString('pt-BR'),
          fileUrl: publicUrlData.publicUrl,
        };
      });
      
      setAttachments(fetched);
    } catch (error) {
      console.error("Erro ao buscar anexos:", error);
      showError("Erro ao carregar anexos.");
    } finally {
      setIsLoadingAttachments(false);
    }
  };

  useEffect(() => {
    if (orderId && user?.id) {
      fetchAttachments();
    }
  }, [orderId, user?.id]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleTriggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (!selectedFile || !user?.id) {
      showError("Selecione um arquivo e certifique-se de estar logado.");
      return;
    }

    setIsUploading(true);
    let filePath = '';
    try {
      const uniqueFileName = `${uuidv4()}-${selectedFile.name}`;
      filePath = `${folderPath}/${uniqueFileName}`;

      // 1. Upload para o Storage
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // 2. Inserir metadados na tabela
      const { data: metadata, error: metadataError } = await supabase
        .from('order_attachments_metadata')
        .insert({
          service_order_id: orderId,
          user_id: user.id,
          file_path: filePath,
          file_name: selectedFile.name,
        })
        .select()
        .single();

      if (metadataError) {
        // Se falhar a inserção do metadado, tentamos remover o arquivo do storage para evitar órfãos
        await supabase.storage.from(bucketName).remove([filePath]);
        throw metadataError;
      }

      // 3. Atualizar UI e cache
      const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(filePath);
      
      const newAttachment: Attachment = {
        id: metadata.id,
        name: selectedFile.name,
        file_path: filePath,
        type: getFileType(selectedFile.type),
        size: (selectedFile.size / 1024 / 1024).toFixed(2) + " MB",
        uploadedBy: user.email || "Desconhecido", // O nome completo será carregado no próximo fetch
        date: new Date().toLocaleDateString('pt-BR'),
        fileUrl: publicUrlData.publicUrl,
      };

      setAttachments((prev) => [newAttachment, ...prev]);
      setSelectedFile(null);
      
      // Invalida as queries de contagem e lista de OS para atualizar os badges
      queryClient.invalidateQueries({ queryKey: ['orderAttachmentsCount', orderId] });
      queryClient.invalidateQueries({ queryKey: ['serviceOrders'] });
      
      showSuccess(`Arquivo '${stripUuidFromFile(newAttachment.name)}' anexado com sucesso!`);
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      showError("Erro ao anexar arquivo. Tente novamente.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (attachmentId: string, filePath: string, attachmentName: string) => {
    if (!user?.id) {
      showError("Você precisa estar logado para excluir arquivos.");
      return;
    }

    try {
      // 1. Remover metadado da tabela
      const { error: metadataError } = await supabase
        .from('order_attachments_metadata')
        .delete()
        .eq('id', attachmentId)
        .eq('user_id', user.id); // RLS já deve garantir isso, mas é bom ter um filtro extra

      if (metadataError) throw metadataError;

      // 2. Remover arquivo do Storage
      const { error: storageError } = await supabase.storage.from(bucketName).remove([filePath]);

      if (storageError) {
        // Se o storage falhar, logamos, mas a UI já foi atualizada pelo metadado
        console.warn("Aviso: Falha ao remover arquivo do storage, mas metadado removido.", storageError);
      }

      // 3. Atualizar UI e cache
      setAttachments(attachments.filter(att => att.id !== attachmentId));
      
      queryClient.invalidateQueries({ queryKey: ['orderAttachmentsCount', orderId] });
      queryClient.invalidateQueries({ queryKey: ['serviceOrders'] });
      
      showSuccess(`Anexo '${stripUuidFromFile(attachmentName)}' removido.`);
    } catch (error) {
      console.error("Erro ao excluir anexo:", error);
      showError("Erro ao remover anexo. Tente novamente.");
    }
  };

  const handlePreview = (attachment: Attachment) => {
    setPreviewFileType(attachment.type);
    setPreviewFileUrl(attachment.fileUrl);
    setPreviewFileName(stripUuidFromFile(attachment.name));
    setIsPreviewModalOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Anexos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3 border p-4 rounded-md">
          <div className="flex flex-col sm:flex-row gap-3">
            <input 
              id="file-upload" 
              type="file" 
              onChange={handleFileChange} 
              className="hidden"
              ref={fileInputRef}
              disabled={isUploading}
            />
            <Button 
              type="button"
              variant="outline" 
              onClick={handleTriggerFileInput}
              disabled={isUploading}
              className="w-full sm:w-auto justify-start"
            >
              <FileText className="h-4 w-4 mr-2" /> {selectedFile ? stripUuidFromFile(selectedFile.name) : "Selecionar Ficheiro"}
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={!selectedFile || isUploading}
              className="sm:w-auto w-full"
            >
              {isUploading ? "A carregar..." : <><Upload className="h-4 w-4 mr-2" /> Upload</>}
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-md font-semibold">Arquivos Anexados:</h4>
          {isLoadingAttachments ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : attachments.length > 0 ? (
            <div className="divide-y">
              {attachments.map((att) => (
                <div key={att.id} className="py-3">
                  <div className="flex items-center space-x-3 min-w-0">
                    {att.type === 'image' ? (
                      <div className="w-12 h-12 flex-shrink-0 rounded-md overflow-hidden border">
                        <img src={att.fileUrl} alt={att.name} className="object-cover w-full h-full" />
                      </div>
                    ) : (
                      <FileText className="h-8 w-8 flex-shrink-0 text-gray-500" />
                    )}
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground truncate">
                        {att.size} | Por {att.uploadedBy} em {att.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-start space-x-2 mt-1">
                    <Button variant="ghost" size="icon" onClick={() => handlePreview(att)} aria-label="Visualizar">
                        <Eye className="h-4 w-4" />
                    </Button>
                    <a href={att.fileUrl} download={att.name} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="icon" aria-label="Download">
                            <Download className="h-4 w-4" />
                        </Button>
                    </a>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(att.id, att.file_path, att.name)} aria-label="Remover">
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground text-sm">Nenhum anexo encontrado.</p>
          )}
        </div>
      </CardContent>

      <AttachmentPreviewDialog
        isOpen={isPreviewModalOpen}
        onOpenChange={setIsPreviewModalOpen}
        fileUrl={previewFileUrl}
        fileType={previewFileType}
        fileName={previewFileName}
      />
    </Card>
  );
};

export default Attachments;