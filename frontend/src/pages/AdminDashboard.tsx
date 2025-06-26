import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CouponManagement } from "@/components/admin/CouponManagement";
import { PlatformSettings } from "@/components/admin/PlatformSettings";
import { AdminPayments } from "@/pages/AdminPayments";
import { Settings, Tag, CreditCard } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function AdminDashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="w-6 h-6" />
        <h1 className="text-3xl font-bold">Painel Administrativo</h1>
      </div>

      <Tabs
        defaultValue={isAdmin ? "coupons" : "settings"}
        className="space-y-6"
      >
        <TabsList
          className={`grid w-full ${isAdmin ? "grid-cols-3" : "grid-cols-1"}`}
        >
          {isAdmin && (
            <>
              <TabsTrigger value="coupons" className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Cupons
              </TabsTrigger>
              <TabsTrigger value="payments" className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Pagamentos
              </TabsTrigger>
            </>
          )}
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Configurações
          </TabsTrigger>
        </TabsList>

        {isAdmin && (
          <>
            <TabsContent value="coupons">
              <CouponManagement />
            </TabsContent>
            <TabsContent value="payments">
              <AdminPayments />
            </TabsContent>
          </>
        )}

        <TabsContent value="settings">
          <PlatformSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}

