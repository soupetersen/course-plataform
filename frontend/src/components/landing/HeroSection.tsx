import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Play, ArrowRight, Globe } from "lucide-react";

export const HeroSection = () => {
  return (
    <section className="section-padding hero-gradient">
      <div className="container text-center">
        {" "}
        <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 fade-in">
          🚀 Mais de 10.000 alunos já transformaram suas carreiras
        </Badge>
        <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 fade-in-up">
          Transforme sua carreira com
          <span className="gradient-text"> cursos online</span>
        </h1>{" "}
        <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto fade-in-up">
          Aprenda as tecnologias mais demandadas do mercado com instrutores
          especialistas. Do básico ao avançado, com certificados e suporte
          completo.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 fade-in-up">
          <Link to="/courses">
            <Button size="lg" className="btn-gradient px-8 py-6 text-lg">
              <Play className="mr-2 h-5 w-5" />
              Explorar Cursos
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>

          <Button
            size="lg"
            variant="outline"
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-6 text-lg"
          >
            <Globe className="mr-2 h-5 w-5" />
            Aula Gratuita
          </Button>
        </div>
        {}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto fade-in-up">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">10k+</div>
            <div className="text-muted-foreground">Alunos</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">50+</div>
            <div className="text-muted-foreground">Cursos</div>
          </div>{" "}
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">4.8⭐</div>
            <div className="text-muted-foreground">Avaliação</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">95%</div>
            <div className="text-muted-foreground">Satisfação</div>
          </div>
        </div>
      </div>
    </section>
  );
};
