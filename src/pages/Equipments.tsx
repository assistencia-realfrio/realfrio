import React, { useState } from "react";
import Layout from "@/components/Layout";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import EquipmentTable from "@/components/EquipmentTable";

const Equipments: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-3xl font-bold tracking-tight uppercase">Gestão de Equipamentos</h2>
        </div>

        <div className="flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-4">
          <div className="relative flex-grow w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
                placeholder="Buscar por nome, marca, modelo, cliente..." 
                className="pl-10" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <EquipmentTable searchTerm={searchTerm} />
      </div>
    </Layout>
  );
};

export default Equipments;