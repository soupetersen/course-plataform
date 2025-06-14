import { BookOpen } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-[#00224D] text-white py-12">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">EduPlatform</span>
            </div>
            <p className="text-gray-300">
              Transformando vidas atravÃ©s da educaÃ§Ã£o online de qualidade.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Cursos</h3>
            <ul className="space-y-2 text-gray-300">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Desenvolvimento Web
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Mobile
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Data Science
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  DevOps
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Empresa</h3>
            <ul className="space-y-2 text-gray-300">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Sobre
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Carreiras
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Contato
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Suporte</h3>
            <ul className="space-y-2 text-gray-300">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Central de Ajuda
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Termos de Uso
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  PolÃ­tica de Privacidade
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; 2025 EduPlatform. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};
