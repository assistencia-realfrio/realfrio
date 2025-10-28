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
  // O estado hasSigned deve ser derivado do initialSignature para edição
  const [hasSigned, setHasSigned] = useState(!!initialSignature); 

  // Função para desenhar a imagem no canvas
  const drawSignatureOnCanvas = useCallback((signature: string | undefined) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Limpa o canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (signature) {
      const img = new Image();
      img.onload = () => {
        // Desenha a imagem ajustando ao tamanho atual do canvas
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = signature;
    }
  }, []);

  const setCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    // Define o tamanho do canvas para o tamanho real do elemento
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    // Recarrega a assinatura após redimensionar
    drawSignatureOnCanvas(initialSignature);
  }, [initialSignature, drawSignatureOnCanvas]);


  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (disabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configurações de desenho
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
        onSign(canvas.toDataURL()); // Salva a assinatura no estado pai
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

  // Efeito 1: Configuração inicial e listeners de eventos
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Configura o tamanho inicial e listeners de redimensionamento
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
  }, [startDrawing, draw, stopDrawing, setCanvasSize]);

  // Efeito 2: Carregamento da assinatura inicial e atualização do estado
  useEffect(() => {
    setHasSigned(!!initialSignature);
    // Desenha a assinatura sempre que o initialSignature mudar
    drawSignatureOnCanvas(initialSignature);
  }, [initialSignature, drawSignatureOnCanvas]);


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
      <div className="flex justify-end space-x-2">
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