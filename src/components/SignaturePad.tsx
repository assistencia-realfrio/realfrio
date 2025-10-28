import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw, Check } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface SignaturePadProps {
  onSign: (dataUrl: string) => void;
  initialSignature?: string; // Data URL da assinatura existente
  disabled?: boolean;
}

const SignaturePad: React.FC<SignaturePadProps> = ({ onSign, initialSignature, disabled = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  // Internal state to hold the current signature drawn on canvas
  const [currentCanvasSignature, setCurrentCanvasSignature] = useState<string | undefined>(initialSignature);
  const [hasUnconfirmedChanges, setHasUnconfirmedChanges] = useState(false);

  // Function to draw an image on the canvas
  const drawSignatureOnCanvas = useCallback((signatureDataUrl: string | undefined) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear before drawing
        if (signatureDataUrl) {
          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          };
          img.src = signatureDataUrl;
        }
      }
    }
  }, []);

  // Function to set canvas dimensions and redraw if needed
  const setCanvasDimensions = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    // Only update if dimensions actually changed to prevent unnecessary redraws
    if (canvas.width !== rect.width || canvas.height !== rect.height) {
      canvas.width = rect.width;
      canvas.height = rect.height;
      // Redraw the current signature after resizing
      drawSignatureOnCanvas(currentCanvasSignature);
    }
  }, [currentCanvasSignature, drawSignatureOnCanvas]);


  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (disabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'black';
    ctx.lineCap = 'round';
    
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
    setHasUnconfirmedChanges(true); // Mark as having changes
  }, [disabled]);

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || disabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  }, [isDrawing, disabled]);

  const stopDrawing = useCallback(() => {
    if (isDrawing) {
      setIsDrawing(false);
      const canvas = canvasRef.current;
      if (canvas) {
        setCurrentCanvasSignature(canvas.toDataURL()); // Update internal state
      }
    }
  }, [isDrawing]);

  const handleClear = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    setCurrentCanvasSignature(undefined); // Clear internal state
    onSign(''); // Notify parent immediately that signature is cleared
    setHasUnconfirmedChanges(false);
  }, [onSign]);

  const handleConfirm = useCallback(() => {
    if (currentCanvasSignature) {
      onSign(currentCanvasSignature); // Pass the internal signature to the parent
      setHasUnconfirmedChanges(false);
    }
  }, [currentCanvasSignature, onSign]);

  // Effect for initial setup and event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setCanvasDimensions(); // Set initial size
    window.addEventListener('resize', setCanvasDimensions);

    // Mouse events
    canvas.addEventListener('mousedown', startDrawing as any);
    canvas.addEventListener('mousemove', draw as any);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);

    // Touch events
    canvas.addEventListener('touchstart', startDrawing as any);
    canvas.addEventListener('touchmove', draw as any);
    canvas.addEventListener('touchend', stopDrawing);
    canvas.addEventListener('touchcancel', stopDrawing);

    return () => {
      window.removeEventListener('resize', setCanvasDimensions);
      canvas.removeEventListener('mousedown', startDrawing as any);
      canvas.removeEventListener('mousemove', draw as any);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseleave', stopDrawing);
      canvas.removeEventListener('touchstart', startDrawing as any);
      canvas.removeEventListener('touchmove', draw as any);
      canvas.removeEventListener('touchend', stopDrawing);
      canvas.removeEventListener('touchcancel', stopDrawing);
    };
  }, [startDrawing, draw, stopDrawing, setCanvasDimensions]);

  // Effect to load initial signature or redraw when initialSignature prop changes
  useEffect(() => {
    setCurrentCanvasSignature(initialSignature);
    drawSignatureOnCanvas(initialSignature);
    setHasUnconfirmedChanges(false); // No unconfirmed changes on initial load
  }, [initialSignature, drawSignatureOnCanvas]);

  // Determine if the "Confirm" button should be visible
  const showConfirmButton = hasUnconfirmedChanges && !disabled && currentCanvasSignature;

  return (
    <div className="space-y-2">
      <Label>Assinatura do Cliente</Label>
      <div className={cn(
        "border border-dashed rounded-md bg-muted/30 relative",
        disabled ? "opacity-70 cursor-not-allowed" : "cursor-crosshair"
      )}>
        <canvas
          ref={canvasRef}
          className="w-full h-40"
          style={{ touchAction: 'none' }} // Prevents page scroll on mobile
        />
        {!currentCanvasSignature && !disabled && (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground pointer-events-none">
                Assine aqui
            </div>
        )}
        {currentCanvasSignature && !hasUnconfirmedChanges && (
            <div className="absolute top-2 right-2 text-green-600">
                <Check className="h-5 w-5" />
            </div>
        )}
      </div>
      <div className="flex justify-end space-x-2">
        {showConfirmButton && (
          <Button 
            type="button" 
            variant="default" 
            size="sm" 
            onClick={handleConfirm} 
            disabled={disabled}
          >
            <Check className="h-4 w-4 mr-2" />
            Confirmar Assinatura
          </Button>
        )}
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={handleClear} 
          disabled={disabled || !currentCanvasSignature}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Limpar Assinatura
        </Button>
      </div>
    </div>
  );
};

export default SignaturePad;