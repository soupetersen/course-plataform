import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { PlusCircle, Edit, Trash2, Copy } from "lucide-react";

interface Coupon {
  id: string;
  code: string;
  description?: string;
  discountType: "PERCENTAGE" | "FLAT_RATE";
  discountValue: number;
  maxUses?: number;
  usedCount: number;
  validUntil?: string;
  isActive: boolean;
  courseId?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateCouponData {
  code: string;
  description?: string;
  discountType: "PERCENTAGE" | "FLAT_RATE";
  discountValue: number;
  maxUses?: number;
  validUntil?: string;
  isActive: boolean;
  courseId?: string;
}

export function CouponManagement() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState<CreateCouponData>({
    code: "",
    description: "",
    discountType: "PERCENTAGE",
    discountValue: 0,
    maxUses: undefined,
    validUntil: "",
    isActive: true,
    courseId: undefined,
  });

  const fetchCoupons = useCallback(async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/admin/coupons", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCoupons(data.coupons || []);
      } else {
        toast({
          title: "Erro",
          description: "Falha ao carregar cupons",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Erro",
        description: "Erro de conexão",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const handleCreateCoupon = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          validUntil: formData.validUntil
            ? new Date(formData.validUntil).toISOString()
            : undefined,
        }),
      });

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Cupom criado com sucesso",
        });
        setIsCreateDialogOpen(false);
        resetForm();
        fetchCoupons();
      } else {
        const error = await response.json();
        toast({
          title: "Erro",
          description: error.message || "Falha ao criar cupom",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Erro",
        description: "Erro de conexão",
        variant: "destructive",
      });
    }
  };

  const handleUpdateCoupon = async () => {
    if (!selectedCoupon) return;

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/admin/coupons/${selectedCoupon.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          validUntil: formData.validUntil
            ? new Date(formData.validUntil).toISOString()
            : undefined,
        }),
      });

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Cupom atualizado com sucesso",
        });
        setIsEditDialogOpen(false);
        setSelectedCoupon(null);
        resetForm();
        fetchCoupons();
      } else {
        const error = await response.json();
        toast({
          title: "Erro",
          description: error.message || "Falha ao atualizar cupom",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Erro",
        description: "Erro de conexão",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este cupom?")) return;

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/admin/coupons/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Cupom excluído com sucesso",
        });
        fetchCoupons();
      } else {
        toast({
          title: "Erro",
          description: "Falha ao excluir cupom",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Erro",
        description: "Erro de conexão",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
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

  const openEditDialog = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description || "",
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      maxUses: coupon.maxUses,
      validUntil: coupon.validUntil
        ? new Date(coupon.validUntil).toISOString().split("T")[0]
        : "",
      isActive: coupon.isActive,
      courseId: coupon.courseId,
    });
    setIsEditDialogOpen(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado",
      description: "Código do cupom copiado para área de transferência",
    });
  };

  const formatDiscount = (type: string, value: number) => {
    return type === "PERCENTAGE" ? `${value}%` : `R$ ${value.toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando cupons...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gerenciamento de Cupons</CardTitle>
              <CardDescription>
                Crie e gerencie cupons de desconto para seus cursos
              </CardDescription>
            </div>
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Criar Cupom
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Criar Novo Cupom</DialogTitle>
                  <DialogDescription>
                    Preencha as informações do cupom de desconto
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="code">Código do Cupom</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          code: e.target.value.toUpperCase(),
                        })
                      }
                      placeholder="ex: DESCONTO10"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Descrição (opcional)</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Descrição do cupom"
                    />
                  </div>
                  <div>
                    <Label htmlFor="discountType">Tipo de Desconto</Label>
                    <Select
                      value={formData.discountType}
                      onValueChange={(value: "PERCENTAGE" | "FLAT_RATE") =>
                        setFormData({ ...formData, discountType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PERCENTAGE">Porcentagem</SelectItem>
                        <SelectItem value="FLAT_RATE">Valor Fixo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="discountValue">
                      Valor do Desconto{" "}
                      {formData.discountType === "PERCENTAGE" ? "(%)" : "(R$)"}
                    </Label>
                    <Input
                      id="discountValue"
                      type="number"
                      value={formData.discountValue}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          discountValue: Number(e.target.value),
                        })
                      }
                      min="0"
                      max={
                        formData.discountType === "PERCENTAGE" ? 100 : undefined
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxUses">Limite de Uso (opcional)</Label>
                    <Input
                      id="maxUses"
                      type="number"
                      value={formData.maxUses || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          maxUses: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        })
                      }
                      placeholder="Deixe vazio para ilimitado"
                    />
                  </div>
                  <div>
                    <Label htmlFor="validUntil">
                      Data de Expiração (opcional)
                    </Label>
                    <Input
                      id="validUntil"
                      type="date"
                      value={formData.validUntil}
                      onChange={(e) =>
                        setFormData({ ...formData, validUntil: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, isActive: checked })
                      }
                    />
                    <Label htmlFor="isActive">Cupom Ativo</Label>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleCreateCoupon} className="flex-1">
                      Criar Cupom
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Desconto</TableHead>
                <TableHead>Uso</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Validade</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="font-mono bg-muted px-2 py-1 rounded">
                        {coupon.code}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(coupon.code)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    {formatDiscount(coupon.discountType, coupon.discountValue)}
                  </TableCell>
                  <TableCell>
                    {coupon.usedCount}
                    {coupon.maxUses ? `/${coupon.maxUses}` : ""}
                  </TableCell>
                  <TableCell>
                    <Badge variant={coupon.isActive ? "default" : "secondary"}>
                      {coupon.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {coupon.validUntil
                      ? new Date(coupon.validUntil).toLocaleDateString("pt-BR")
                      : "Sem expiração"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(coupon)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCoupon(coupon.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {coupons.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum cupom encontrado. Crie seu primeiro cupom!
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Cupom</DialogTitle>
            <DialogDescription>
              Atualize as informações do cupom
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-code">Código do Cupom</Label>
              <Input
                id="edit-code"
                value={formData.code}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    code: e.target.value.toUpperCase(),
                  })
                }
                placeholder="ex: DESCONTO10"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Descrição (opcional)</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Descrição do cupom"
              />
            </div>
            <div>
              <Label htmlFor="edit-discountType">Tipo de Desconto</Label>
              <Select
                value={formData.discountType}
                onValueChange={(value: "PERCENTAGE" | "FLAT_RATE") =>
                  setFormData({ ...formData, discountType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENTAGE">Porcentagem</SelectItem>
                  <SelectItem value="FLAT_RATE">Valor Fixo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-discountValue">
                Valor do Desconto{" "}
                {formData.discountType === "PERCENTAGE" ? "(%)" : "(R$)"}
              </Label>
              <Input
                id="edit-discountValue"
                type="number"
                value={formData.discountValue}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    discountValue: Number(e.target.value),
                  })
                }
                min="0"
                max={formData.discountType === "PERCENTAGE" ? 100 : undefined}
              />
            </div>
            <div>
              <Label htmlFor="edit-maxUses">Limite de Uso (opcional)</Label>
              <Input
                id="edit-maxUses"
                type="number"
                value={formData.maxUses || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxUses: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
                placeholder="Deixe vazio para ilimitado"
              />
            </div>
            <div>
              <Label htmlFor="edit-validUntil">
                Data de Expiração (opcional)
              </Label>
              <Input
                id="edit-validUntil"
                type="date"
                value={formData.validUntil}
                onChange={(e) =>
                  setFormData({ ...formData, validUntil: e.target.value })
                }
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
              <Label htmlFor="edit-isActive">Cupom Ativo</Label>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleUpdateCoupon} className="flex-1">
                Salvar Alterações
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
