import React from "react";
import ReactMarkdown from "react-markdown";

interface TextContentProps {
  content: string;
  title?: string;
}

export const TextContent: React.FC<TextContentProps> = ({ content, title }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <span className="w-6 h-6 flex items-center justify-center bg-blue-100 text-blue-600 rounded">
            📄
          </span>
          {title}
        </h2>
      </div>

      <div className="p-6">
        {content ? (
          <div className="prose prose-lg max-w-none">
            <div className="leading-relaxed text-gray-700 markdown-content">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">📄</span>
            </div>
            <p className="text-lg font-medium mb-2">Conteúdo não disponível</p>
            <p className="text-sm">
              Entre em contato com o instrutor para mais informações
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

