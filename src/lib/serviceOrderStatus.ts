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
    'POR INICIAR': '#f1c40f',
    'INICIADA': '#ff5722',
    'PARA ORÇAMENTO': '#00e5ff',
    'ORÇAMENTO ENVIADO': '#cddc39',
    'AGUARDA PEÇAS': '#FF5722',
    'PEÇAS RECEBIDAS': '#E91E63',
    'CONCLUIDA': '#4CAF50',
    'CANCELADA': '#475569',
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