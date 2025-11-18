export const serviceOrderStatuses = [
  "POR INICIAR",
  "INICIADA",
  "PARA ORÇAMENTO",
  "ORÇAMENTO ENVIADO",
  "AGUARDA PEÇAS",
  "PEÇAS RECEBIDAS",
  "CONCLUIDA",
  "CANCELADA",
] as const;

export type ServiceOrderStatus = (typeof serviceOrderStatuses)[number];

export const statusCardClasses: Record<ServiceOrderStatus, string> = {
  "POR INICIAR": "status-por-iniciar",
  "INICIADA": "status-iniciada",
  "PARA ORÇAMENTO": "status-para-orcamento",
  "ORÇAMENTO ENVIADO": "status-orcamento-enviado",
  "AGUARDA PEÇAS": "status-aguarda-pecas",
  "PEÇAS RECEBIDAS": "status-pecas-recebidas",
  "CONCLUIDA": "status-concluida",
  "CANCELADA": "status-cancelada",
};

export const statusChartColors: Record<ServiceOrderStatus, string> = {
    'POR INICIAR': '#FF5722',
    'INICIADA': '#F1C40F',
    'PARA ORÇAMENTO': '#00E5FF',
    'ORÇAMENTO ENVIADO': '#CDDC39',
    'AGUARDA PEÇAS': '#E91E63',
    'PEÇAS RECEBIDAS': '#9C27B0',
    'CONCLUIDA': '#2ECC71',
    'CANCELADA': '#95A5A6',
};



export const getStatusBadgeVariant = (status: ServiceOrderStatus): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case "CONCLUIDA":
      return "default";
    case "INICIADA":
    case "PARA ORÇAMENTO":
    case "ORÇAMENTO ENVIADO":
    case "AGUARDA PEÇAS":
    case "PEÇAS RECEBIDAS":
      return "secondary";
    case "POR INICIAR":
      return "destructive";
    case "CANCELADA":
    default:
      return "outline";
  }
};

export const isActiveStatus = (status: ServiceOrderStatus): boolean => {
    return status !== 'CONCLUIDA' && status !== 'CANCELADA';
}