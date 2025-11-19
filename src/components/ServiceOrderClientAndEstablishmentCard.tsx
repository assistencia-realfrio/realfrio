import React from "react";
import { useFormContext } from "react-hook-form";
import { User, MapPin, Phone, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField, FormItem, FormMessage } from "@/components/ui/form";
import ClientSelector from "./ClientSelector";
import EstablishmentSelector from "./EstablishmentSelector";
import { useClients } from "@/hooks/useClients";
import { useEstablishmentDetails } from "@/hooks/useEstablishmentDetails";
import { isLinkClickable, cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { ServiceOrderFormValues } from "./ServiceOrderForm"; // Importar o tipo do formulário

interface ServiceOrderClientAndEstablishmentCardProps {
  isEditing: boolean;
  onEstablishmentChange: (id: string | null, name: string | null) => void;
}

// Função auxiliar para obter o link do mapa
const getMapHref = (mapsLink: string) => {
  if (mapsLink.startsWith("http://") || mapsLink.startsWith("https://")) {
    return mapsLink;
  }
  if (/^-?\d+\.\d+,\s*-?\d+\.\d+/.test(mapsLink)) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsLink)}`;
  }
  return "#";
};

const ServiceOrderClientAndEstablishmentCard: React.FC<ServiceOrderClientAndEstablishmentCardProps> = ({
  isEditing,
  onEstablishmentChange,
}) => {
  const form = useFormContext<ServiceOrderFormValues>();
  const navigate = useNavigate();

  const clientId = form.watch("client_id");
  const establishmentId = form.watch("establishment_id");

  const { clients } = useClients();
  const selectedClient = clients.find((c) => c.id === clientId);

  const { data: establishmentDetails } = useEstablishmentDetails(establishmentId);

  const clientHasMapLink = selectedClient?.maps_link && isLinkClickable(selectedClient.maps_link);
  const clientHasContact = selectedClient?.contact;

  const establishmentHasMapLink =
    establishmentDetails?.google_maps_link && isLinkClickable(establishmentDetails.google_maps_link);
  const establishmentHasPhone = establishmentDetails?.phone;

  const handleViewClientDetails = () => clientId && navigate(`/clients/${clientId}`);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Cliente e Local</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="client_id"
          render={({ field }) => (
            <FormItem>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="flex-grow w-full min-w-0">
                  <ClientSelector value={field.value} onChange={field.onChange} disabled={isEditing} />
                </div>
                <div className="flex gap-2 w-full sm:w-auto justify-start sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleViewClientDetails}
                    disabled={!field.value}
                    className="flex-1 sm:flex-none"
                    aria-label="Detalhes do Cliente"
                  >
                    <User className="h-4 w-4" />
                  </Button>
                  <a
                    href={clientHasMapLink ? getMapHref(selectedClient!.maps_link!) : "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => !clientHasMapLink && e.preventDefault()}
                  >
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      disabled={!clientHasMapLink}
                      className="flex-1 sm:flex-none"
                      aria-label="Ver no Mapa do Cliente"
                    >
                      <MapPin className={cn("h-4 w-4", clientHasMapLink ? "text-blue-600" : "")} />
                    </Button>
                  </a>
                  <a
                    href={clientHasContact ? `tel:${selectedClient!.contact!}` : "#"}
                    onClick={(e) => !clientHasContact && e.preventDefault()}
                  >
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      disabled={!clientHasContact}
                      className="flex-1 sm:flex-none"
                      aria-label="Ligar para o Cliente"
                    >
                      <Phone className={cn("h-4 w-4", clientHasContact ? "text-green-600" : "")} />
                    </Button>
                  </a>
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="establishment_id"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-2">
                <div className="flex-grow w-full min-w-0">
                  <EstablishmentSelector
                    clientId={clientId}
                    value={field.value}
                    onChange={onEstablishmentChange}
                  />
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <a
                    href={establishmentHasMapLink ? getMapHref(establishmentDetails!.google_maps_link!) : "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => !establishmentHasMapLink && e.preventDefault()}
                  >
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      disabled={!establishmentHasMapLink}
                      aria-label="Ver no Mapa do Estabelecimento"
                    >
                      <MapPin className={cn("h-4 w-4", establishmentHasMapLink ? "text-blue-600" : "")} />
                    </Button>
                  </a>
                  <a
                    href={establishmentHasPhone ? `tel:${establishmentDetails!.phone!}` : "#"}
                    onClick={(e) => !establishmentHasPhone && e.preventDefault()}
                  >
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      disabled={!establishmentHasPhone}
                      aria-label="Ligar para o Estabelecimento"
                    >
                      <Phone className={cn("h-4 w-4", establishmentHasPhone ? "text-green-600" : "")} />
                    </Button>
                  </a>
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
};

export default ServiceOrderClientAndEstablishmentCard;