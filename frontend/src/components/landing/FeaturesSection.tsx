import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { BookOpen, Users, Clock, Award, Smartphone, HeadphonesIcon } from "lucide-react";

export const FeaturesSection = () => {
  const features = [
    {
      icon: BookOpen,
      title: "Conteúdo Estruturado",
      description: "Cursos organizados em módulos progressivos e práticos",
    },
    {
      icon: Users,
      title: "Instrutores Qualificados",
      description: "Profissionais experientes e especialistas em suas áreas",
    },
    {
      icon: Clock,
      title: "Aprenda no Seu Ritmo",
      description: "Acesso vitalício para estudar quando e onde quiser",
    },
    {
      icon: Award,
      title: "Certificados",
      description: "Comprove suas habilidades com certificados reconhecidos",
    },
    {
      icon: Smartphone,
      title: "Multi-dispositivo",
      description: "Acesse de qualquer lugar: computador, tablet ou celular",
    },
    {
      icon: HeadphonesIcon,
      title: "Suporte Dedicado",
      description: "Tire suas dúvidas e receba ajuda quando precisar",
    },
  ];
  return (
    <section className="section-padding bg-card">
      <div className="container">
        <div className="text-center mb-16 animate-in fade-in slide-in-from-top-6 duration-800">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Recursos da Plataforma
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Tudo que você precisa para uma experiência de aprendizado completa
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
