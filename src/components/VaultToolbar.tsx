import { useRef } from "react";
import { Plus, Download, Upload, Search, FileDown, FileText, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Props {
  search: string;
  isBusy: boolean;
  onSearchChange: (value: string) => void;
  onCreateEntry: () => void;
  onImportFile: (file: File) => void;
  onExportEncrypted: () => void;
  onExportPlaintext: () => void;
}

export function VaultToolbar({
  search,
  isBusy,
  onSearchChange,
  onCreateEntry,
  onImportFile,
  onExportEncrypted,
  onExportPlaintext,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) onImportFile(file);
    event.target.value = "";
  };

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Suchen..."
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button size="sm" onClick={onCreateEntry}>
            <Plus className="h-4 w-4 mr-1" /> Neu
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={isBusy}
            title="Importieren"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" disabled={isBusy} title="Exportieren">
                {isBusy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onExportEncrypted}>
                <FileDown className="h-4 w-4 mr-2" /> Verschlüsselt
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onExportPlaintext}>
                <FileText className="h-4 w-4 mr-2" /> Klartext
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />
    </>
  );
}
