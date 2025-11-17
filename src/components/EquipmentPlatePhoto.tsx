import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Camera, Trash2, Eye, FileText, ZoomIn, ZoomOut } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";
import { Skeleton } from "@/components/ui/skeleton";

interface EquipmentPlatePhotoProps {
  equipmentId: string;
}

const BUCKET_NAME = 'equipment_plate_photos';
const FILE_NAME = 'plate_photo.jpg'; // Nome de arquivo fixo, pois só pode haver 1 por equipamento

// Função auxiliar para adicionar cache-busting
const getCacheBustedUrl = (url: string): string => {
    const timestamp = new Date().getTime();
    const urlObj = new URL(url);
    urlObj.searchParams.set('t', timestamp.toString());
    return urlObj.toString();
};

const AttachmentPreviewDialog: React.FC<{
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  fileUrl: string;
  fileName: string;
}> = ({ isOpen, onOpenChange, fileUrl, fileName }) => {
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [startPanPosition, setStartPanPosition] = useState({ x: 0, y: 0 });
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });

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
    if (zoom <= 1) return;
    const touch = e.touches[0];
    setIsPanning(true);
    setStartPanPosition({
      x: touch.clientX - imagePosition.x,
      y: touch.clientY - imagePosition.y,
    });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isPanning || zoom <= 1) return;
    const touch = e.touches[0];
    setImagePosition({
      x: touch.clientX - startPanPosition.x,
      y: touch.clientY - startPanPosition.y,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-screen h-screen max-w-none p-0 bg-black/80 flex flex-col items-center justify-center border-none">
        <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleZoomOut} disabled={zoom <= 0.5}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleZoomIn} disabled={zoom >= 3}>
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
        <div 
          className="w-full h-full flex items-center justify-center overflow-hidden"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUpOrLeave}
        >
          <img 
            src={fileUrl} 
            alt={fileName} 
            className="object-contain transition-transform duration-200"
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
      </DialogContent>
    </Dialog>
  );
};

const EquipmentPlatePhoto: React.FC<EquipmentPlatePhotoProps> = ({ equipmentId }) => {
  const { user } = useSession();
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const filePath = `${equipmentId}/${FILE_NAME}`;

  const fetchPhoto = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Verifica se o arquivo existe listando o diretório
      const { data: listData, error: listError } = await supabase.storage.from(BUCKET_NAME).list(equipmentId, {
        limit: 1,
        search: FILE_NAME,
      });

      if (listError) throw listError;

      if (listData && listData.length > 0) {
        // Se o arquivo existir, obtém a URL pública e adiciona cache-busting
        const { data: publicUrlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
        setPhotoUrl(getCacheBustedUrl(publicUrlData.publicUrl));
      } else {
        setPhotoUrl(null);
      }
    } catch (error) {
      console.error("Erro ao buscar foto da chapa:", error);
      setPhotoUrl(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (equipmentId && user?.id) {
      fetchPhoto();
    }
  }, [equipmentId, user?.id]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      if (!file.type.startsWith('image/')) {
        showError("Por favor, selecione um arquivo de imagem.");
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
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
      // Usa upsert: true para substituir a foto existente
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: true, // Sobrescreve se existir
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
      
      // Atualiza o estado com a URL com cache-busting
      setPhotoUrl(getCacheBustedUrl(publicUrlData.publicUrl));
      
      setSelectedFile(null);
      showSuccess("Foto da chapa de características atualizada com sucesso!");
    } catch (error) {
      console.error("Erro ao fazer upload da foto da chapa:", error);
      showError("Erro ao anexar foto. Tente novamente.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!user?.id || !photoUrl) {
      showError("Você precisa estar logado para excluir arquivos.");
      return;
    }

    try {
      const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath]);

      if (error) throw error;

      setPhotoUrl(null);
      showSuccess("Foto da chapa de características removida.");
    } catch (error) {
      console.error("Erro ao excluir foto da chapa:", error);
      showError("Erro ao remover foto. Tente novamente.");
    }
  };

  const handlePreview = () => {
    if (photoUrl) {
      setIsPreviewModalOpen(true);
    }
  };

  if (isLoading) {
    return <Skeleton className="h-40 w-full" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Foto da Chapa de Características
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {photoUrl ? (
          <div className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 flex-shrink-0 rounded-md overflow-hidden border">
                {/* Usando a URL com cache-busting */}
                <img src={photoUrl} alt="Chapa de Características" className="object-cover w-full h-full" />
              </div>
              <p className="text-sm font-medium">Foto da Chapa Anexada</p>
            </div>
            <div className="flex space-x-2">
              <Button variant="ghost" size="icon" onClick={handlePreview} aria-label="Visualizar">
                <Eye className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleDelete} aria-label="Remover" disabled={isUploading}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 border p-4 rounded-md">
            <p className="text-sm text-muted-foreground">Nenhuma foto da chapa anexada.</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input 
                id="plate-photo-upload" 
                type="file" 
                accept="image/*"
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
                <FileText className="h-4 w-4 mr-2" /> {selectedFile ? selectedFile.name : "Selecionar Imagem"}
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
        )}
      </CardContent>

      <AttachmentPreviewDialog
        isOpen={isPreviewModalOpen}
        onOpenChange={setIsPreviewModalOpen}
        fileUrl={photoUrl || ""}
        fileName="Foto da Chapa de Características"
      />
    </Card>
  );
};

export default EquipmentPlatePhoto;