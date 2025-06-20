import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CouponManagement } from "@/components/admin/CouponManagement";
import { PlatformSettings } from "@/components/admin/PlatformSettings";
import { Settings, Tag } from "lucide-react";

export function AdminDashboard() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="w-6 h-6" />
        <h1 className="text-3xl font-bold">Painel Administrativo</h1>
      </div>

      <Tabs defaultValue="coupons" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="coupons" className="flex items-center gap-2">
            <Tag className="w-4 h-4" />
            Cupons
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Configurações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="coupons">
          <CouponManagement />
        </TabsContent>

        <TabsContent value="settings">
          <PlatformSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
