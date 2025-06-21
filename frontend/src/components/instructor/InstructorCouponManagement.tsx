import React, { useState, useEffect, useCallback } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { useInstructorCouponApi } from "@/hooks/usePaymentApi";
import {
  InstructorCoupon,
  InstructorCourse,
  CreateCouponFormData,
} from "@/types/payment";

import { CouponDialog } from "./coupon/CouponDialog";
import { CouponTable } from "./coupon/CouponTable";
import { CouponAnalytics } from "./coupon/CouponAnalytics";
import { LoadingSpinner } from "./coupon/LoadingSpinner";
import { useCouponForm } from "./coupon/useCouponForm";
import { formatCurrency, formatDate } from "./coupon/utils";

export const InstructorCouponManagement: React.FC = () => {
  const [coupons, setCoupons] = useState<InstructorCoupon[]>([]);
  const [courses, setCourses] = useState<InstructorCourse[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<InstructorCoupon | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState(false);

  const { toast } = useToast();
  const {
    getInstructorCourses,
    getInstructorCoupons,
    createInstructorCoupon,
    updateInstructorCoupon,
    deleteInstructorCoupon,
  } = useInstructorCouponApi();

  const { resetForm, openEditDialog, validateForm } = useCouponForm();

  const [formData, setFormData] = useState<CreateCouponFormData>({
    code: "",
    description: "",
    discountType: "PERCENTAGE",
    discountValue: 0,
    maxUses: undefined,
    validUntil: "",
    isActive: true,
    courseId: undefined,
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [coursesResponse, couponsResponse] = await Promise.all([
        getInstructorCourses(),
        getInstructorCoupons(),
      ]);

      if (coursesResponse?.success) {
        setCourses(coursesResponse.data);
      }

      if (couponsResponse?.success) {
        setCoupons(couponsResponse.data);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
      toast({
        title: "Erro",
        description: "Falha ao carregar dados",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [getInstructorCourses, getInstructorCoupons, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateCoupon = async () => {
    if (!validateForm(formData)) {
      toast({
        title: "Erro de Validação",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setOperationLoading(true);
    try {
      const response = await createInstructorCoupon(formData);

      if (response?.success) {
        toast({
          title: "Sucesso",
          description: "Cupom criado com sucesso",
          variant: "default",
        });

        setIsCreateDialogOpen(false);
        resetForm(setFormData);
        loadData();
      } else {
        toast({
          title: "Erro",
          description: response?.error || "Falha ao criar cupom",
          variant: "destructive",
        });
      }
    } finally {
      setOperationLoading(false);
    }
  };

  const handleUpdateCoupon = async () => {
    if (!editingCoupon) return;

    if (!validateForm(formData)) {
      toast({
        title: "Erro de Validação",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setOperationLoading(true);
    try {
      const response = await updateInstructorCoupon(editingCoupon.id, formData);

      if (response?.success) {
        toast({
          title: "Sucesso",
          description: "Cupom atualizado com sucesso",
          variant: "default",
        });

        setEditingCoupon(null);
        resetForm(setFormData);
        loadData();
      } else {
        toast({
          title: "Erro",
          description: response?.error || "Falha ao atualizar cupom",
          variant: "destructive",
        });
      }
    } finally {
      setOperationLoading(false);
    }
  };

  const handleDeleteCoupon = async (couponId: string) => {
    if (!confirm("Tem certeza que deseja excluir este cupom?")) return;

    setOperationLoading(true);
    try {
      const response = await deleteInstructorCoupon(couponId);

      if (response?.success) {
        toast({
          title: "Sucesso",
          description: "Cupom excluído com sucesso",
          variant: "default",
        });

        loadData();
      } else {
        toast({
          title: "Erro",
          description: response?.message || "Falha ao excluir cupom",
          variant: "destructive",
        });
      }
    } finally {
      setOperationLoading(false);
    }
  };

  const handleEditCoupon = (coupon: InstructorCoupon) => {
    setEditingCoupon(coupon);
    openEditDialog(coupon, setFormData);
  };

  const handleCreateDialogOpen = () => {
    resetForm(setFormData);
    setIsCreateDialogOpen(true);
  };

  if (loading) {
    return <LoadingSpinner message="Carregando cupons..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gerenciamento de Cupons</h2>
          <p className="text-gray-600">
            Crie e gerencie cupons de desconto para seus cursos
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreateDialogOpen}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Cupom
            </Button>
          </DialogTrigger>
          <CouponDialog
            isEdit={false}
            formData={formData}
            setFormData={setFormData}
            courses={courses}
            onSave={handleCreateCoupon}
            onCancel={() => setIsCreateDialogOpen(false)}
            isLoading={operationLoading}
          />
        </Dialog>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Cupons Ativos</TabsTrigger>
          <TabsTrigger value="inactive">Cupons Inativos</TabsTrigger>
          <TabsTrigger value="analytics">Análises</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <CouponTable
            coupons={coupons.filter((c) => c.isActive)}
            courses={courses}
            onEdit={handleEditCoupon}
            onDelete={handleDeleteCoupon}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
          />
        </TabsContent>

        <TabsContent value="inactive" className="space-y-4">
          <CouponTable
            coupons={coupons.filter((c) => !c.isActive)}
            courses={courses}
            onEdit={handleEditCoupon}
            onDelete={handleDeleteCoupon}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <CouponAnalytics coupons={coupons} formatCurrency={formatCurrency} />
        </TabsContent>
      </Tabs>

      {editingCoupon && (
        <Dialog
          open={!!editingCoupon}
          onOpenChange={(open) => !open && setEditingCoupon(null)}
        >
          <CouponDialog
            isEdit={true}
            formData={formData}
            setFormData={setFormData}
            courses={courses}
            onSave={handleUpdateCoupon}
            onCancel={() => setEditingCoupon(null)}
            isLoading={operationLoading}
          />
        </Dialog>
      )}
    </div>
  );
};
