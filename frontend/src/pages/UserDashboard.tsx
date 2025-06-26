import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefundManagement } from "@/components/user/RefundManagement";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { User, DollarSign, RefreshCw, Settings } from "lucide-react";

export function UserDashboard() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-2">
        <User className="w-6 h-6" />
        <h1 className="text-3xl font-bold">Meu Painel</h1>
      </div>

      <Tabs defaultValue="payments" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Pagamentos
          </TabsTrigger>
          <TabsTrigger value="refunds" className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Reembolsos
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Configurações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payments">
          <RefundManagement />
        </TabsContent>

        <TabsContent value="refunds">
          <RefundManagement />
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Configurações da Conta</CardTitle>
              <CardDescription>
                Gerencie suas preferências e configurações de conta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Configurações em desenvolvimento...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

