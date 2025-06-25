import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useEnrollmentStats } from "../hooks/useEnrollments";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import {
  User,
  Calendar,
  BookOpen,
  Award,
  Loader2,
  Camera,
  Upload,
} from "lucide-react";
import { api } from "../lib/api";
import { useToast } from "../components/ui/use-toast";

export const ProfilePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { stats, isLoading: statsLoading, enrollments } = useEnrollmentStats();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  const handleSave = async () => {
    try {
      // Aqui você pode implementar a lógica para salvar os dados do perfil
      setIsEditing(false);
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
    }
  };

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Erro",
        description: "Por favor, selecione apenas arquivos de imagem.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      // 2MB
      toast({
        title: "Erro",
        description: "A imagem deve ter no máximo 2MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingAvatar(true);

    try {
      // Upload do avatar
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await api.post("/api/uploads/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (uploadResponse.data.success) {
        // Atualizar perfil com a nova URL do avatar
        const avatarUrl = uploadResponse.data.data.url;

        const profileResponse = await api.put("/api/auth/profile", {
          avatar: avatarUrl,
        });

        if (profileResponse.data.success) {
          toast({
            title: "Sucesso!",
            description: "Avatar atualizado com sucesso!",
          });
          // Atualizar o contexto do usuário ou recarregar os dados
          window.location.reload(); // Temporário - melhor seria atualizar o contexto
        }
      }
    } catch (error) {
      console.error("Erro ao fazer upload do avatar:", error);
      toast({
        title: "Erro",
        description: "Erro ao fazer upload da imagem. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
    });
    setIsEditing(false);
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "Administrador";
      case "INSTRUCTOR":
        return "Instrutor";
      case "STUDENT":
        return "Estudante";
      default:
        return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-800";
      case "INSTRUCTOR":
        return "bg-blue-100 text-blue-800";
      case "STUDENT":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Carregando perfil...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-r from-primary to-secondary rounded-lg p-6 text-white">
        <div className="flex items-center space-x-4">
          <div className="relative group">
            <Avatar className="w-20 h-20 border-4 border-white/20">
              {user.avatar ? (
                <AvatarImage src={user.avatar} alt={user.name} />
              ) : null}
              <AvatarFallback className="bg-white/20 text-white text-xl font-bold">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>

            {/* Botão de upload de avatar */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingAvatar}
              className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
              {isUploadingAvatar ? (
                <Loader2 className="h-6 w-6 animate-spin text-white" />
              ) : (
                <Camera className="h-6 w-6 text-white" />
              )}
            </button>

            {/* Input oculto para upload */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </div>

          <div>
            <h1 className="text-3xl font-bold">{user.name}</h1>
            <p className="text-primary-foreground/80">{user.email}</p>
            <Badge className={`mt-2 ${getRoleColor(user.role)}`}>
              {getRoleText(user.role)}
            </Badge>
          </div>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="courses">Meus Cursos</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card className="animate-slide-in-left">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Informações Pessoais</CardTitle>
                {!isEditing ? (
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    Editar
                  </Button>
                ) : (
                  <div className="space-x-2">
                    <Button variant="outline" onClick={handleCancel}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSave}>Salvar</Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                    />
                  ) : (
                    <p className="text-sm text-gray-600">{user.name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                    />
                  ) : (
                    <p className="text-sm text-gray-600">{user.email}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de Usuário</Label>
                  <Badge className={getRoleColor(user.role)}>
                    {getRoleText(user.role)}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <Label>Membro desde</Label>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-center animate-bounce-in">
              <CardContent className="pt-6">
                <BookOpen className="h-12 w-12 text-primary mx-auto mb-4" />
                {statsLoading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {stats.totalEnrollments}
                    </h3>
                    <p className="text-gray-600">Cursos Inscritos</p>
                  </>
                )}
              </CardContent>
            </Card>
            <Card className="text-center animate-bounce-in">
              <CardContent className="pt-6">
                <Award className="h-12 w-12 text-secondary mx-auto mb-4" />
                {statsLoading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {stats.completedCourses}
                    </h3>
                    <p className="text-gray-600">Certificados</p>
                  </>
                )}
              </CardContent>
            </Card>
            <Card className="text-center animate-bounce-in">
              <CardContent className="pt-6">
                <User className="h-12 w-12 text-tertiary mx-auto mb-4" />
                {statsLoading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {stats.averageProgress}%
                    </h3>
                    <p className="text-gray-600">Progresso Médio</p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="courses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Meus Cursos</CardTitle>
              <CardDescription>
                Cursos nos quais você está inscrito
              </CardDescription>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="text-center py-12">
                  <Loader2 className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-spin" />
                  <p className="text-gray-600">Carregando cursos...</p>
                </div>
              ) : enrollments.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    Você ainda não está inscrito em nenhum curso.
                  </p>{" "}
                  <Link to="/courses">
                    <Button className="mt-4">Ver Cursos</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {enrollments.map((enrollment) => (
                    <div
                      key={enrollment.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">
                            {enrollment.course?.title || "Curso sem título"}
                          </h3>
                          <p className="text-gray-600 text-sm mt-1">
                            {enrollment.course?.description || "Sem descrição"}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-2">
                              <div className="w-full bg-gray-200 rounded-full h-2 max-w-xs">
                                <div
                                  className="bg-primary h-2 rounded-full transition-all"
                                  style={{ width: `${enrollment.progress}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-600">
                                {enrollment.progress}%
                              </span>
                            </div>
                            {enrollment.completedAt && (
                              <Badge
                                variant="outline"
                                className="bg-green-100 text-green-800"
                              >
                                Concluído
                              </Badge>
                            )}
                            {!enrollment.isActive && (
                              <Badge
                                variant="outline"
                                className="bg-gray-100 text-gray-600"
                              >
                                Inativo
                              </Badge>
                            )}
                          </div>
                        </div>{" "}
                        <div className="ml-4">
                          <Link to={`/learn/${enrollment.course?.id}`}>
                            <Button variant="outline" size="sm">
                              Continuar
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              {" "}
              <CardTitle>Configurações da Conta</CardTitle>
              <CardDescription>
                Gerencie suas preferências e configurações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {" "}
              <div className="space-y-2">
                <Label>Notificações por E-mail</Label>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="notifications" defaultChecked />
                  <Label htmlFor="notifications" className="text-sm">
                    Receber notificações sobre novos cursos e atualizações
                  </Label>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Idioma</Label>
                <select className="w-full p-2 border rounded-md">
                  <option value="pt-BR">Português (Brasil)</option>
                  <option value="en-US">English (US)</option>
                </select>
              </div>
              <div className="pt-4">
                <Button variant="destructive">Excluir Conta</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
