import React from "react";
import { Wrench, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DesktopSidebar, MobileSidebar } from "@/components/SidebarNav"; // Importando componentes da Sidebar

interface LayoutProps {
  children: React.ReactNode;
}

const Header = () => (
  <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
      <div className="flex items-center space-x-4">
        <MobileSidebar /> {/* Menu hamburguer visível em mobile */}
        <div className="hidden lg:flex items-center space-x-4">
          <Wrench className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold tracking-tight">Gestão de OS</h1>
        </div>
        <div className="lg:hidden flex items-center space-x-2">
          <Wrench className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-bold tracking-tight">Gestão de OS</h1>
        </div>
      </div>
      <nav className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" aria-label="Notificações">
          <Bell className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Perfil do Usuário">
          <User className="h-5 w-5" />
        </Button>
      </nav>
    </div>
  </header>
);

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