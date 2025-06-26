import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  Trash2,
  GripVertical,
  HelpCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import type { Question } from "@/types/lesson";

interface QuestionOption {
  id?: string;
  text: string;
  isCorrect: boolean;
}

interface QuizQuestion {
  id?: string;
  text: string;
  options: QuestionOption[];
  explanation?: string;
}

interface QuizFormData {
  title: string;
  description: string;
  passThreshold: number;
  questions: QuizQuestion[];
  timeLimit?: number;
  showExplanations: boolean;
  allowRetakes: boolean;
  randomizeQuestions: boolean;
}

interface QuizBuilderProps {
  initialData?: {
    title?: string;
    description?: string;
    passThreshold?: number;
    questions?: Question[];
  };
  onSave: (data: QuizFormData) => void;
  onCancel: () => void;
}

export const QuizBuilder: React.FC<QuizBuilderProps> = ({
  initialData,
  onSave,
  onCancel,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<QuizFormData>({
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      passThreshold: initialData?.passThreshold || 70,
      questions: initialData?.questions?.map((q) => ({
        id: q.id,
        text: q.question,
        explanation: q.explanation,
        options:
          q.options?.map((opt) => ({
            id: opt.id,
            text: opt.text,
            isCorrect: opt.isCorrect,
          })) || [],
      })) || [
        {
          text: "",
          options: [
            { text: "", isCorrect: true },
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
          ],
        },
      ],
      timeLimit: 0,
      showExplanations: true,
      allowRetakes: true,
      randomizeQuestions: false,
    },
  });

  const {
    fields: questionFields,
    append: appendQuestion,
    remove: removeQuestion,
  } = useFieldArray({
    control,
    name: "questions",
  });

  const addQuestion = () => {
    appendQuestion({
      text: "",
      options: [
        { text: "", isCorrect: true },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ],
    });
  };

  const addOption = (questionIndex: number) => {
    const currentQuestions = watch("questions");
    const updatedQuestions = [...currentQuestions];
    updatedQuestions[questionIndex].options.push({
      text: "",
      isCorrect: false,
    });
    setValue("questions", updatedQuestions);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const currentQuestions = watch("questions");
    const updatedQuestions = [...currentQuestions];
    updatedQuestions[questionIndex].options.splice(optionIndex, 1);
    setValue("questions", updatedQuestions);
  };

  const toggleCorrectOption = (questionIndex: number, optionIndex: number) => {
    const currentQuestions = watch("questions");
    const updatedQuestions = [...currentQuestions];

    updatedQuestions[questionIndex].options.forEach((option, index) => {
      option.isCorrect = index === optionIndex;
    });

    setValue("questions", updatedQuestions);
  };

  const onSubmit = async (data: QuizFormData) => {
    setIsSubmitting(true);
    try {
      const invalidQuestions = data.questions.filter(
        (q) => !q.options.some((opt) => opt.isCorrect)
      );

      if (invalidQuestions.length > 0) {
        throw new Error(
          "Cada pergunta deve ter pelo menos uma resposta correta"
        );
      }

      await onSave(data);
    } catch (error) {
      console.error("Error saving quiz:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const questions = watch("questions");

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6">
      <div className="border-b border-gray-200 pb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Criar Quiz</h1>
        <p className="text-gray-600">
          Configure seu quiz com perguntas e respostas para avaliar o
          conhecimento dos estudantes.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">
            Informações Básicas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                Título do Quiz*
              </Label>
              <Input
                id="title"
                {...register("title", {
                  required: "Título é obrigatório",
                })}
                placeholder="Ex: Quiz sobre JavaScript Básico"
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <p className="text-red-500 text-sm">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="passThreshold" className="text-sm font-medium">
                Nota Mínima para Passar (%)*
              </Label>
              <Input
                id="passThreshold"
                type="number"
                min="0"
                max="100"
                {...register("passThreshold", {
                  required: "Nota mínima é obrigatória",
                  min: { value: 0, message: "Mínimo é 0%" },
                  max: { value: 100, message: "Máximo é 100%" },
                  valueAsNumber: true,
                })}
                placeholder="Ex: 70"
                className={errors.passThreshold ? "border-red-500" : ""}
              />
              {errors.passThreshold && (
                <p className="text-red-500 text-sm">
                  {errors.passThreshold.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Descrição
            </Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Instruções para o quiz..."
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-gray-500">
              Forneça instruções claras sobre o quiz (opcional)
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center">
            <HelpCircle className="w-5 h-5 mr-2 text-primary" />
            Configurações do Quiz
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="timeLimit" className="text-sm font-medium">
                Tempo Limite (minutos)
              </Label>
              <Input
                id="timeLimit"
                type="number"
                min="0"
                {...register("timeLimit", {
                  min: { value: 0, message: "Tempo não pode ser negativo" },
                  valueAsNumber: true,
                })}
                placeholder="0 = sem limite"
              />
              <p className="text-xs text-gray-500">
                Deixe 0 para sem limite de tempo
              </p>
            </div>
          </div>

          <div className="border-t pt-6">
            <h4 className="text-sm font-medium text-gray-900 mb-4">
              Opções Avançadas
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50/50">
                <div>
                  <Label className="text-sm font-medium">
                    Mostrar Explicações
                  </Label>
                  <p className="text-xs text-gray-600 mt-1">Após responder</p>
                </div>
                <Switch
                  checked={watch("showExplanations")}
                  onCheckedChange={(checked) =>
                    setValue("showExplanations", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50/50">
                <div>
                  <Label className="text-sm font-medium">
                    Permitir Tentativas
                  </Label>
                  <p className="text-xs text-gray-600 mt-1">
                    Múltiplas tentativas
                  </p>
                </div>
                <Switch
                  checked={watch("allowRetakes")}
                  onCheckedChange={(checked) =>
                    setValue("allowRetakes", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50/50">
                <div>
                  <Label className="text-sm font-medium">
                    Embaralhar Perguntas
                  </Label>
                  <p className="text-xs text-gray-600 mt-1">Ordem aleatória</p>
                </div>
                <Switch
                  checked={watch("randomizeQuestions")}
                  onCheckedChange={(checked) =>
                    setValue("randomizeQuestions", checked)
                  }
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">
            Perguntas ({questionFields.length})
          </h3>
          <Button
            type="button"
            onClick={addQuestion}
            variant="outline"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Pergunta
          </Button>
        </div>

        {questionFields.map((field, questionIndex) => (
          <Card key={field.id} className="border-l-4 border-l-blue-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  Pergunta {questionIndex + 1}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="cursor-move"
                  >
                    <GripVertical className="w-4 h-4" />
                  </Button>
                  {questionFields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeQuestion(questionIndex)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor={`questions.${questionIndex}.text`}>
                  Texto da Pergunta*
                </Label>
                <Textarea
                  {...register(`questions.${questionIndex}.text`, {
                    required: "Texto da pergunta é obrigatório",
                  })}
                  placeholder="Digite a pergunta..."
                  rows={2}
                />
                {errors.questions?.[questionIndex]?.text && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.questions?.[questionIndex]?.text?.message}
                  </p>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <Label>Opções de Resposta</Label>
                  <Button
                    type="button"
                    onClick={() => addOption(questionIndex)}
                    variant="outline"
                    size="sm"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Opção
                  </Button>
                </div>

                <div className="space-y-2">
                  {questions[questionIndex]?.options?.map(
                    (option, optionIndex) => (
                      <div
                        key={optionIndex}
                        className="flex items-center space-x-2"
                      >
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            toggleCorrectOption(questionIndex, optionIndex)
                          }
                          className={`${
                            option.isCorrect
                              ? "text-green-600 hover:text-green-700"
                              : "text-gray-400 hover:text-gray-600"
                          }`}
                        >
                          {option.isCorrect ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <XCircle className="w-4 h-4" />
                          )}
                        </Button>
                        <Input
                          {...register(
                            `questions.${questionIndex}.options.${optionIndex}.text`,
                            {
                              required: "Texto da opção é obrigatório",
                            }
                          )}
                          placeholder={`Opção ${optionIndex + 1}`}
                          className="flex-1"
                        />
                        {questions[questionIndex].options.length > 2 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              removeOption(questionIndex, optionIndex)
                            }
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor={`questions.${questionIndex}.explanation`}>
                  Explicação (opcional)
                </Label>
                <Textarea
                  {...register(`questions.${questionIndex}.explanation`)}
                  placeholder="Explique por que esta é a resposta correta..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        ))}

        {questionFields.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma pergunta criada
              </h3>
              <p className="text-gray-600 mb-4">
                Adicione pelo menos uma pergunta para o quiz
              </p>
              <Button onClick={addQuestion}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeira Pergunta
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting || questionFields.length === 0}
          className="bg-[#FF204E] hover:bg-[#E01D4A]"
        >
          {isSubmitting ? "Salvando..." : "Salvar Quiz"}
        </Button>
      </div>
    </div>
  );
};
