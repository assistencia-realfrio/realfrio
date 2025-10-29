import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import QRCodeScanner from '@/components/QRCodeScanner';
import { showError } from '@/utils/toast';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const QRCodeScannerPage: React.FC = () => {
  const navigate = useNavigate();

  const handleScanResult = (data: string) => {
    console.log("QR Code Scanned:", data);
    // Esperamos que o QR code contenha uma URL como:
    // https://your-app-domain.com/clients/YOUR_CLIENT_ID
    // https://your-app-domain.com/orders/YOUR_ORDER_ID
    // https://your-app-domain.com/equipments/YOUR_EQUIPMENT_ID

    try {
      const url = new URL(data);
      const pathSegments = url.pathname.split('/').filter(segment => segment); // Remove segmentos vazios

      if (pathSegments.length === 2) { // Ex: ['clients', 'uuid']
        const [entityType, entityId] = pathSegments;
        if (['clients', 'orders', 'equipments'].includes(entityType)) {
          navigate(`/${entityType}/${entityId}`);
          return;
        }
      }
      showError("QR Code inválido ou não reconhecido.");
    } catch (e) {
      console.error("Erro ao processar QR Code:", e);
      showError("QR Code inválido ou formato inesperado.");
    }
  };

  const handleCloseScanner = () => {
    navigate(-1); // Volta para a página anterior
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={handleCloseScanner}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl font-bold tracking-tight">Leitor de QR Code</h2>
        </div>
        <div className="flex justify-center">
          <QRCodeScanner onScan={handleScanResult} onClose={handleCloseScanner} />
        </div>
      </div>
    </Layout>
  );
};

export default QRCodeScannerPage;