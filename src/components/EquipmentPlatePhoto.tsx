import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Camera, Trash2, Eye, FileText } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils"; // Importar cn para usar classes responsivas

interface EquipmentPlatePhotoProps {
  equipmentId: string;
}

const BUCKET_NAME = 'equipment_plate_photos';
const FILE_NAME = 'plate_photo.jpg'; // Nome de arquivo fixo, pois só pode haver 1 por equipamento

const AttachmentPreviewDialog: React.FC<{
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  fileUrl: string;
  fileName: string;
}> = ({ isOpen, onOpenChange, fileUrl, fileName }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "max-w-[90vw] max-h-[90vh] flex flex-col",
        "sm:max-w-lg md:max-w-xl lg:max-w-3xl" // Mantém o tamanho limitado em desktop
      )}>
        <DialogHeader>
          <DialogTitle>{fileName}</DialogTitle>
        </DialogHeader>
        <div className="flex-grow overflow-auto p-0 flex items-center justify-center">
          {/* Remove AspectRatio e usa classes de imagem responsivas */}
          <img 
            src={fileUrl} 
            alt={fileName} 
            className="rounded-md object-contain w-full h-auto max-h-[80vh]" 
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

  const getUrlWithCacheBuster = (url: string) => {
    if (!url) return null;
    const timestamp = new Date().getTime();
    return `${url}?t=${timestamp}`;
  };

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
        // Se o arquivo existir, obtém a URL pública e adiciona o cachebuster
        const { data: publicUrlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
        setPhotoUrl(getUrlWithCacheBuster(publicUrlData.publicUrl));
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
      
      // Adiciona cachebuster para forçar o recarregamento
      setPhotoUrl(getUrlWithCacheBuster(publicUrlData.publicUrl));
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
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-12 h-12 flex-shrink-0 rounded-md overflow-hidden border">
                <img 
                  src={photoUrl} 
                  alt="Chapa de Características" 
                  className="object-cover w-full h-full" 
                  // Adicionado key para forçar o re-render se a URL mudar (mesmo com cachebuster)
                  key={photoUrl} 
                />
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