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

export const statusBgColors: Record<ServiceOrderStatus, string> = {
  "POR INICIAR": "bg-red-500/20",
  "INICIADA": "bg-yellow-500/20",
  "PARA ORÇAMENTO": "bg-amber-500/20",
  "ORÇAMENTO ENVIADO": "bg-orange-500/20",
  "AGUARDA PEÇAS": "bg-blue-500/20",
  "PEÇAS RECEBIDAS": "bg-indigo-500/20",
  "CONCLUIDA": "bg-green-500/20",
  "CANCELADA": "bg-slate-500/20",
};

export const statusChartColors: Record<ServiceOrderStatus, string> = {
    'POR INICIAR': '#ef4444', // red-500
    'INICIADA': '#eab308', // yellow-500
    'PARA ORÇAMENTO': '#f59e0b', // amber-500
    'ORÇAMENTO ENVIADO': '#f97316', // orange-500
    'AGUARDA PEÇAS': '#3b82f6', // blue-500
    'PEÇAS RECEBIDAS': '#6366f1', // indigo-500
    'CONCLUIDA': '#22c55e', // green-500
    'CANCELADA': '#64748b', // slate-500
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