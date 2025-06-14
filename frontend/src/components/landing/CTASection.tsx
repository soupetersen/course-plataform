import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { Trophy, BookOpen } from "lucide-react";

export const CTASection = () => {
  return (
    <section className="section-padding bg-gradient-to-r from-primary to-secondary">
      <div className="container text-center">
        <h2 className="text-4xl font-bold text-white mb-4 fade-in">
          Pronto para comeÃ§ar sua jornada?
        </h2>
        <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto fade-in-up">
          Junte-se a milhares de estudantes que jÃ¡ transformaram suas carreiras
          conosco
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center fade-in-up">
          <Link to="/register">
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-gray-100 px-8 py-6 text-lg font-semibold"
            >
              <Trophy className="mr-2 h-5 w-5" />
              ComeÃ§ar Agora
            </Button>
          </Link>

          <Link to="/courses">
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-gray-100 px-8 py-6 text-lg font-semibold"
            >
              <BookOpen className="mr-2 h-5 w-5" />
              Explorar Cursos
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
