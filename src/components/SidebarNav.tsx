import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Wrench, Menu, Users, HardDrive, Calendar as CalendarIcon } from "lucide-react"; // Importar CalendarIcon
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Assistências", // Alterado de "Ordens de Serviço" para "Assistências"
    href: "/",
    icon: Wrench,
  },
  {
    title: "Clientes", // Novo item para a página de Clientes
    href: "/clients",
    icon: Users,
  },
  {
    title: "Equipamentos", // Adicionado item para a página de Equipamentos
    href: "/equipments",
    icon: HardDrive,
  },
  {
    title: "Calendário", // NOVO: Item para a página de calendário
    href: "/calendar",
    icon: CalendarIcon,
  },
];

interface NavLinkProps {
  item: typeof navItems[0];
  isMobile?: boolean;
  onClick?: () => void;
}

const NavLink: React.FC<NavLinkProps> = ({ item, isMobile = false, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === item.href;
  const Icon = item.icon;

  const baseClasses = "flex items-center gap-3 rounded-lg px-3 py-2 transition-all";
  
  const mobileActiveClasses = "bg-primary text-primary-foreground hover:bg-primary/90";
  const mobileInactiveClasses = "text-muted-foreground hover:text-foreground";

  const desktopActiveClasses = "bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/80";
  const desktopInactiveClasses = "text-sidebar-foreground hover:text-sidebar-primary";

  const activeClasses = isMobile ? mobileActiveClasses : desktopActiveClasses;
  const inactiveClasses = isMobile ? mobileInactiveClasses : desktopInactiveClasses;

  return (
    <Link
      to={item.href}
      onClick={onClick}
      className={cn(baseClasses, isActive ? activeClasses : inactiveClasses)}
    >
      <Icon className="h-5 w-5" />
      {item.title}
    </Link>
  );
};

const DesktopSidebar: React.FC = () => (
  <nav className="flex flex-col gap-1 p-4">
    {navItems.map((item) => (
      <NavLink key={item.title} item={item} isMobile={false} />
    ))}
  </nav>
);

const MobileSidebar: React.FC = () => {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col w-[250px] sm:w-[300px]">
        <div className="flex items-center space-x-2 p-4">
          <img src="/logo-REAL-FRIO.png" alt="Real Frio Logo" className="h-7" />
        </div>
        <Separator />
        <nav className="flex flex-col gap-1 p-4">
          {navItems.map((item) => (
            <NavLink key={item.title} item={item} isMobile={true} onClick={() => setOpen(false)} />
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export { DesktopSidebar, MobileSidebar };