import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, MapPin, User, Edit, Trash2 } from "lucide-react";
import { Establishment } from "@/hooks/useClientEstablishments";

interface EstablishmentCardProps {
  establishment: Establishment;
  onEdit: (establishment: Establishment) => void;
  onDelete: (id: string) => void;
  isPending: boolean;
}

const EstablishmentCard: React.FC<EstablishmentCardProps> = ({ establishment, onEdit, onDelete, isPending }) => {
  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <Building className="h-5 w-5 text-primary flex-shrink-0" />
            <h3 className="font-semibold text-lg">{establishment.name}</h3>
          </div>
          <div className="flex space-x-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(establishment)} disabled={isPending}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onDelete(establishment.id)} disabled={isPending}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="space-y-2 text-sm text-muted-foreground pl-8">
          {establishment.address && (
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <p className="whitespace-pre-wrap">{establishment.address}</p>
            </div>
          )}
          {establishment.contact_person && (
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 flex-shrink-0" />
              <p>{establishment.contact_person}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EstablishmentCard;