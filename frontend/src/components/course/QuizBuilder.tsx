import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import type { Question } from "@/types/lesson";
import { QuizBasicInfo } from "./quiz/QuizBasicInfo";
import { QuizSettings } from "./quiz/QuizSettings";
import { QuestionsList } from "./quiz/QuestionsList";
import { QuizFormData } from "./quiz/types";

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
        options: q.options?.map((opt) => ({
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

  const questions = watch("questions");

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
    const currentQuestions = [...questions];
    currentQuestions[questionIndex].options.push({
      text: "",
      isCorrect: false,
    });
    setValue("questions", currentQuestions);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const currentQuestions = [...questions];
    currentQuestions[questionIndex].options.splice(optionIndex, 1);
    setValue("questions", currentQuestions);
  };

  const toggleCorrectOption = (questionIndex: number, optionIndex: number) => {
    const currentQuestions = [...questions];
    
    // Marcar apenas uma opção como correta
    currentQuestions[questionIndex].options.forEach((option, index) => {
      option.isCorrect = index === optionIndex;
    });
    
    setValue("questions", currentQuestions);
  };

  const onSubmit = async (data: QuizFormData) => {
    setIsSubmitting(true);
    try {
      // Validar que cada pergunta tem pelo menos uma resposta correta
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

  return (
    <div className="space-y-6">
      <QuizBasicInfo
        register={register}
        errors={errors}
      />

      <QuizSettings
        register={register}
        watch={watch}
        setValue={setValue}
      />

      <QuestionsList
        questionFields={questionFields}
        questions={questions}
        register={register}
        errors={errors}
        onAddQuestion={addQuestion}
        onRemoveQuestion={removeQuestion}
        onAddOption={addOption}
        onRemoveOption={removeOption}
        onToggleCorrect={toggleCorrectOption}
      />

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
