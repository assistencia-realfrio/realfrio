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

interface Attachment {
  id: string; // Caminho completo do arquivo no storage (e.g., 'equipmentId/uniqueFileName.jpg')
  name: string; // Nome original do arquivo
  type: 'image' | 'document' | 'other';
  size: string; // Tamanho formatado
  uploadedBy: string; // Nome completo do utilizador ou email
  date: string; // Data de upload
  fileUrl: string; // URL pública do Supabase Storage
}

interface EquipmentAttachmentsProps {
  equipmentId: string;
}

// Componente para a visualização do anexo em popup
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
          ) : fileType === 'document' ? ( // Assumimos que 'document' é PDF para visualização
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

const EquipmentAttachments: React.FC<EquipmentAttachmentsProps> = ({ equipmentId }) => {
  const { user } = useSession();
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewFileUrl, setPreviewFileUrl] = useState("");
  const [previewFileType, setPreviewFileType] = useState<'image' | 'document' | 'other'>('other');
  const [previewFileName, setPreviewFileName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingAttachments, setIsLoadingAttachments] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null); // Ref para o input de arquivo

  const bucketName = 'equipment_attachments'; // NOVO BUCKET PARA ANEXOS DE EQUIPAMENTOS
  const folderPath = `${equipmentId}`;

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
      const { data, error } = await supabase.storage.from(bucketName).list(folderPath, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
      });

      if (error) throw error;

      const fetched: Attachment[] = await Promise.all(data.map(async (file) => {
        const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(`${folderPath}/${file.name}`);
        
        // Tentar obter metadados para o tipo de arquivo
        const { data: fileData, error: fileError } = await supabase.storage.from(bucketName).download(`${folderPath}/${file.name}`);
        let fileType: 'image' | 'document' | 'other' = 'other';
        if (fileData && fileData.type) {
          fileType = getFileType(fileData.type);
        } else if (file.name.match(/\.(jpeg|jpg|png)$/i)) {
          fileType = 'image';
        } else if (file.name.match(/\.pdf$/i)) {
          fileType = 'document';
        }

        return {
          id: `${folderPath}/${file.name}`, // Usar o caminho completo como ID único
          name: file.name,
          type: fileType,
          size: (file.metadata?.size / 1024 / 1024).toFixed(2) + " MB", // Supabase retorna size em bytes
          uploadedBy: user.email || "Desconhecido", // Usar email do user logado
          date: new Date(file.created_at).toLocaleDateString('pt-BR'),
          fileUrl: publicUrlData.publicUrl,
        };
      }));
      setAttachments(fetched);
    } catch (error) {
      console.error("Erro ao buscar anexos do equipamento:", error);
      showError("Erro ao carregar anexos do equipamento.");
    } finally {
      setIsLoadingAttachments(false);
    }
  };

  useEffect(() => {
    if (equipmentId && user?.id) {
      fetchAttachments();
    }
  }, [equipmentId, user?.id]);

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
    try {
      const uniqueFileName = `${uuidv4()}-${selectedFile.name}`;
      const filePath = `${folderPath}/${uniqueFileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(filePath);

      const newAttachment: Attachment = {
        id: filePath,
        name: selectedFile.name,
        type: getFileType(selectedFile.type),
        size: (selectedFile.size / 1024 / 1024).toFixed(2) + " MB",
        uploadedBy: user.email || "Desconhecido",
        date: new Date().toLocaleDateString('pt-BR'),
        fileUrl: publicUrlData.publicUrl,
      };

      setAttachments((prev) => [newAttachment, ...prev]);
      setSelectedFile(null);
      showSuccess(`Arquivo '${newAttachment.name}' anexado ao equipamento com sucesso!`);
    } catch (error) {
      console.error("Erro ao fazer upload para o equipamento:", error);
      showError("Erro ao anexar arquivo ao equipamento. Tente novamente.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (attachmentId: string, attachmentName: string) => {
    if (!user?.id) {
      showError("Você precisa estar logado para excluir arquivos.");
      return;
    }

    try {
      const { error } = await supabase.storage.from(bucketName).remove([attachmentId]);

      if (error) throw error;

      setAttachments(attachments.filter(att => att.id !== attachmentId));
      showSuccess(`Anexo '${attachmentName}' removido do equipamento.`);
    } catch (error) {
      console.error("Erro ao excluir anexo do equipamento:", error);
      showError("Erro ao remover anexo do equipamento. Tente novamente.");
    }
  };

  const handlePreview = (attachment: Attachment) => {
    setPreviewFileType(attachment.type);
    setPreviewFileUrl(attachment.fileUrl);
    setPreviewFileName(attachment.name);
    setIsPreviewModalOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Anexos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Formulário de Upload */}
        <div className="space-y-3 border p-4 rounded-md">
          <div className="flex flex-col sm:flex-row gap-3">
            <input 
              id="equipment-file-upload" 
              type="file" 
              onChange={handleFileChange} 
              className="hidden" // Oculta o input nativo
              ref={fileInputRef} // Atribui a ref
              disabled={isUploading}
            />
            <Button 
              type="button" // Importante para não submeter o formulário
              variant="outline" 
              onClick={handleTriggerFileInput} // Aciona o clique no input oculto
              disabled={isUploading}
              className="w-full sm:w-auto justify-start" // Alinha o texto à esquerda
            >
              <FileText className="h-4 w-4 mr-2" /> {selectedFile ? selectedFile.name : "Selecionar Ficheiro"}
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

        {/* Lista de Anexos */}
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
                <div key={att.id} className="py-3 flex flex-col"> {/* Alterado para flex-col */}
                  <div className="flex items-center justify-between space-x-3 min-w-0"> {/* Nova div para thumbnail e info */}
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
                  </div>
                  <div className="flex space-x-2 flex-shrink-0 mt-2 justify-end"> {/* Botões movidos para cá */}
                    <Button variant="ghost" size="icon" onClick={() => handlePreview(att)} aria-label="Visualizar">
                        <Eye className="h-4 w-4" />
                    </Button>
                    <a href={att.fileUrl} download={att.name} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="icon" aria-label="Download">
                            <Download className="h-4 w-4" />
                        </Button>
                    </a>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(att.id, att.name)} aria-label="Remover">
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground text-sm">Nenhum anexo encontrado para este equipamento.</p>
          )}
        </div>
      </CardContent>

      {/* Componente de Visualização de Anexo */}
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

export default EquipmentAttachments;