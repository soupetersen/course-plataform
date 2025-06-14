import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ArrowLeft, Plus, Upload, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { useCurrentUser } from "../hooks/useAuth";
import { useCreateCourse } from "../hooks/useCourses";
import { useCategories } from "../hooks/useCategoriesAndEnrollments";
import type { CreateCourseInput } from "../types/api";
import { Textarea } from "@/components/ui/textarea";
import { uploadImage } from "../lib/upload";

interface CreateCourseForm extends CreateCourseInput {
  objectives: string;
}

export const CreateCoursePage = () => {
  const navigate = useNavigate();
  const { data: user } = useCurrentUser();
  const { data: categoriesData } = useCategories();
  const createCourse = useCreateCourse();
  const [imageUrl, setImageUrl] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const categories = categoriesData?.data || [];

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateCourseForm>();

  if (user && user.role !== "INSTRUCTOR" && user.role !== "ADMIN") {
    navigate("/dashboard");
    return null;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const onSubmit = async (data: CreateCourseForm) => {
    try {
      let uploadedImageUrl = "";

      if (imageFile) {
        setIsUploadingImage(true);
        try {
          const uploadResult = await uploadImage(imageFile);
          uploadedImageUrl = uploadResult.url;
        } catch (error) {
          console.error("Error uploading image:", error);
          
        } finally {
          setIsUploadingImage(false);
        }
      }

      const courseData: CreateCourseInput = {
        title: data.title,
        description: data.description,
        price: Number(data.price),
        level: data.level,
        categoryId: data.categoryId,
        imageUrl: uploadedImageUrl || undefined,
      };

      const response = await createCourse.mutateAsync(courseData);

      navigate(`/course/${response.data.id}/edit`);
    } catch (error) {
      console.error("Error creating course:", error);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Link
          to="/dashboard"
          className="inline-flex items-center text-gray-600 hover:text-[#FF204E] transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao Dashboard
        </Link>

        <h1 className="text-3xl font-bold text-gray-900">Criar Novo Curso</h1>
        <p className="text-gray-600 mt-2">
          Preencha as informaÃ§Ãµes bÃ¡sicas do seu curso. VocÃª poderÃ¡ adicionar
          mÃ³dulos e aulas depois.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              InformaÃ§Ãµes BÃ¡sicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="title">TÃ­tulo do Curso*</Label>
              <Input
                id="title"
                {...register("title", { required: "TÃ­tulo Ã© obrigatÃ³rio" })}
                placeholder="Ex: Desenvolvimento Web Completo"
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="description">DescriÃ§Ã£o*</Label>
              <Textarea
                id="description"
                {...register("description", {
                  required: "DescriÃ§Ã£o Ã© obrigatÃ³ria",
                })}
                placeholder="Descreva o que os alunos aprenderÃ£o neste curso..."
                rows={4}
                className={errors.description ? "border-red-500" : ""}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="categoryId">Categoria*</Label>
                <Select
                  onValueChange={(value: string) =>
                    setValue("categoryId", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.categoryId && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.categoryId.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="level">NÃ­vel*</Label>
                <Select
                  onValueChange={(value: string) =>
                    setValue(
                      "level",
                      value as "BEGINNER" | "INTERMEDIATE" | "ADVANCED"
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o nÃ­vel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BEGINNER">Iniciante</SelectItem>
                    <SelectItem value="INTERMEDIATE">IntermediÃ¡rio</SelectItem>
                    <SelectItem value="ADVANCED">AvanÃ§ado</SelectItem>
                  </SelectContent>
                </Select>
                {errors.level && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.level.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="price">PreÃ§o (R$)*</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                {...register("price", {
                  required: "PreÃ§o Ã© obrigatÃ³rio",
                  min: {
                    value: 0,
                    message: "PreÃ§o deve ser maior ou igual a 0",
                  },
                })}
                placeholder="0.00"
                className={errors.price ? "border-red-500" : ""}
              />
              {errors.price && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.price.message}
                </p>
              )}
              <p className="text-gray-500 text-sm mt-1">
                Digite 0 para curso gratuito
              </p>
            </div>

            <div>
              <Label htmlFor="image">Imagem de Capa</Label>
              <div className="mt-2">
                {imageUrl ? (
                  <div className="relative w-full h-48 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                    <img
                      src={imageUrl}
                      alt="Course image"
                      className="w-full h-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setImageUrl("");
                        setImageFile(null);
                      }}
                    >
                      Remover
                    </Button>
                  </div>
                ) : (
                  <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer text-center"
                    >
                      {isUploadingImage ? (
                        <div className="flex flex-col items-center">
                          <Loader2 className="w-8 h-8 mx-auto mb-2 text-gray-400 animate-spin" />
                          <p className="text-gray-600">Uploading...</p>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-gray-600">
                            Clique para fazer upload da imagem
                          </p>
                          <p className="text-gray-400 text-sm">
                            PNG, JPG atÃ© 5MB
                          </p>
                        </>
                      )}
                    </label>
                  </div>
                )}
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={isUploadingImage}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/dashboard")}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || isUploadingImage}
            className="bg-primary hover:bg-secondary text-white"
          >
            {isSubmitting || isUploadingImage ? "Criando..." : "Criar Curso"}
          </Button>
        </div>
      </form>
    </div>
  );
};
