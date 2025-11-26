import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, Trash2, Download, Eye } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";
import { v4 as uuidv4 } from 'uuid';
import { Skeleton } from "@/components/ui/skeleton";
import { stripUuidFromFile } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import AttachmentViewerDialog from "./AttachmentViewerDialog";

interface Attachment {
  id: string;
  name: string;
  file_path: string;
  type: 'image' | 'document' | 'other';
  size: string;
  uploadedBy: string;
  date: string;
  fileUrl: string;
}

interface AttachmentsProps {
  orderId: string;
}

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
          size: "N/A",
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

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

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
        await supabase.storage.from(bucketName).remove([filePath]);
        throw metadataError;
      }

      const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(filePath);
      
      const newAttachment: Attachment = {
        id: metadata.id,
        name: selectedFile.name,
        file_path: filePath,
        type: getFileType(selectedFile.type),
        size: (selectedFile.size / 1024 / 1024).toFixed(2) + " MB",
        uploadedBy: user.email || "Desconhecido",
        date: new Date().toLocaleDateString('pt-BR'),
        fileUrl: publicUrlData.publicUrl,
      };

      setAttachments((prev) => [newAttachment, ...prev]);
      setSelectedFile(null);
      
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
      const { error: metadataError } = await supabase
        .from('order_attachments_metadata')
        .delete()
        .eq('id', attachmentId)
        .eq('user_id', user.id);

      if (metadataError) throw metadataError;

      const { error: storageError } = await supabase.storage.from(bucketName).remove([filePath]);

      if (storageError) {
        console.warn("Aviso: Falha ao remover arquivo do storage, mas metadado removido.", storageError);
      }

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
        <CardTitle className="uppercase">Anexos</CardTitle>
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
              className="w-full sm:w-auto justify-start uppercase"
            >
              <FileText className="h-4 w-4 mr-2" /> {selectedFile ? stripUuidFromFile(selectedFile.name) : "Selecionar Ficheiro"}
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={!selectedFile || isUploading}
              className="sm:w-auto w-full uppercase"
            >
              {isUploading ? "A carregar..." : <><Upload className="h-4 w-4 mr-2" /> Upload</>}
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-md font-semibold uppercase">Arquivos Anexados:</h4>
          {isLoadingAttachments ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : attachments.length > 0 ? (
            <div className="divide-y">
              {attachments.map((att) => (
                <div key={att.id} className="py-3">
                  <div 
                    className="flex items-center space-x-3 min-w-0 cursor-pointer hover:bg-muted/50 p-1 -m-1 rounded-md transition-colors group"
                    onClick={() => handlePreview(att)}
                  >
                    {att.type === 'image' ? (
                      <div className="w-12 h-12 flex-shrink-0 rounded-md overflow-hidden border">
                        <img src={att.fileUrl} alt={att.name} className="object-cover w-full h-full" />
                      </div>
                    ) : (
                      <FileText className="h-8 w-8 flex-shrink-0 text-gray-500" />
                    )}
                    <div className="min-w-0 flex-1 flex items-center justify-end">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(att.id, att.file_path, att.name);
                        }} 
                        aria-label="Remover"
                        className="h-8 w-8 text-destructive flex-shrink-0" 
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground text-sm uppercase">Nenhum anexo encontrado.</p>
          )}
        </div>
      </CardContent>

      <AttachmentViewerDialog
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