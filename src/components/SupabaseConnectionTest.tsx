import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError, showLoading, dismissToast } from '@/utils/toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

const SupabaseConnectionTest: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');

  const testConnection = async () => {
    setStatus('loading');
    setMessage('Testando conexão com Supabase...');
    const toastId = showLoading('Testando conexão com Supabase...');

    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        throw error;
      }

      if (session) {
        setStatus('success');
        setMessage('Conexão Supabase bem-sucedida! Sessão ativa encontrada.');
        showSuccess('Conexão Supabase bem-sucedida! Sessão ativa encontrada.');
      } else {
        setStatus('success');
        setMessage('Conexão Supabase bem-sucedida! Nenhuma sessão ativa.');
        showSuccess('Conexão Supabase bem-sucedida! Nenhuma sessão ativa.');
      }
    } catch (err: any) {
      setStatus('error');
      setMessage(`Erro na conexão Supabase: ${err.message || 'Erro desconhecido'}`);
      showError(`Erro na conexão Supabase: ${err.message || 'Erro desconhecido'}`);
      console.error('Supabase connection test error:', err);
    } finally {
      dismissToast(toastId);
    }
  };

  useEffect(() => {
    testConnection(); // Testa a conexão automaticamente ao montar o componente
  }, []);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {status === 'loading' && <Loader2 className="h-5 w-5 animate-spin text-blue-500" />}
          {status === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
          {status === 'error' && <XCircle className="h-5 w-5 text-red-500" />}
          Teste de Conexão Supabase
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{message}</p>
        <Button onClick={testConnection} disabled={status === 'loading'} className="w-full">
          {status === 'loading' ? 'Testando...' : 'Testar Novamente'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SupabaseConnectionTest;