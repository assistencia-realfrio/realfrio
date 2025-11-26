import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import { Client } from '@/hooks/useClients';

interface ClientHeaderProps {
  client: Client;
}

const ClientHeader: React.FC<ClientHeaderProps> = ({ client }) => {
  const subtitleParts: string[] = [];
  if (client.store) {
    subtitleParts.push(client.store);
  }
  if (client.locality) {
    subtitleParts.push(client.locality);
  }
  const subtitle = subtitleParts.join(' | ');

  return (
    <div className="flex items-center gap-4 p-4 bg-card rounded-lg shadow-sm mb-6">
      <Avatar className="h-16 w-16">
        {/* No avatar_url for client, so using a fallback icon */}
        <AvatarFallback className="bg-muted">
          <User className="h-8 w-8 text-muted-foreground" />
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col min-w-0">
        <h1 className="text-xl font-bold truncate uppercase">{client.name}</h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground truncate uppercase">{subtitle}</p>
        )}
      </div>
    </div>
  );
};

export default ClientHeader;