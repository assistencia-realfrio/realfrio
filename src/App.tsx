import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ServiceOrders from "./pages/ServiceOrders"; // A nova página de Ordens de Serviço
import Clients from "./pages/Clients"; // A nova página de Clientes
import NotFound from "./pages/NotFound";
import ServiceOrderDetails from "./pages/ServiceOrderDetails";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import ClientDetails from "./pages/ClientDetails";
import Equipments from "./pages/Equipments";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Rotas Protegidas */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <ServiceOrders /> {/* Página inicial agora é Ordens de Serviço */}
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/clients" 
            element={
              <ProtectedRoute>
                <Clients /> {/* Nova rota para a página de Clientes */}
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/clients/:id" 
            element={
              <ProtectedRoute>
                <ClientDetails /> {/* Rota para detalhes do cliente */}
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/equipments" 
            element={
              <ProtectedRoute>
                <Equipments />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/orders/:id" 
            element={
              <ProtectedRoute>
                <ServiceOrderDetails />
              </ProtectedRoute>
            } 
          />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;