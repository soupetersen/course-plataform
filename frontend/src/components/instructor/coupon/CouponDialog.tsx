import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { CreateCouponFormData, InstructorCourse } from "@/types/payment";

interface CouponDialogProps {
  isEdit: boolean;
  formData: CreateCouponFormData;
  setFormData: React.Dispatch<React.SetStateAction<CreateCouponFormData>>;
  courses: InstructorCourse[];
  onSave: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

export const CouponDialog: React.FC<CouponDialogProps> = ({
  isEdit,
  formData,
  setFormData,
  courses,
  onSave,
  onCancel,
  isLoading,
}) => {
  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>
          {isEdit ? "Edit Coupon" : "Create New Coupon"}
        </DialogTitle>
        <DialogDescription>
          {isEdit
            ? "Update coupon details"
            : "Create a new discount coupon for your courses"}
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="code" className="text-right">
            Code
          </Label>
          <Input
            id="code"
            value={formData.code}
            onChange={(e) =>
              setFormData({ ...formData, code: e.target.value.toUpperCase() })
            }
            className="col-span-3"
            placeholder="DISCOUNT20"
          />
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="description" className="text-right">
            Description
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="col-span-3"
            placeholder="Optional description"
          />
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="discountType" className="text-right">
            Type
          </Label>
          <Select
            value={formData.discountType}
            onValueChange={(value: "PERCENTAGE" | "FLAT_RATE") =>
              setFormData({ ...formData, discountType: value })
            }
          >
            <SelectTrigger className="col-span-3">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PERCENTAGE">Percentage</SelectItem>
              <SelectItem value="FLAT_RATE">Fixed Amount</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="discountValue" className="text-right">
            {formData.discountType === "PERCENTAGE" ? "Percentage" : "Amount"}
          </Label>
          <Input
            id="discountValue"
            type="number"
            value={formData.discountValue}
            onChange={(e) =>
              setFormData({
                ...formData,
                discountValue: parseFloat(e.target.value) || 0,
              })
            }
            className="col-span-3"
            placeholder={formData.discountType === "PERCENTAGE" ? "20" : "50"}
            min="0"
            max={formData.discountType === "PERCENTAGE" ? "100" : undefined}
          />
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="course" className="text-right">
            Course
          </Label>
          <Select
            value={formData.courseId || "all"}
            onValueChange={(value) =>
              setFormData({
                ...formData,
                courseId: value === "all" ? undefined : value,
              })
            }
          >
            <SelectTrigger className="col-span-3">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All My Courses</SelectItem>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="maxUses" className="text-right">
            Max Uses
          </Label>
          <Input
            id="maxUses"
            type="number"
            value={formData.maxUses || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                maxUses: e.target.value ? parseInt(e.target.value) : undefined,
              })
            }
            className="col-span-3"
            placeholder="Unlimited"
            min="1"
          />
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="validUntil" className="text-right">
            Valid Until
          </Label>
          <Input
            id="validUntil"
            type="date"
            value={formData.validUntil}
            onChange={(e) =>
              setFormData({ ...formData, validUntil: e.target.value })
            }
            className="col-span-3"
          />
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="isActive" className="text-right">
            Active
          </Label>
          <Switch
            id="isActive"
            checked={formData.isActive}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, isActive: checked })
            }
          />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSave} disabled={isLoading}>
          {isLoading ? "Saving..." : isEdit ? "Update" : "Create"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};
