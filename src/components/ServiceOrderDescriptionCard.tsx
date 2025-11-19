import React from "react";
import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { ServiceOrderFormValues } from "./ServiceOrderForm"; // Importar o tipo do formulário

const ServiceOrderDescriptionCard: React.FC = () => {
  const form = useFormContext<ServiceOrderFormValues>();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Descrição do Serviço</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Detalhes do Serviço *</FormLabel>
              <FormControl>
                <Textarea placeholder="Detalhes do serviço..." {...field} rows={5} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
};

export default ServiceOrderDescriptionCard;