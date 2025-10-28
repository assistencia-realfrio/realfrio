export const serviceOrderStatuses = [
  "POR INICIAR",
  "INICIADA",
  "PARA ORÇAMENTO",
  "ORÇAMENTO ENVIADO",
  "AGUARDA PEÇAS",
  "PEÇAS RECEBIDAS",
  "CONCLUÍDA",
  "CANCELADA",
] as const;

export type ServiceOrderStatus = typeof serviceOrderStatuses[number];

export const statusChartColors: Record<ServiceOrderStatus, string> = {
  "POR INICIAR": "#039BE5",
  "INICIADA": "#00ACC1",
  "PARA ORÇAMENTO": "#9C27B0",
  "ORÇAMENTO ENVIADO": "#F57C00",
  "AGUARDA PEÇAS": "#FF5722",
  "PEÇAS RECEBIDAS": "#E91E63",
  "CONCLUÍDA": "#4CAF50",
  "CANCELADA": "#475569",
};

export const getStatusBadgeVariant = (status: ServiceOrderStatus): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
        case 'CONCLUÍDA':
            return 'default';
        case 'CANCELADA':
            return 'destructive';
        case 'POR INICIAR':
        case 'INICIADA':
            return 'secondary';
        default:
            return 'outline';
    }
};

export const getStatusClass = (status: ServiceOrderStatus): string => {
  switch (status) {
    case "POR INICIAR":
      return "status-por-iniciar";
    case "INICIADA":
      return "status-iniciada";
    case "PARA ORÇAMENTO":
      return "status-para-orcamento";
    case "ORÇAMENTO ENVIADO":
      return "status-orcamento-enviado";
    case "AGUARDA PEÇAS":
      return "status-aguarda-pecas";
    case "PEÇAS RECEBIDAS":
      return "status-pecas-recebidas";
    case "CONCLUÍDA":
      return "status-concluida";
    case "CANCELADA":
      return "status-cancelada";
    default:
      return "";
  }
};

export const isActiveStatus = (status: ServiceOrderStatus): boolean => {
  return status !== "CONCLUÍDA" && status !== "CANCELADA";
};