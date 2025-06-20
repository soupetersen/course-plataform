import React from "react";
import { Edit, Trash2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InstructorCoupon, InstructorCourse } from "@/types/payment";

interface CouponTableProps {
  coupons: InstructorCoupon[];
  courses: InstructorCourse[];
  onEdit: (coupon: InstructorCoupon) => void;
  onDelete: (couponId: string) => void;
  formatCurrency: (amount: number) => string;
  formatDate: (date: string) => string;
}

export const CouponTable: React.FC<CouponTableProps> = ({
  coupons,
  onEdit,
  onDelete,
  formatCurrency,
  formatDate,
}) => {
  if (coupons.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">No coupons found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Valid Until</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.map((coupon) => (
              <TableRow key={coupon.id}>
                <TableCell className="font-medium">{coupon.code}</TableCell>
                <TableCell>{coupon.courseName || "All Courses"}</TableCell>
                <TableCell>
                  {coupon.discountType === "PERCENTAGE"
                    ? `${coupon.discountValue}%`
                    : formatCurrency(coupon.discountValue)}
                </TableCell>
                <TableCell>
                  {coupon.usedCount} / {coupon.maxUses || "∞"}
                </TableCell>
                <TableCell>
                  {coupon.validUntil
                    ? formatDate(coupon.validUntil)
                    : "No expiry"}
                </TableCell>
                <TableCell>
                  <Badge variant={coupon.isActive ? "default" : "secondary"}>
                    {coupon.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(coupon)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(coupon.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
