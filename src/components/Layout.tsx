import React from "react";
import { Bell, User, LogOut } from "lucide-react"; // Removido Wrench
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
import { Link } from "react-router-dom"; // Importar Link

interface LayoutProps {
  children: React.ReactNode;
}

const Header = () => {
  const { user } = useSession();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      showError("Erro ao fazer logout.");
      console.error("Logout error:", error);
    } else {
      showSuccess("Logout realizado com sucesso!");
    }
  };

  // Tenta obter o nome do usuário (email ou metadata)
  const userName = user?.email || "Usuário";
  const displayEmail = user?.email;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-4">
          <MobileSidebar />
          <Link to="/orders" className="hidden lg:flex items-center space-x-2"> {/* Logo para desktop */}
            <img src="/logo-REAL-FRIO.png" alt="Real Frio Logo" className="h-8" />
          </Link>
          <Link to="/orders" className="lg:hidden flex items-center space-x-2"> {/* Logo para mobile */}
            <img src="/logo-REAL-FRIO.png" alt="Real Frio Logo" className="h-7" />
          </Link>
        </div>
        <nav className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" aria-label="Notificações">
            <Bell className="h-5 w-5" />
          </Button>
          
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
              <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>
  );
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        {/* Sidebar Desktop */}
        <aside className="hidden lg:block w-64 border-r bg-sidebar sticky top-16 h-[calc(100vh-4rem)]">
          <DesktopSidebar />
        </aside>
        
        {/* Main Content */}
        <main className="flex-grow p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;