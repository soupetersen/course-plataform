import type { User } from "../../types/api";

interface WelcomeSectionProps {
  user: User | null | undefined;
}

export const WelcomeSection = ({ user }: WelcomeSectionProps) => {
  return (
    <div className="bg-gradient-to-r from-primary to-secondary rounded-lg p-6 text-white animate-slide-in-left">
      <h1 className="text-3xl font-bold mb-2">
        Bem-vindo de volta, {user?.name || "Usuário"}! 👋
      </h1>
      <p className="text-primary-foreground/80">
        Continue seu aprendizado onde parou ou descubra novos cursos.
      </p>
    </div>
  );
};
