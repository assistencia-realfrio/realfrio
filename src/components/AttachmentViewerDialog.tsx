import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ZoomIn, ZoomOut, X } from "lucide-react";

interface AttachmentViewerDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  fileUrl: string;
  fileType: 'image' | 'document' | 'other';
  fileName: string;
}

const getDistance = (touches: React.TouchList) => {
  return Math.sqrt(
    Math.pow(touches[0].clientX - touches[1].clientX, 2) +
    Math.pow(touches[0].clientY - touches[1].clientY, 2)
  );
};

const AttachmentViewerDialog: React.FC<AttachmentViewerDialogProps> = ({ isOpen, onOpenChange, fileUrl, fileType, fileName }) => {
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [startPanPosition, setStartPanPosition] = useState({ x: 0, y: 0 });
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const initialPinchDistanceRef = useRef(0);
  const initialZoomRef = useRef(1);

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
      // Resetar estado ao fechar
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

  const renderContent = () => {
    if (fileType === 'image') {
      return (
        <div 
          className="w-full h-full flex items-center justify-center overflow-hidden"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
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
            onMouseDown={handleMouseDown as any} // Casting para evitar erro de tipo no mouse down
            onTouchStart={handleTouchStart as any} // Casting para evitar erro de tipo no touch start
            draggable="false"
          />
        </div>
      );
    }

    if (fileType === 'document') {
      return (
        <iframe src={fileUrl} className="w-full h-full border-none" title={fileName}>
          Seu navegador não suporta iframes. Você pode <a href={fileUrl} target="_blank" rel="noopener noreferrer">baixar o arquivo</a>.
        </iframe>
      );
    }

    return (
      <div className="flex items-center justify-center h-full text-muted-foreground p-4">
        <p>Este tipo de arquivo não pode ser visualizado diretamente.</p>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-screen h-screen max-w-none p-0 bg-black/80 flex flex-col items-center justify-center border-none">
        <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
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
        
        <div className="absolute top-4 left-4 z-50 text-white max-w-[calc(100%-150px)] truncate">
            <h3 className="text-lg font-semibold truncate">{fileName}</h3>
        </div>

        <div className="w-full h-full pt-16 pb-4"> {/* Adicionado padding para o cabeçalho */}
            {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AttachmentViewerDialog;