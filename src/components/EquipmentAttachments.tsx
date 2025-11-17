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

interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'document' | 'other';
  size: string;
  uploadedBy: string;
  date: string;
  fileUrl: string;
}

interface EquipmentAttachmentsProps {
  equipmentId: string;
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
          {fileType === 'image' && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={handleZoomOut} disabled={zoom <= 0.5}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleZoomIn} disabled={zoom >= 3}>
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
          )}
        </DialogHeader>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onOpenChange(false)}
          className="absolute top-2 right-2 z-50 rounded-full"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </Button>
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

  const fileInputRef = useRef<HTMLInputElement>(null);

  const bucketName = 'equipment_attachments';
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
        
        const { data: fileData } = await supabase.storage.from(bucketName).download(`${folderPath}/${file.name}`);
        let fileType: 'image' | 'document' | 'other' = 'other';
        if (fileData && fileData.type) {
          fileType = getFileType(fileData.type);
        } else if (file.name.match(/\.(jpeg|jpg|png)$/i)) {
          fileType = 'image';
        } else if (file.name.match(/\.pdf$/i)) {
          fileType = 'document';
        }

        return {
          id: `${folderPath}/${file.name}`,
          name: file.name,
          type: fileType,
          size: (file.metadata?.size / 1024 / 1024).toFixed(2) + " MB",
          uploadedBy: user.email || "Desconhecido",
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
      showSuccess(`Arquivo '${stripUuidFromFile(newAttachment.name)}' anexado ao equipamento com sucesso!`);
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
      showSuccess(`Anexo '${stripUuidFromFile(attachmentName)}' removido do equipamento.`);
    } catch (error) {
      console.error("Erro ao excluir anexo do equipamento:", error);
      showError("Erro ao remover anexo do equipamento. Tente novamente.");
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
              id="equipment-file-upload" 
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