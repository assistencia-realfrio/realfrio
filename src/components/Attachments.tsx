import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, Image, Trash2, Download } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";

interface Attachment {
  id: number;
  name: string;
  type: 'image' | 'document';
  size: string;
  uploadedBy: string;
  date: string;
}

interface AttachmentsProps {
  orderId: string;
}

// Mock Data
const mockAttachments: Attachment[] = [
  { id: 1, name: "Foto_Compressor_Quebrado.jpg", type: 'image', size: "1.2 MB", uploadedBy: "João Técnico", date: "2024-10-29" },
  { id: 2, name: "Relatorio_Diagnostico.pdf", type: 'document', size: "350 KB", uploadedBy: "João Técnico", date: "2024-10-29" },
];

const Attachments: React.FC<AttachmentsProps> = ({ orderId }) => {
  const [attachments, setAttachments] = useState<Attachment[]>(mockAttachments);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) {
      showError("Selecione um arquivo para anexar.");
      return;
    }

    // Simulação de upload
    const newAttachment: Attachment = {
      id: attachments.length + 1,
      name: selectedFile.name,
      type: selectedFile.type.startsWith('image/') ? 'image' : 'document',
      size: (selectedFile.size / 1024 / 1024).toFixed(2) + " MB",
      uploadedBy: "Usuário Atual",
      date: new Date().toISOString().split('T')[0],
    };

    setAttachments([...attachments, newAttachment]);
    setSelectedFile(null);
    showSuccess(`Arquivo '${newAttachment.name}' anexado com sucesso!`);
  };

  const handleDelete = (id: number) => {
    setAttachments(attachments.filter(att => att.id !== id));
    showSuccess("Anexo removido.");
  };

  const getFileIcon = (type: Attachment['type']) => {
    if (type === 'image') {
      return <Image className="h-5 w-5 text-blue-500" />;
    }
    return <FileText className="h-5 w-5 text-gray-500" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Anexos (OS: {orderId})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Formulário de Upload */}
        <div className="space-y-3 border p-4 rounded-md">
          <Label htmlFor="file-upload">Adicionar Novo Anexo</Label>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input 
              id="file-upload" 
              type="file" 
              onChange={handleFileChange} 
              className="flex-grow"
            />
            <Button 
              onClick={handleUpload} 
              disabled={!selectedFile}
              className="sm:w-auto w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </div>
          {selectedFile && (
            <p className="text-sm text-muted-foreground">Arquivo selecionado: {selectedFile.name}</p>
          )}
        </div>

        {/* Lista de Anexos */}
        <div className="space-y-3">
          <h4 className="text-md font-semibold">Arquivos Anexados:</h4>
          {attachments.length > 0 ? (
            <div className="divide-y">
              {attachments.map((att) => (
                <div key={att.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getFileIcon(att.type)}
                    <div>
                      <p className="font-medium text-sm">{att.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {att.size} | Por {att.uploadedBy} em {att.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="icon" aria-label="Download">
                        <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(att.id)} aria-label="Remover">
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground text-sm">Nenhum anexo encontrado.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Attachments;