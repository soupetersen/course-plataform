import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Settings } from "lucide-react";

export function SettingsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="w-6 h-6" />
        <h1 className="text-3xl font-bold">Configurações</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configurações Gerais</CardTitle>
          <CardDescription>
            Gerencie suas preferências e configurações da conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Esta página está em desenvolvimento. Em breve você poderá configurar
            suas preferências aqui.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
