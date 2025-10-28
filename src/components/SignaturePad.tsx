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
  const [hasSigned, setHasSigned] = useState(!!initialSignature);

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
    setHasSigned(true);
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
        onSign(canvas.toDataURL());
      }
    }
  }, [isDrawing, onSign]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        onSign(''); // Limpa a assinatura no formulário pai
        setHasSigned(false);
      }
    }
  }, [onSign]);

  // Função para desenhar a imagem no canvas
  const drawInitialSignature = useCallback((signature: string | undefined) => {
    const canvas = canvasRef.current;
    if (canvas && signature) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Limpa antes de desenhar
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const img = new Image();
        img.onload = () => {
          // Desenha a imagem ajustando ao tamanho atual do canvas
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = signature;
      }
    }
  }, []);

  // Efeito para carregar a assinatura inicial e ajustar o tamanho do canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const setCanvasSize = () => {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        
        // Recarrega a assinatura após redimensionar
        if (initialSignature) {
            drawInitialSignature(initialSignature);
        }
    };

    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    // Eventos de Mouse
    canvas.addEventListener('mousedown', startDrawing as any);
    canvas.addEventListener('mousemove', draw as any);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);

    // Eventos de Toque
    canvas.addEventListener('touchstart', startDrawing as any);
    canvas.addEventListener('touchmove', draw as any);
    canvas.addEventListener('touchend', stopDrawing);
    canvas.addEventListener('touchcancel', stopDrawing);

    return () => {
      window.removeEventListener('resize', setCanvasSize);
      canvas.removeEventListener('mousedown', startDrawing as any);
      canvas.removeEventListener('mousemove', draw as any);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseleave', stopDrawing);
      canvas.removeEventListener('touchstart', startDrawing as any);
      canvas.removeEventListener('touchmove', draw as any);
      canvas.removeEventListener('touchend', stopDrawing);
      canvas.removeEventListener('touchcancel', stopDrawing);
    };
  }, [startDrawing, draw, stopDrawing, initialSignature, drawInitialSignature]); // Adicionado drawInitialSignature como dependência

  // Efeito para atualizar o estado hasSigned quando initialSignature muda
  useEffect(() => {
    setHasSigned(!!initialSignature);
    if (initialSignature) {
        drawInitialSignature(initialSignature);
    }
  }, [initialSignature, drawInitialSignature]);


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
          style={{ touchAction: 'none' }} // Previne o scroll da página em dispositivos móveis
        />
        {!hasSigned && !disabled && (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground pointer-events-none">
                Assine aqui
            </div>
        )}
        {hasSigned && (
            <div className="absolute top-2 right-2 text-green-600">
                <Check className="h-5 w-5" />
            </div>
        )}
      </div>
      <div className="flex justify-end">
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={clearCanvas} 
          disabled={disabled || !hasSigned}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Limpar Assinatura
        </Button>
      </div>
    </div>
  );
};

export default SignaturePad;