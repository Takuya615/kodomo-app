"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { adminLogin } from "@/lib/api/admin";
import {
  fetchSettings,
  updateSettings,
  uploadShopImage,
} from "@/lib/api/settings";
import {
  fetchFoods,
  createFood,
  updateFoodFields,
  deleteFood,
  incrementFoodQuantity,
  decrementFoodQuantity,
  uploadFoodImage,
} from "@/lib/api/foods";
import type { FoodDTO } from "@/lib/mock/types";
import type { SettingsDTO } from "@/lib/mock/types";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Lock,
  Settings,
  UtensilsCrossed,
  Star,
  QrCode,
  Plus,
  Pencil,
  Trash2,
  Upload,
  LogOut,
  Save,
  Image as ImageIcon,
  CalendarDays,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

// ─── Login Screen ───
function AdminLogin({ onLogin }: { onLogin: (token: string) => void }) {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await adminLogin(password);
      if (result.success) {
        onLogin(result.token);
        toast.success("ログインしました");
      }
    } catch {
      toast.error("パスワードが正しくありません");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="text-center">
          <div className="bg-warm-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-3">
            <Lock className="h-7 w-7 text-warm-600" />
          </div>
          <CardTitle className="text-xl">管理者ログイン</CardTitle>
          <p className="text-sm text-muted-foreground">
            パスワードを入力してください
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="password">パスワード</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="管理者パスワード"
                className="mt-1.5"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-warm-600 hover:bg-warm-700 text-white"
              disabled={isLoading || !password}
            >
              {isLoading ? "ログイン中..." : "ログイン"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Settings Section ───
/** フォーム初期値はマウント後の fetch のみでセット（render 中の setState は使わない） */
function SettingsSection({ token }: { token: string }) {
  const [settings, setSettings] = useState<SettingsDTO | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [shopName, setShopName] = useState("");
  const [location, setLocation] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [nextEventDate, setNextEventDate] = useState("");
  const [stampGoal, setStampGoal] = useState(10);

  const load = useCallback(async () => {
    const s = await fetchSettings();
    setSettings(s);
    setShopName(s.shopName || "");
    setLocation(s.location || "");
    setOwnerName(s.ownerName || "");
    setNextEventDate(
      s.nextEventDate
        ? new Date(s.nextEventDate).toISOString().slice(0, 16)
        : ""
    );
    setStampGoal(s.stampGoal ?? 10);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings(token, {
        shopName,
        location,
        ownerName,
        nextEventDate: nextEventDate
          ? new Date(nextEventDate).toISOString()
          : null,
        stampGoal,
      });
      toast.success("設定を保存しました");
      await load();
    } catch {
      toast.error("保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("ファイルサイズは5MB以下にしてください");
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];
        setUploading(true);
        try {
          await uploadShopImage(token, { base64, mimeType: file.type });
          toast.success("画像をアップロードしました");
          await load();
        } catch {
          toast.error("アップロードに失敗しました");
        } finally {
          setUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch {
      toast.error("アップロードに失敗しました");
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-warm-600" />
          <CardTitle className="text-base">基本情報</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Shop Image */}
        <div>
          <Label>店舗画像</Label>
          <div className="mt-1.5 flex items-center gap-3">
            {settings?.shopImageUrl ? (
              <img
                src={settings.shopImageUrl}
                alt="店舗"
                className="h-20 w-20 rounded-lg object-cover border"
              />
            ) : (
              <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center border">
                <ImageIcon className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <Upload className="h-4 w-4 mr-1.5" />
                {uploading ? "アップロード中..." : "画像を変更"}
              </Button>
            </div>
          </div>
        </div>

        <Separator />

        <div className="grid gap-3">
          <div>
            <Label htmlFor="shopName">店名</Label>
            <Input
              id="shopName"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="location">開催場所</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="ownerName">代表者氏名</Label>
            <Input
              id="ownerName"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        <Separator />

        <div className="flex items-center gap-2 mb-1">
          <CalendarDays className="h-4 w-4 text-warm-600" />
          <span className="text-sm font-medium">開催日時</span>
        </div>
        <div>
          <Label htmlFor="nextEventDate">次回開催日時</Label>
          <Input
            id="nextEventDate"
            type="datetime-local"
            value={nextEventDate}
            onChange={(e) => setNextEventDate(e.target.value)}
            className="mt-1"
          />
        </div>

        <Separator />

        <div className="flex items-center gap-2 mb-1">
          <Star className="h-4 w-4 text-warm-600" />
          <span className="text-sm font-medium">スタンプ設定</span>
        </div>
        <div>
          <Label htmlFor="stampGoal">ゴール個数（0=未設定）</Label>
          <Input
            id="stampGoal"
            type="number"
            min={0}
            max={50}
            value={stampGoal}
            onChange={(e) => setStampGoal(parseInt(e.target.value) || 0)}
            className="mt-1 w-32"
          />
          <p className="text-xs text-muted-foreground mt-1">
            0を設定すると、ユーザー側ではゴール表示が非表示になります
          </p>
        </div>

        <Button
          onClick={handleSave}
          className="flex ml-auto w-100 bg-warm-600 hover:bg-warm-700 text-white"
          disabled={saving}
        >
          <Save className="h-4 w-4 mr-1.5" />
          {saving ? "保存中..." : "設定を保存"}
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── Foods Section ───
function FoodsSection({ token }: { token: string }) {
  const [foods, setFoods] = useState<FoodDTO[] | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const list = await fetchFoods();
    setFoods(list);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const [showDialog, setShowDialog] = useState(false);
  const [editingFood, setEditingFood] = useState<{
    id?: number;
    name: string;
    quantity: number;
    price: number;
  } | null>(null);

  const openCreate = () => {
    setEditingFood({ name: "", quantity: 0, price: 0 });
    setShowDialog(true);
  };

  const openEdit = (food: {
    id: number;
    name: string;
    quantity: number;
    price: number;
  }) => {
    setEditingFood({ ...food });
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!editingFood || !editingFood.name.trim()) {
      toast.error("食品名を入力してください");
      return;
    }

    setBusy(true);
    try {
      if (editingFood.id) {
        await updateFoodFields(token, editingFood.id, {
          name: editingFood.name,
          quantity: editingFood.quantity,
          price: editingFood.price,
        });
        toast.success("更新しました");
      } else {
        await createFood(token, {
          name: editingFood.name,
          quantity: editingFood.quantity,
          price: editingFood.price,
        });
        toast.success("追加しました");
      }
      setShowDialog(false);
      setEditingFood(null);
      await load();
    } catch {
      toast.error("保存に失敗しました");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id: number) => {
    setBusy(true);
    try {
      await deleteFood(token, id);
      toast.success("削除しました");
      await load();
    } catch {
      toast.error("削除に失敗しました");
    } finally {
      setBusy(false);
    }
  };

  const handleIncrement = async (id: number) => {
    setBusy(true);
    try {
      await incrementFoodQuantity(token, id);
      await load();
    } catch {
      toast.error("更新に失敗しました");
    } finally {
      setBusy(false);
    }
  };

  const handleDecrement = async (id: number) => {
    setBusy(true);
    try {
      await decrementFoodQuantity(token, id);
      await load();
    } catch {
      toast.error("更新に失敗しました");
    } finally {
      setBusy(false);
    }
  };

  const handleImageUpload = async (
    foodId: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("ファイルサイズは5MB以下にしてください");
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];
        setBusy(true);
        try {
          await uploadFoodImage(token, foodId, {
            base64,
            mimeType: file.type,
          });
          toast.success("画像をアップロードしました");
          await load();
        } catch {
          toast.error("アップロードに失敗しました");
        } finally {
          setBusy(false);
        }
      };
      reader.readAsDataURL(file);
    } catch {
      toast.error("アップロードに失敗しました");
    }
  };

  return (
    <>
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="h-5 w-5 text-warm-600" />
              <CardTitle className="text-base">食品在庫管理</CardTitle>
            </div>
            <Button
              size="sm"
              onClick={openCreate}
              className="bg-warm-600 hover:bg-warm-700 text-white"
            >
              <Plus className="h-4 w-4 mr-1" />
              追加
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {foods === null ? (
            <div className="flex justify-center py-10">
              <div className="h-8 w-8 border-3 border-warm-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : foods.length > 0 ? (
            <div className="space-y-3">
              {foods.map((food) => (
                <div
                  key={food.id}
                  className="p-3 bg-secondary/50 rounded-lg space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{food.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          のこり {food.quantity} 食
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {food.price === 0 ? "無料" : `¥${food.price.toLocaleString()}`}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDecrement(food.id)}
                        className="h-8 w-8 p-0"
                        disabled={busy}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleIncrement(food.id)}
                        className="h-8 w-8 p-0"
                        disabled={busy}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(food)}
                        className="h-8 w-8 p-0"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(food.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  {/* Food Image */}
                  <div className="flex items-center gap-2">
                    {food.imageUrl ? (
                      <img
                        src={food.imageUrl}
                        alt={food.name}
                        className="h-12 w-12 rounded object-cover border"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded bg-muted flex items-center justify-center border">
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                    <label className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(food.id, e)}
                        disabled={busy}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs"
                        onClick={(e) => {
                          const input = (e.currentTarget.parentElement as HTMLElement)?.querySelector(
                            'input[type="file"]'
                          ) as HTMLInputElement;
                          input?.click();
                        }}
                        disabled={busy}
                      >
                        <Upload className="h-3 w-3 mr-1" />
                        {busy ? "中..." : "画像"}
                      </Button>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <UtensilsCrossed className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">食品が登録されていません</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Food Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingFood?.id ? "食品を編集" : "食品を追加"}
            </DialogTitle>
          </DialogHeader>
          {editingFood && (
            <div className="space-y-3 py-2">
              <div>
                <Label htmlFor="foodName">食品名</Label>
                <Input
                  id="foodName"
                  value={editingFood.name}
                  onChange={(e) =>
                    setEditingFood({ ...editingFood, name: e.target.value })
                  }
                  placeholder="例: カレーライス"
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="foodQuantity">数量</Label>
                  <Input
                    id="foodQuantity"
                    type="number"
                    min={0}
                    value={editingFood.quantity}
                    onChange={(e) =>
                      setEditingFood({
                        ...editingFood,
                        quantity: parseInt(e.target.value) || 0,
                      })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="foodPrice">価格（円）</Label>
                  <Input
                    id="foodPrice"
                    type="number"
                    min={0}
                    value={editingFood.price}
                    onChange={(e) =>
                      setEditingFood({
                        ...editingFood,
                        price: parseInt(e.target.value) || 0,
                      })
                    }
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">キャンセル</Button>
            </DialogClose>
            <Button
              onClick={handleSave}
              className="bg-warm-600 hover:bg-warm-700 text-white"
              disabled={busy}
            >
              <Save className="h-4 w-4 mr-1.5" />
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── QR Code Section ───
function QRCodeSection() {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  const downloadQR = useCallback((id: string, filename: string) => {
    const svg = document.getElementById(id);
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width * 2;
      canvas.height = img.height * 2;
      ctx?.scale(2, 2);
      ctx?.drawImage(img, 0, 0);
      const pngUrl = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = filename;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  }, []);

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <QrCode className="h-5 w-5 text-warm-600" />
          <CardTitle className="text-base">QRコード</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* QR Code A */}
          <div className="text-center space-y-3 p-4 bg-secondary/50 rounded-xl">
            <Badge variant="secondary" className="text-xs">
              QRコードA（トップページ）
            </Badge>
            <div className="bg-white p-4 rounded-lg inline-block">
              <QRCodeSVG
                id="qr-a"
                value={`${baseUrl}/`}
                size={160}
                level="H"
                includeMargin
              />
            </div>
            <p className="text-xs text-muted-foreground break-all">
              {baseUrl}/
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadQR("qr-a", "qrcode-top.png")}
              className="w-full"
            >
              ダウンロード
            </Button>
          </div>

          {/* QR Code B */}
          <div className="text-center space-y-3 p-4 bg-secondary/50 rounded-xl">
            <Badge variant="secondary" className="text-xs">
              QRコードB（スタンプ受取）
            </Badge>
            <div className="bg-white p-4 rounded-lg inline-block">
              <QRCodeSVG
                id="qr-b"
                value={`${baseUrl}/stamp`}
                size={160}
                level="H"
                includeMargin
              />
            </div>
            <p className="text-xs text-muted-foreground break-all">
              {baseUrl}/stamp
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadQR("qr-b", "qrcode-stamp.png")}
              className="w-full"
            >
              ダウンロード
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Admin Page ───
export function AdminScreen() {
  const { token, isAuthenticated, isLoading, login, logout } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 border-3 border-warm-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !token) {
    return <AdminLogin onLogin={login} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-br from-warm-600 to-warm-700 text-white sticky top-0 z-50">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            <h1 className="text-lg font-bold">管理画面</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="text-white hover:bg-white/15"
          >
            <LogOut className="h-4 w-4 mr-1.5" />
            ログアウト
          </Button>
        </div>
      </header>

      <main className="container py-6 space-y-4 pb-12">
        <SettingsSection token={token} />
        <FoodsSection token={token} />
        <QRCodeSection />
      </main>
    </div>
  );
}
