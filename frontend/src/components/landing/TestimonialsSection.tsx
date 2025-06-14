import { Card, CardContent } from "../ui/card";
import { Star } from "lucide-react";

export const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Ana Carolina",
      role: "Desenvolvedora Frontend",
      content:
        "Os cursos me ajudaram a conseguir minha primeira vaga como dev. Conteúdo excelente!",
      rating: 5,
    },
    {
      name: "Carlos Mendes",
      role: "Freelancer",
      content:
        "Aprendi muito e consegui aumentar minha renda com projetos freelance.",
      rating: 5,
    },
    {
      name: "Beatriz Oliveira",
      role: "Product Manager",
      content:
        "Cursos bem estruturados que me deram a base para mudar de carreira.",
      rating: 5,
    },
  ];

  return (
    <section id="depoimentos" className="section-padding bg-card">
      <div className="container">
        <div className="text-center mb-16 fade-in">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            O que nossos alunos dizem
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Histórias reais de transformação e sucesso
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="border-none shadow-lg card-hover fade-in-up"
            >
              <CardContent className="p-6">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>

                <p className="text-muted-foreground mb-6 italic">
                  "{testimonial.content}"
                </p>

                <div>
                  <p className="font-semibold text-foreground">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
