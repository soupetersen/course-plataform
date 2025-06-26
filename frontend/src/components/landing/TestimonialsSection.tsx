import { Card, CardContent } from "../ui/card";
import { CheckCircle, Clock, Trophy, Users } from "lucide-react";

export const TestimonialsSection = () => {
  const benefits = [
    {
      icon: CheckCircle,
      title: "Certificados Reconhecidos",
      content:
        "Receba certificados de conclusão para valorizar seu currículo e LinkedIn.",
      color: "text-green-500",
    },
    {
      icon: Clock,
      title: "Flexibilidade Total",
      content:
        "Estude quando e onde quiser, no seu próprio ritmo, com acesso vitalício.",
      color: "text-blue-500",
    },
    {
      icon: Trophy,
      title: "Metodologia Prática",
      content:
        "Aprenda fazendo com projetos reais e exercícios hands-on.",
      color: "text-yellow-500",
    },
    {
      icon: Users,
      title: "Suporte Dedicado",
      content:
        "Tire suas dúvidas diretamente com instrutores especializados.",
      color: "text-purple-500",
    },
  ];

  return (
    <section id="beneficios" className="section-padding bg-card">
      <div className="container">
        <div className="text-center mb-16 fade-in">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Por que escolher nossa plataforma?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Oferecemos tudo que você precisa para acelerar seu aprendizado
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {benefits.map((benefit, index) => (
            <Card
              key={index}
              className="border-none shadow-lg card-hover fade-in-up"
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 ${benefit.color}`}>
                    <benefit.icon className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-lg mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {benefit.content}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
