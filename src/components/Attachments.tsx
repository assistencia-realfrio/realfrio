import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, Trash2, Download, Eye, ZoomIn, ZoomOut, X } from "lucide-react";
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
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [startPanPosition, setStartPanPosition] = useState({ x: 0, y: 0 });
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const initialPinchDistanceRef = useRef(0);
  const initialZoomRef = useRef(1);

  const getDistance = (touches: React.TouchList) => {
    return Math.sqrt(
      Math.pow(touches[0].clientX - touches[1].clientX, 2) +
      Math.pow(touches[0].clientY - touches[1].clientY, 2)
    );
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => {
    const newZoom = Math.max(zoom - 0.2, 0.5);
    if (newZoom <= 1) {
      setImagePosition({ x: 0, y: 0 });
    }
    setZoom(newZoom);
  };

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setZoom(1);
        setImagePosition({ x: 0, y: 0 });
        setIsPanning(false);
      }, 150);
    }
  }, [isOpen]);

  const handleMouseDown = (e: React.MouseEvent<HTMLImageElement>) => {
    if (zoom <= 1) return;
    e.preventDefault();
    setIsPanning(true);
    setStartPanPosition({
      x: e.clientX - imagePosition.x,
      y: e.clientY - imagePosition.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPanning || zoom <= 1) return;
    e.preventDefault();
    setImagePosition({
      x: e.clientX - startPanPosition.x,
      y: e.clientY - startPanPosition.y,
    });
  };

  const handleMouseUpOrLeave = () => {
    setIsPanning(false);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLImageElement>) => {
    if (e.touches.length === 2) {
      initialPinchDistanceRef.current = getDistance(e.touches);
      initialZoomRef.current = zoom;
      setIsPanning(false);
    } else if (e.touches.length === 1 && zoom > 1) {
      const touch = e.touches[0];
      setIsPanning(true);
      setStartPanPosition({
        x: touch.clientX - imagePosition.x,
        y: touch.clientY - imagePosition.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      if (initialPinchDistanceRef.current <= 0) return;
      const newDistance = getDistance(e.touches);
      const scale = newDistance / initialPinchDistanceRef.current;
      const newZoom = Math.max(0.5, Math.min(initialZoomRef.current * scale, 3));
      setZoom(newZoom);
      if (newZoom <= 1) {
        setImagePosition({ x: 0, y: 0 });
      }
    } else if (e.touches.length === 1 && isPanning && zoom > 1) {
      const touch = e.touches[0];
      setImagePosition({
        x: touch.clientX - startPanPosition.x,
        y: touch.clientY - startPanPosition.y,
      });
    }
  };

  const handleTouchEnd = () => {
    setIsPanning(false);
    initialPinchDistanceRef.current = 0;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-full h-full max-w-[95vw] max-h-[95vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b flex flex-row items-center justify-between">
          <DialogTitle>{fileName}</DialogTitle>
          <div className="flex items-center gap-2">
            {fileType === 'image' && (
              <>
                <Button variant="outline" size="icon" onClick={handleZoomOut} disabled={zoom <= 0.5}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={handleZoomIn} disabled={zoom >= 3}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </>
            )}
            <Button
              variant="outline"
              size="icon"
              onClick={() => onOpenChange(false)}
              aria-label="Fechar"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        <div 
          className="flex-grow overflow-hidden"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {fileType === 'image' ? (
            <div className="w-full h-full flex items-center justify-center p-4 bg-muted/20">
              <img 
                src={fileUrl} 
                alt={fileName} 
                className="rounded-md object-contain transition-transform duration-200"
                style={{ 
                  transform: `translate(${imagePosition.x}px, ${imagePosition.y}px) scale(${zoom})`,
                  cursor: zoom > 1 ? (isPanning ? 'grabbing' : 'grab') : 'default',
                  touchAction: 'none',
                  maxWidth: '100%', 
                  maxHeight: '100%'
                }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                draggable="false"
              />
            </div>
          ) : fileType === 'document' ? (
            <iframe src={fileUrl} className="w-full h-full border-none" title={fileName}>
              Seu navegador não suporta iframes. Você pode <a href={fileUrl} target="_blank" rel="noopener noreferrer">baixar o arquivo</a>.
            </iframe>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground p-4">
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
                    <div className="min-w-0 flex-1 flex items-center justify-between">
                      {/* AQUI: O nome do arquivo é exibido diretamente, sem um parágrafo extra */}
                      <p className="text-sm font-medium truncate pr-2 flex-1 min-w-0">{stripUuidFromFile(att.name)}</p>
                      
                      {/* Botão de Excluir agora sempre visível */}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={(e) => {
                          e.stopPropagation(); // Previne que o clique abra a visualização
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