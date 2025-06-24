import React from "react";
import MDEditor from "@uiw/react-md-editor";
import { Label } from "@/components/ui/label";

interface MDXEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  height?: number;
}

export const MDXEditor: React.FC<MDXEditorProps> = ({
  value,
  onChange,
  label = "Conteúdo",
  placeholder = "Digite o conteúdo da aula em Markdown...",
  error,
  height = 400,
}) => {
  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div
        className={`border rounded-lg overflow-hidden ${
          error ? "border-red-500" : ""
        }`}
      >
        <MDEditor
          value={value}
          onChange={(val) => onChange(val || "")}
          preview="edit"
          hideToolbar={false}
          textareaProps={{
            placeholder,
            style: {
              fontSize: 14,
              lineHeight: 1.6,
              fontFamily: '"Monaco", "Menlo", "Ubuntu Mono", monospace',
            },
          }}
          height={height}
          data-color-mode="light"
        />
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

      {/* Preview da sintaxe Markdown */}
      <div className="text-xs text-gray-500 mt-2 p-3 bg-gray-50 rounded border">
        <strong>Dicas de formatação:</strong>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
          <div>
            <code># Título</code> - Título principal
            <br />
            <code>## Subtítulo</code> - Subtítulo
            <br />
            <code>**negrito**</code> - <strong>negrito</strong>
            <br />
            <code>*itálico*</code> - <em>itálico</em>
          </div>
          <div>
            <code>- item</code> - Lista com marcadores
            <br />
            <code>1. item</code> - Lista numerada
            <br />
            <code>`código`</code> - <code>código inline</code>
            <br />
            <code>[link](url)</code> - Link
          </div>
        </div>
      </div>
    </div>
  );
};
