import React, { useState } from 'react';
import { QrReader } from 'react-qr-reader';
import { Button } from '@/components/ui/button';
import { AlertCircle, CameraOff, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { showError } from '@/utils/toast';

interface QRCodeScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onScan, onClose }) => {
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment'); // Câmera traseira por padrão

  const handleResult = (result: any, error: any) => {
    if (!!result) {
      onScan(result?.text);
    }
    if (!!error) {
      // console.info(error); // Para depuração, pode ser muito verboso
      if (error.name === "NotAllowedError" || error.name === "NotFoundError" || error.name === "NotReadableError") {
        setError("Permissão da câmera negada ou câmera não encontrada. Por favor, conceda acesso à câmera.");
      } else if (error.name === "OverconstrainedError") {
        setError("Não foi possível acessar a câmera com as configurações desejadas.");
      } else {
        setError("Erro ao acessar a câmera. Verifique as permissões e tente novamente.");
      }
      showError("Erro ao acessar a câmera. Verifique as permissões.");
    }
  };

  const toggleFacingMode = () => {
    setFacingMode(prevMode => (prevMode === 'user' ? 'environment' : 'user'));
    setError(null); // Limpa o erro ao trocar de câmera
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle>Ler QR Code</CardTitle>
        <CardDescription>Aponte a câmera para um QR Code de OS, Cliente ou Equipamento.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative w-full aspect-video bg-muted rounded-md overflow-hidden flex items-center justify-center">
          {error ? (
            <div className="text-center text-destructive p-4 flex flex-col items-center space-y-2">
              <AlertCircle className="h-8 w-8" />
              <p>{error}</p>
              <Button onClick={onClose} variant="outline">Fechar</Button>
            </div>
          ) : (
            <QrReader
              onResult={handleResult}
              constraints={{ facingMode: facingMode }}
              scanDelay={500} // Aumenta o delay para evitar múltiplas leituras rápidas
              videoContainerStyle={{ padding: '0', height: '100%', width: '100%' }}
              videoStyle={{ objectFit: 'cover' }}
              containerStyle={{ width: '100%', height: '100%', padding: '0' }}
            />
          )}
        </div>
        <div className="flex justify-center space-x-2">
          <Button onClick={toggleFacingMode} variant="outline" disabled={!!error}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Trocar Câmera
          </Button>
          <Button onClick={onClose} variant="secondary">
            <CameraOff className="mr-2 h-4 w-4" />
            Fechar Leitor
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QRCodeScanner;