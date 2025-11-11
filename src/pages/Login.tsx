import React from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/contexts/SessionContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Wrench } from 'lucide-react'; // Removido o ícone Wrench

const Login: React.FC = () => {
  const { session, isLoading } = useSession();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  // Se o usuário estiver logado, redireciona para a página inicial
  if (session) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          {/* Substituído o ícone Wrench pelo logo da empresa */}
          <img src="/logo-REAL-FRIO.png" alt="Real Frio Logo" className="h-16 mx-auto mb-2" />
          <CardTitle className="text-2xl font-bold">Gestão de Ordens de Serviço</CardTitle> {/* Título atualizado */}
          <p className="text-sm text-muted-foreground">Faça login para acessar o sistema.</p>
        </CardHeader>
        <CardContent>
          <Auth
            supabaseClient={supabase}
            providers={[]}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: 'hsl(var(--primary))',
                    brandAccent: 'hsl(var(--primary-foreground))',
                  },
                },
              },
            }}
            theme="light" // Usando tema claro para consistência com o design atual
            redirectTo={window.location.origin}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;