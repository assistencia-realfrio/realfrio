import React, { useState, useEffect } from "react";
import { Bell, User, LogOut, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DesktopSidebar, MobileSidebar } from "@/components/SidebarNav";
import { useSession } from "@/contexts/SessionContext";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from "@/utils/toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useNavigate } from "react-router-dom";
import { useActivities } from "@/hooks/useActivities";
import { GlobalSearch } from "@/components/GlobalSearch";
import { useProfile } from "@/hooks/useProfile"; // Importar o hook useProfile

interface LayoutProps {
  children: React.ReactNode;
}

const Header = () => {
  const { user } = useSession();
  const { profile, isLoading: isLoadingProfile } = useProfile(); // Usar o hook useProfile
  const navigate = useNavigate();
  const { data: activities, isLoading: isLoadingActivities } = useActivities();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsSearchOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      showError("Erro ao fazer logout.");
      console.error("Logout error:", error);
    } else {
      showSuccess("Logout realizado com sucesso!");
    }
  };

  const handleNotificationClick = (entityType: string, entityId: string) => {
    let path = '/';
    if (entityType === 'service_order') path = `/orders/${entityId}`;
    if (entityType === 'client') path = `/clients/${entityId}`;
    if (entityType === 'equipment') path = `/equipments/${entityId}`;
    navigate(path);
  };

  // Usar o nome do perfil se disponível, caso contrário, o e-mail
  const userName = (profile?.first_name || profile?.last_name) 
    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
    : user?.email || "Usuário";
  const displayEmail = user?.email;

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-card"> {/* Alterado aqui */}
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4">
            <MobileSidebar />
            <Link to="/" className="flex items-center space-x-2">
              <img src="/logo-REAL-FRIO.png" alt="Real Frio Logo" className="h-8" />
            </Link>
          </div>
          <nav className="flex items-center space-x-2 sm:space-x-4">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Pesquisa Global"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="h-5 w-5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Notificações" className="relative">
                  <Bell className="h-5 w-5" />
                  {activities && activities.length > 0 && (
                    <span className="absolute top-0.5 right-0.5 h-2 w-2 rounded-full bg-destructive" /> 
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Atividade Recente</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isLoadingActivities ? (
                  <DropdownMenuItem disabled>Carregando...</DropdownMenuItem>
                ) : activities && activities.length > 0 ? (
                  activities.map((activity, index) => (
                    <React.Fragment key={activity.id}>
                      <DropdownMenuItem 
                        onClick={() => handleNotificationClick(activity.entity_type, activity.entity_id)}
                        className="flex flex-col items-start space-y-1 cursor-pointer py-2"
                      >
                        <p className="text-sm text-foreground line-clamp-2">
                          {activity.content}
                        </p>
                        <p className="text-xs text-muted-foreground"> {/* Removido self-end */}
                          {activity.user_full_name} • {activity.time_ago}
                        </p>
                      </DropdownMenuItem>
                      {index < activities.length - 1 && <DropdownMenuSeparator />}
                    </React.Fragment>
                  ))
                ) : (
                  <DropdownMenuItem disabled>Nenhuma atividade recente.</DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Perfil do Usuário">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userName}</p>
                    {displayEmail && (
                      <p className="text-xs leading-none text-muted-foreground">
                        {displayEmail}
                      </p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Meu Perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </header>
      <GlobalSearch open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </>
  );
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <aside className="hidden lg:block w-64 border-r bg-sidebar sticky top-16 h-[calc(100vh-4rem)]">
          <DesktopSidebar />
        </aside>
        
        <main className="flex-grow p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;