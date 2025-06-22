import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { BookOpen, Users, Award, Clock } from "lucide-react";

export const FeaturesSection = () => {
  const features = [
    {
      icon: BookOpen,
      title: "Cursos Completos",
      description: "Aprenda com conteúdo estruturado e didático",
    },
    {
      icon: Users,
      title: "Instrutores Experientes",
      description: "Professores especializados em suas áreas",
    },
    {
      icon: Award,
      title: "Certificados",
      description: "Receba certificados ao concluir os cursos",
    },
    {
      icon: Clock,
      title: "Aprenda no Seu Ritmo",
      description: "Acesso vitalício ao conteúdo",
    },
  ];
  return (
    <section className="section-padding bg-card">
      <div className="container">
        <div className="text-center mb-16 animate-in fade-in slide-in-from-top-6 duration-800">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Por que escolher nossa plataforma?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Oferecemos a melhor experiência de aprendizado online com recursos
            exclusivos
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="text-center border-none shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 animate-in zoom-in-95 fade-in delay-100"
              style={{ animationDelay: `${index * 150 + 200}ms` }}
            >
              <CardHeader>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                </div>
                <CardTitle className="text-foreground">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
