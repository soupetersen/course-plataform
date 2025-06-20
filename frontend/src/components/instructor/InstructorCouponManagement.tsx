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
        title: "Error",
        description: "Failed to load data",
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
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setOperationLoading(true);
    try {
      const response = await createInstructorCoupon(formData);

      if (response?.success) {
        toast({
          title: "Success",
          description: "Coupon created successfully",
          variant: "default",
        });

        setIsCreateDialogOpen(false);
        resetForm(setFormData);
        loadData();
      } else {
        toast({
          title: "Error",
          description: response?.error || "Failed to create coupon",
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
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setOperationLoading(true);
    try {
      const response = await updateInstructorCoupon(editingCoupon.id, formData);

      if (response?.success) {
        toast({
          title: "Success",
          description: "Coupon updated successfully",
          variant: "default",
        });

        setEditingCoupon(null);
        resetForm(setFormData);
        loadData();
      } else {
        toast({
          title: "Error",
          description: response?.error || "Failed to update coupon",
          variant: "destructive",
        });
      }
    } finally {
      setOperationLoading(false);
    }
  };

  const handleDeleteCoupon = async (couponId: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;

    setOperationLoading(true);
    try {
      const response = await deleteInstructorCoupon(couponId);

      if (response?.success) {
        toast({
          title: "Success",
          description: "Coupon deleted successfully",
          variant: "default",
        });

        loadData();
      } else {
        toast({
          title: "Error",
          description: response?.message || "Failed to delete coupon",
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
    return <LoadingSpinner message="Loading coupons..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Coupon Management</h2>
          <p className="text-gray-600">
            Create and manage discount coupons for your courses
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreateDialogOpen}>
              <Plus className="h-4 w-4 mr-2" />
              Create Coupon
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
          <TabsTrigger value="active">Active Coupons</TabsTrigger>
          <TabsTrigger value="inactive">Inactive Coupons</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
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
