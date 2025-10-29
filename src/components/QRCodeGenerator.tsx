import React, { useRef } from 'react';
import QRCode from 'qrcode.react'; // Corrigido para importação padrão
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import { showSuccess, showError } from '@/utils/toast';

interface QRCodeGeneratorProps {
  entityType: 'clients' | 'orders' | 'equipments';
  entityId: string;
  entityName: string;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ entityType, entityId, entityName }) => {
  // A URL que o QR code irá codificar. Usamos a rota interna da aplicação.
  // O domínio base será adicionado automaticamente pelo navegador.
  const qrCodeValue = `${window.location.origin}/${entityType}/${entityId}`;
  const qrCodeRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (qrCodeRef.current) {
      try {
        const dataUrl = await htmlToImage.toPng(qrCodeRef.current, {
          backgroundColor: '#ffffff', // Fundo branco para o QR code
        });
        const link = document.createElement('a');
        link.download = `qrcode-${entityType}-${entityName.replace(/\s/g, '-')}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showSuccess("QR Code baixado com sucesso!");
      } catch (error) {
        console.error("Erro ao baixar QR Code:", error);
        showError("Erro ao baixar QR Code. Tente novamente.");
      }
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-4">
      <p className="text-sm text-muted-foreground">QR Code para: <span className="font-medium text-foreground">{entityName}</span></p>
      <div ref={qrCodeRef} className="p-2 bg-white rounded-lg shadow-md">
        <QRCode
          value={qrCodeValue}
          size={256}
          level="H"
          renderAs="svg"
          fgColor="#000000"
          bgColor="#ffffff"
        />
      </div>
      <Button onClick={handleDownload} className="w-full">
        <Download className="mr-2 h-4 w-4" />
        Baixar QR Code
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        Este QR Code direciona para: <a href={qrCodeValue} target="_blank" rel="noopener noreferrer" className="underline">{qrCodeValue}</a>
      </p>
    </div>
  );
};

export default QRCodeGenerator;