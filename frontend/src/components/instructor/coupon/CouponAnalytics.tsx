import React from "react";
import { Eye, AlertCircle, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InstructorCoupon } from "@/types/payment";

interface CouponAnalyticsProps {
  coupons: InstructorCoupon[];
  formatCurrency: (amount: number) => string;
}

export const CouponAnalytics: React.FC<CouponAnalyticsProps> = ({
  coupons,
  formatCurrency,
}) => {
  const totalCoupons = coupons.length;
  const activeCoupons = coupons.filter((c) => c.isActive).length;
  const totalUsages = coupons.reduce((sum, c) => sum + c.usedCount, 0);
  const totalDiscountGiven = coupons.reduce(
    (sum, c) => sum + c.totalDiscountGiven,
    0
  );

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Coupons</CardTitle>
          <Eye className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCoupons}</div>
          <p className="text-xs text-muted-foreground">
            {activeCoupons} active
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalUsages}</div>
          <p className="text-xs text-muted-foreground">Times used</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Discount Given
          </CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(totalDiscountGiven)}
          </div>
          <p className="text-xs text-muted-foreground">To students</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Average Discount
          </CardTitle>
          <Eye className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {totalUsages > 0
              ? formatCurrency(totalDiscountGiven / totalUsages)
              : "$0"}
          </div>
          <p className="text-xs text-muted-foreground">Per usage</p>
        </CardContent>
      </Card>
    </div>
  );
};

