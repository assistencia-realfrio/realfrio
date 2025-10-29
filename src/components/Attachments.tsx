import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, Image, Trash2, Download, Eye } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface Attachment {
  id: number;
  name: string;
  type: 'image' | 'document';
  size: string;
  uploadedBy: string;
  date: string;
  fileUrl: string; // Novo campo para a URL do arquivo
}

interface AttachmentsProps {
  orderId: string;
}

// Componente para a visualização do anexo em popup
const AttachmentPreviewDialog: React.FC<{
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  fileUrl: string;
  fileType: 'image' | 'document';
  fileName: string;
}> = ({ isOpen, onOpenChange, fileUrl, fileType, fileName }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{fileName}</DialogTitle>
        </DialogHeader>
        <div className="flex-grow overflow-auto p-2">
          {fileType === 'image' ? (
            <AspectRatio ratio={16 / 9} className="bg-muted">
              <img src={fileUrl} alt={fileName} className="rounded-md object-contain w-full h-full" />
            </AspectRatio>
          ) : ( // Assumimos que 'document' é PDF para visualização
            <iframe src={fileUrl} className="w-full h-full border-none" title={fileName}>
              Seu navegador não suporta iframes. Você pode <a href={fileUrl} target="_blank" rel="noopener noreferrer">baixar o arquivo</a>.
            </iframe>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};


const Attachments: React.FC<AttachmentsProps> = ({ orderId }) => {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewFileUrl, setPreviewFileUrl] = useState("");
  const [previewFileType, setPreviewFileType] = useState<'image' | 'document'>('document');
  const [previewFileName, setPreviewFileName] = useState("");

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

    const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
    let attachmentType: 'image' | 'document';
    let simulatedFileUrl: string;

    if (['jpg', 'jpeg', 'png'].includes(fileExtension || '')) {
      attachmentType = 'image';
      // Para simulação, podemos usar um placeholder ou uma URL de imagem real
      simulatedFileUrl = URL.createObjectURL(selectedFile); // Cria uma URL temporária para o arquivo selecionado
    } else if (fileExtension === 'pdf') {
      attachmentType = 'document';
      simulatedFileUrl = URL.createObjectURL(selectedFile); // Cria uma URL temporária para o arquivo selecionado
    } else {
      attachmentType = 'document'; // Default para outros tipos de documento
      simulatedFileUrl = '#'; // Sem visualização para outros tipos, apenas download simulado
      showError("Tipo de arquivo não suportado para visualização. Apenas JPG, JPEG, PNG e PDF.");
    }

    const newAttachment: Attachment = {
      id: attachments.length + 1,
      name: selectedFile.name,
      type: attachmentType,
      size: (selectedFile.size / 1024 / 1024).toFixed(2) + " MB",
      uploadedBy: "Usuário Atual",
      date: new Date().toISOString().split('T')[0],
      fileUrl: simulatedFileUrl,
    };

    setAttachments([...attachments, newAttachment]);
    setSelectedFile(null);
    showSuccess(`Arquivo '${newAttachment.name}' anexado com sucesso!`);
  };

  const handleDelete = (id: number) => {
    setAttachments(attachments.filter(att => att.id !== id));
    showSuccess("Anexo removido.");
  };

  const handlePreview = (attachment: Attachment) => {
    const fileExtension = attachment.name.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png'].includes(fileExtension || '')) {
      setPreviewFileType('image');
      setPreviewFileUrl(attachment.fileUrl);
      setPreviewFileName(attachment.name);
      setIsPreviewModalOpen(true);
    } else if (fileExtension === 'pdf') {
      setPreviewFileType('document');
      setPreviewFileUrl(attachment.fileUrl);
      setPreviewFileName(attachment.name);
      setIsPreviewModalOpen(true);
    } else {
      showError("Este tipo de arquivo não pode ser visualizado diretamente. Tente fazer o download.");
    }
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
                  <div className="flex items-center space-x-3 min-w-0"> {/* Adicionado min-w-0 */}
                    {getFileIcon(att.type)}
                    <div className="min-w-0"> {/* Adicionado min-w-0 */}
                      <p className="font-medium text-sm truncate">{att.name}</p> {/* Adicionado truncate */}
                      <p className="text-xs text-muted-foreground truncate"> {/* Adicionado truncate */}
                        {att.size} | Por {att.uploadedBy} em {att.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2 flex-shrink-0"> {/* Adicionado flex-shrink-0 */}
                    <Button variant="ghost" size="icon" onClick={() => handlePreview(att)} aria-label="Visualizar">
                        <Eye className="h-4 w-4" />
                    </Button>
                    <a href={att.fileUrl} download={att.name} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="icon" aria-label="Download">
                            <Download className="h-4 w-4" />
                        </Button>
                    </a>
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

      {/* Componente de Visualização de Anexo */}
      <AttachmentPreviewDialog
        isOpen={isPreviewModalOpen}
        onOpenChange={setIsPreviewModalOpen}
        fileUrl={previewFileUrl}
        fileType={previewFileType}
        fileName={previewFileName}
      />
    </Card>
  );
};

export default Attachments;