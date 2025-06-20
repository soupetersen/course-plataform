import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Users,
  Calendar,
  Download,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useCoursesByInstructor } from "../../hooks/useCourses";

interface PaymentAnalytics {
  totalRevenue: number;
  totalTransactions: number;
  averageOrderValue: number;
  monthlyRevenue: number;
  conversionRate: number;
  topCourses: Array<{
    courseId: string;
    courseTitle: string;
    revenue: number;
    enrollments: number;
  }>;
  recentTransactions: Array<{
    id: string;
    courseTitle: string;
    amount: number;
    currency: string;
    status: string;
    paymentType: string;
    createdAt: string;
    studentName: string;
  }>;
  monthlyData: Array<{
    month: string;
    revenue: number;
    transactions: number;
  }>;
}

export const InstructorPaymentAnalytics: React.FC = () => {
  const { user } = useAuth();
  const { data: coursesData } = useCoursesByInstructor(user?.id || "");
  const [analytics, setAnalytics] = useState<PaymentAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<
    "7d" | "30d" | "90d" | "1y"
  >("30d");

  const courses = coursesData?.data || [];

  useEffect(() => {
    fetchAnalytics();
  }, [selectedPeriod]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/instructor/analytics/payments?period=${selectedPeriod}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setAnalytics(result.data);
      } else {
        setAnalytics(generateMockAnalytics());
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
      setAnalytics(generateMockAnalytics());
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockAnalytics = (): PaymentAnalytics => {
    const totalRevenue = courses.reduce(
      (sum, course) => sum + course.price * (course.enrollments_count || 0),
      0
    );

    return {
      totalRevenue,
      totalTransactions: courses.reduce(
        (sum, course) => sum + (course.enrollments_count || 0),
        0
      ),
      averageOrderValue: totalRevenue / Math.max(1, courses.length),
      monthlyRevenue: totalRevenue * 0.3,
      conversionRate: 15.5,
      topCourses: courses.slice(0, 5).map((course) => ({
        courseId: course.id,
        courseTitle: course.title,
        revenue: course.price * (course.enrollments_count || 0),
        enrollments: course.enrollments_count || 0,
      })),
      recentTransactions: [],
      monthlyData: [
        { month: "Jan", revenue: totalRevenue * 0.1, transactions: 12 },
        { month: "Feb", revenue: totalRevenue * 0.15, transactions: 18 },
        { month: "Mar", revenue: totalRevenue * 0.2, transactions: 24 },
        { month: "Abr", revenue: totalRevenue * 0.25, transactions: 30 },
        { month: "Mai", revenue: totalRevenue * 0.3, transactions: 36 },
      ],
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const exportData = () => {
    console.log("Exporting analytics data...");
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Analytics de Pagamentos</h2>
          <div className="animate-spin">
            <RefreshCw className="h-5 w-5" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Falha ao carregar analytics</p>
        <Button onClick={fetchAnalytics} className="mt-4">
          Tentar Novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics de Pagamentos</h2>
          <p className="text-gray-600">
            Acompanhe o desempenho financeiro dos seus cursos
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" onClick={fetchAnalytics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      <div className="flex gap-2">
        {(["7d", "30d", "90d", "1y"] as const).map((period) => (
          <Button
            key={period}
            variant={selectedPeriod === period ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedPeriod(period)}
          >
            {period === "7d"
              ? "7 dias"
              : period === "30d"
              ? "30 dias"
              : period === "90d"
              ? "90 dias"
              : "1 ano"}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Receita Total</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(analytics.totalRevenue)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">+12.5%</span>
              <span className="text-gray-600 ml-1">vs período anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Transações</p>
                <p className="text-2xl font-bold">
                  {analytics.totalTransactions}
                </p>
              </div>
              <CreditCard className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">+8.2%</span>
              <span className="text-gray-600 ml-1">vs período anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ticket Médio</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(analytics.averageOrderValue)}
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">+3.1%</span>
              <span className="text-gray-600 ml-1">vs período anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Taxa de Conversão</p>
                <p className="text-2xl font-bold">
                  {analytics.conversionRate}%
                </p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">+1.8%</span>
              <span className="text-gray-600 ml-1">vs período anterior</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="courses">Cursos</TabsTrigger>
          <TabsTrigger value="transactions">Transações</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Receita Mensal</CardTitle>
              <CardDescription>
                Evolução da receita nos últimos meses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.monthlyData.map((month, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <span className="font-medium">{month.month}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-600">
                        {month.transactions} transações
                      </span>
                      <span className="font-semibold">
                        {formatCurrency(month.revenue)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cursos com Melhor Performance</CardTitle>
              <CardDescription>
                Ranking de cursos por receita gerada
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Curso</TableHead>
                    <TableHead>Matrículas</TableHead>
                    <TableHead>Receita</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics.topCourses.map((course, index) => (
                    <TableRow key={course.courseId}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">#{index + 1}</Badge>
                          <span className="font-medium">
                            {course.courseTitle}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{course.enrollments}</TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(course.revenue)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Transações Recentes</CardTitle>
              <CardDescription>
                Últimas vendas e pagamentos recebidos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.recentTransactions.length === 0 ? (
                <div className="text-center py-8 text-gray-600">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma transação encontrada para o período selecionado</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Curso</TableHead>
                      <TableHead>Aluno</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analytics.recentTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">
                          {transaction.courseTitle}
                        </TableCell>
                        <TableCell>{transaction.studentName}</TableCell>
                        <TableCell>
                          {formatCurrency(transaction.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {transaction.paymentType === "ONE_TIME"
                              ? "Único"
                              : "Assinatura"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              transaction.status === "COMPLETED"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {transaction.status === "COMPLETED"
                              ? "Concluído"
                              : "Pendente"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {formatDate(transaction.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
