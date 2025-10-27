import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index"; // A nova página inicial com abas
import NotFound from "./pages/NotFound";
import ServiceOrderDetails from "./pages/ServiceOrderDetails"; // Detalhes de OS ainda é uma página
import ClientDetails from "./pages/ClientDetails"; // NOVA PÁGINA: Detalhes do Cliente
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard"; // Mantendo o Dashboard como uma página separada

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
                <Index /> {/* Nova página inicial com abas para OS e Clientes */}
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard /> {/* Dashboard continua sendo uma página separada */}
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
          {/* NOVA ROTA PARA DETALHES DO CLIENTE */}
          <Route 
            path="/clients/:id" 
            element={
              <ProtectedRoute>
                <ClientDetails />
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