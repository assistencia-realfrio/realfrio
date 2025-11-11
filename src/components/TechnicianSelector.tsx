import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTechnicians } from "@/hooks/useTechnicians";
import { Skeleton } from "@/components/ui/skeleton";
import { User } from "lucide-react";

interface TechnicianSelectorProps {
  value: string | undefined; // ID do técnico (UUID)
  onChange: (technicianId: string) => void;
  disabled?: boolean;
}

const TechnicianSelector: React.FC<TechnicianSelectorProps> = ({ value, onChange, disabled = false }) => {
  const { data: technicians, isLoading } = useTechnicians();

  if (isLoading) {
    return <Skeleton className="h-10 w-full" />;
  }

  return (
    <Select onValueChange={onChange} value={value} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder="Selecione o Técnico" />
      </SelectTrigger>
      <SelectContent>
        {technicians?.map((technician) => (
          <SelectItem key={technician.id} value={technician.id}>
            <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                {technician.full_name}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default TechnicianSelector;