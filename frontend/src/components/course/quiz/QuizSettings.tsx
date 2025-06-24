import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  UseFormRegister,
  UseFormWatch,
  UseFormSetValue,
} from "react-hook-form";
import { QuizFormData } from "./types";

interface QuizSettingsProps {
  register: UseFormRegister<QuizFormData>;
  watch: UseFormWatch<QuizFormData>;
  setValue: UseFormSetValue<QuizFormData>;
}

export const QuizSettings: React.FC<QuizSettingsProps> = ({
  register,
  watch,
  setValue,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Configurações do Quiz</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="timeLimit">Tempo Limite (minutos)</Label>
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
            <p className="text-xs text-gray-500 mt-1">
              Deixe 0 para sem limite de tempo
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center justify-between">
            <div>
              <Label>Mostrar Explicações</Label>
              <p className="text-sm text-gray-600">Após responder</p>
            </div>
            <Switch
              checked={watch("showExplanations")}
              onCheckedChange={(checked) =>
                setValue("showExplanations", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Permitir Tentativas</Label>
              <p className="text-sm text-gray-600">Múltiplas tentativas</p>
            </div>
            <Switch
              checked={watch("allowRetakes")}
              onCheckedChange={(checked) => setValue("allowRetakes", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Embaralhar Perguntas</Label>
              <p className="text-sm text-gray-600">Ordem aleatória</p>
            </div>
            <Switch
              checked={watch("randomizeQuestions")}
              onCheckedChange={(checked) =>
                setValue("randomizeQuestions", checked)
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
