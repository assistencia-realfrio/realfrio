import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, MapPin, Edit, Trash2, Phone } from "lucide-react";
import { Establishment } from "@/hooks/useClientEstablishments";
import { isLinkClickable } from "@/lib/utils";

interface EstablishmentCardProps {
  establishment: Establishment;
  onEdit: (establishment: Establishment) => void;
  onDelete: (id: string) => void;
  isPending: boolean;
}

const EstablishmentCard: React.FC<EstablishmentCardProps> = ({ establishment, onEdit, onDelete, isPending }) => {
  const getMapHref = (mapsLink: string | null) => {
    if (!mapsLink) return "#";
    if (mapsLink.startsWith("http://") || mapsLink.startsWith("https://")) {
      return mapsLink;
    }
    if (/^-?\d+\.\d+,\s*-?\d+\.\d+/.test(mapsLink)) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsLink)}`;
    }
    return "#";
  };

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
          {establishment.locality && (
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <p className="whitespace-pre-wrap">{establishment.locality}</p>
            </div>
          )}
          {establishment.google_maps_link && isLinkClickable(establishment.google_maps_link) && (
             <a 
                href={getMapHref(establishment.google_maps_link)}
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-3 text-blue-600 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                <MapPin className="h-4 w-4" />
                Ver no Mapa
              </a>
          )}
          {establishment.phone && (
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 flex-shrink-0" />
              <a 
                href={`tel:${establishment.phone}`}
                className="text-blue-600 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {establishment.phone}
              </a>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EstablishmentCard;