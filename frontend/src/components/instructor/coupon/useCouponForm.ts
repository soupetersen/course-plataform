import { CreateCouponFormData, InstructorCoupon } from "@/types/payment";

export const useCouponForm = () => {
  const resetForm = (setFormData: React.Dispatch<React.SetStateAction<CreateCouponFormData>>) => {
    setFormData({
      code: "",
      description: "",
      discountType: "PERCENTAGE",
      discountValue: 0,
      maxUses: undefined,
      validUntil: "",
      isActive: true,
      courseId: undefined,
    });
  };

  const openEditDialog = (
    coupon: InstructorCoupon,
    setFormData: React.Dispatch<React.SetStateAction<CreateCouponFormData>>
  ) => {
    setFormData({
      code: coupon.code,
      description: coupon.description || "",
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      maxUses: coupon.maxUses || undefined,
      validUntil: coupon.validUntil
        ? new Date(coupon.validUntil).toISOString().split("T")[0]
        : "",
      isActive: coupon.isActive,
      courseId: coupon.courseId || undefined,
    });
  };

  const validateForm = (formData: CreateCouponFormData): boolean => {
    return formData.code.trim() !== "" && formData.discountValue > 0;
  };

  return {
    resetForm,
    openEditDialog,
    validateForm,
  };
};

