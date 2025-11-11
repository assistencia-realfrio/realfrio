import React, { useState } from "react";
import Layout from "@/components/Layout";
import { useProfile } from "@/hooks/useProfile";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, User } from "lucide-react";
import ProfileForm from "@/components/ProfileForm";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Profile: React.FC = () => {
  const { profile, isLoading } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-64 w-full" />
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Perfil não encontrado</h2>
          <p className="text-muted-foreground">Não foi possível carregar os dados do seu perfil.</p>
          <Button onClick={() => navigate('/')} className="mt-4">Voltar para o Início</Button>
        </div>
      </Layout>
    );
  }

  const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Meu Perfil</h2>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg">Informações do Perfil</CardTitle>
            {!isEditing && (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar Perfil
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <ProfileForm 
                initialData={profile} 
                onSuccess={() => setIsEditing(false)} 
                onCancel={() => setIsEditing(false)} 
              />
            ) : (
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Nome Completo</p>
                  <p className="font-medium">{fullName || 'Não definido'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{profile.id}</p> {/* O ID do perfil é o email do utilizador */}
                </div>
                {/* Adicionar mais campos do perfil aqui se existirem */}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Adicionar ActivityLog para o perfil se desejar */}
        {/* <ActivityLog entityType="profile" entityId={profile.id} /> */}
      </div>
    </Layout>
  );
};

export default Profile;