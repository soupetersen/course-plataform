import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Play, ArrowRight, Globe } from "lucide-react";

export const HeroSection = () => {
  return (
    <section className="section-padding hero-gradient">
      <div className="container text-center">
        <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 animate-in fade-in duration-700">
          🚀 Plataforma em crescimento - Junte-se aos primeiros alunos
        </Badge>
        <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-200">
          Transforme sua carreira com
          <span className="gradient-text"> cursos online</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto animate-in slide-in-from-bottom-6 fade-in duration-800 delay-400">
          Aprenda as tecnologias mais demandadas do mercado com instrutores
          especialistas. Do básico ao avançado, com certificados e suporte
          completo.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-in slide-in-from-bottom-4 fade-in duration-600 delay-600">
          <Link to="/courses">
            <Button
              size="lg"
              className="btn-gradient px-8 py-6 text-lg group hover:scale-105 transition-transform"
            >
              <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
              Explorar Cursos
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>

          <Button
            size="lg"
            variant="outline"
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-6 text-lg hover:scale-105 transition-all"
          >
            <Globe className="mr-2 h-5 w-5" />
            Aula Gratuita
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto animate-in slide-in-from-bottom-6 fade-in duration-800 delay-800">
          <div className="text-center group hover:scale-110 transition-transform cursor-default">
            <div className="text-3xl font-bold text-primary">100%</div>
            <div className="text-muted-foreground">Online</div>
          </div>
          <div className="text-center group hover:scale-110 transition-transform cursor-default">
            <div className="text-3xl font-bold text-primary">24/7</div>
            <div className="text-muted-foreground">Acesso</div>
          </div>
          <div className="text-center group hover:scale-110 transition-transform cursor-default">
            <div className="text-3xl font-bold text-primary">∞</div>
            <div className="text-muted-foreground">Revisões</div>
          </div>
        </div>
      </div>
    </section>
  );
};
