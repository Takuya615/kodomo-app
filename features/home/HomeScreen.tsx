"use client";

import { useEffect, useState } from "react";
import { useStamp, type StampVariant } from "@/hooks/useStamp";
import { fetchSettings } from "@/lib/api/settings";
import { fetchFoods } from "@/lib/api/foods";
import type { FoodDTO } from "@/lib/mock/types";
import type { SettingsDTO } from "@/lib/mock/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  CalendarDays,
  User,
  UtensilsCrossed,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo } from "react";

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "未定";
  const d = new Date(date);
  return d.toLocaleDateString("ja-JP", {
    month: "long",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isTodayDate(date: Date | string | null | undefined): boolean {
  if (!date) return false;
  const d = new Date(date);
  const today = new Date();
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  );
}

// SVG Stamp components
function StampStar({ variant }: { variant: StampVariant }) {
  if (variant !== "star") return null;
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <polygon
        points="50,10 61,40 90,40 67,60 78,90 50,70 22,90 33,60 10,40 39,40"
        fill="currentColor"
      />
    </svg>
  );
}

function StampHeart({ variant }: { variant: StampVariant }) {
  if (variant !== "heart") return null;
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <path
        d="M50,85 C20,65 10,50 10,40 C10,25 20,15 30,15 C40,15 50,25 50,35 C50,25 60,15 70,15 C80,15 90,25 90,40 C90,50 80,65 50,85 Z"
        fill="currentColor"
      />
    </svg>
  );
}

function StampCircle({ variant }: { variant: StampVariant }) {
  if (variant !== "circle") return null;
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <circle cx="50" cy="50" r="40" fill="currentColor" />
    </svg>
  );
}

function StampFlower({ variant }: { variant: StampVariant }) {
  if (variant !== "flower") return null;
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <circle cx="50" cy="50" r="12" fill="currentColor" />
      {[0, 72, 144, 216, 288].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const x = 50 + 30 * Math.cos(rad);
        const y = 50 + 30 * Math.sin(rad);
        return (
          <circle key={angle} cx={x} cy={y} r="15" fill="currentColor" opacity="0.7" />
        );
      })}
    </svg>
  );
}

function StampSquare({ variant }: { variant: StampVariant }) {
  if (variant !== "square") return null;
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <rect x="20" y="20" width="60" height="60" fill="currentColor" rx="8" />
    </svg>
  );
}

function StampIcon({ variant }: { variant: StampVariant; isRich?: boolean }) {
  const colorMap: Record<StampVariant, string> = {
    star: "text-yellow-400",
    heart: "text-pink-400",
    circle: "text-blue-400",
    flower: "text-pink-300",
    square: "text-green-400",
  };

  return (
    <div className={colorMap[variant]}>
      <StampStar variant={variant} />
      <StampHeart variant={variant} />
      <StampCircle variant={variant} />
      <StampFlower variant={variant} />
      <StampSquare variant={variant} />
    </div>
  );
}

function StampCard({
  count,
  goal,
  variants,
}: {
  count: number;
  goal: number;
  variants: StampVariant[];
}) {
  const isGoalReached = goal > 0 && count >= goal;

  const displayCount = count;
  let totalSlots = 0;
  if (goal === 0) {
    totalSlots = count + 10;
  } else {
    totalSlots = count + goal * 2;
  }

  const stamps = useMemo(() => {
    return Array.from({ length: totalSlots }, (_, i) => i);
  }, [totalSlots]);

  const isRichStamp = (index: number): boolean => {
    if (goal === 0) return false;
    return (index + 1) % goal === 0;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">スタンプカード</h2>
        <Badge
          variant={isGoalReached ? "default" : "secondary"}
          className={isGoalReached ? "bg-pastel-pink text-white" : ""}
        >
          {displayCount} {goal > 0 ? `/ ${goal}` : "個"}
        </Badge>
      </div>

      <div className="grid grid-cols-5 gap-2 sm:gap-3">
        {stamps.map((i) => {
          const isFilled = i < displayCount;
          const rich = isRichStamp(i);
          const variant = variants[i] || "star";

          return (
            <motion.div
              key={i}
              initial={false}
              animate={isFilled ? { scale: [1, 1.15, 1] } : {}}
              transition={{ duration: 0.4 }}
              className={`aspect-square rounded-2xl flex items-center justify-center border-2 transition-all duration-300 ${
                rich
                  ? isFilled
                    ? "bg-gradient-to-br from-pastel-pink to-pastel-purple border-pastel-purple shadow-lg scale-110"
                    : "bg-gray-200 border-gray-300 shadow-md scale-110"
                  : isFilled
                  ? "bg-gradient-to-br from-pastel-blue to-pastel-green border-pastel-blue shadow-md"
                  : "bg-stamp-empty border-border"
              }`}
            >
              {isFilled ? (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="w-6 h-6 sm:w-7 sm:h-7"
                >
                  <StampIcon variant={variant} isRich={rich} />
                </motion.div>
              ) : (
                <span className="text-xs text-muted-foreground font-semibold">{i + 1}</span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Progress bar */}
      {goal > 0 && (
        <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-pastel-pink to-pastel-purple rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((displayCount / goal) * 100, 100)}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      )}

      <AnimatePresence>
        {isGoalReached && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-gradient-to-r from-pastel-pink/20 to-pastel-purple/20 rounded-2xl p-4 border-2 border-pastel-pink/50"
          >
            <div className="flex items-center gap-3">
              <div className="bg-pastel-pink rounded-full p-2">
                <span className="text-xl">🎉</span>
              </div>
              <div>
                <p className="font-bold text-pastel-pink">
                  おめでとうございます！
                </p>
                <p className="text-sm text-pastel-pink/80">
                  スタンプが{goal}個たまりました。スタッフにこの画面をお見せください。
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function HomeScreen() {
  const [settings, setSettings] = useState<SettingsDTO | null>(null);
  const [foods, setFoods] = useState<FoodDTO[] | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [foodsLoading, setFoodsLoading] = useState(true);
  const { stampCount, stampVariants } = useStamp();

  useEffect(() => {
    let cancelled = false;
    fetchSettings()
      .then((s) => {
        if (!cancelled) setSettings(s);
      })
      .finally(() => {
        if (!cancelled) setSettingsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchFoods()
      .then((f) => {
        if (!cancelled) setFoods(f);
      })
      .finally(() => {
        if (!cancelled) setFoodsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const stampGoal = settings?.stampGoal ?? 10;

  // Check if event is today
  const isEventToday = isTodayDate(settings?.nextEventDate);
  
  // Check if sold out
  const allSoldOut = foods && foods.every((f) => f.quantity === 0);
  const isSoldOut = allSoldOut || !isEventToday;

  if (settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-8 w-8 border-3 border-pastel-pink border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pastel-yellow/30 to-background">
      {/* Header */}
      <header className="bg-gradient-to-br from-pastel-pink to-pastel-purple text-white">
        <div className="container py-8 sm:py-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-2"
          >
            <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-sm backdrop-blur-sm">
              <UtensilsCrossed className="h-4 w-4" />
              <span>こども食堂</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              {settings?.shopName || "こども食堂"}
            </h1>
          </motion.div>
        </div>
      </header>

      <main className="container pb-8 -mt-4 space-y-4">
        {/* Shop Image */}
        {settings?.shopImageUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="overflow-hidden border-0 shadow-lg rounded-3xl">
              <img
                src={settings.shopImageUrl}
                alt={settings.shopName || "店舗画像"}
                className="w-full h-48 sm:h-56 object-cover"
              />
            </Card>
          </motion.div>
        )}

        {/* Event Schedule */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <Card className="shadow-sm border-border/50 rounded-3xl">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <CalendarDays className="h-5 w-5 text-pastel-pink" />
                <h2 className="text-lg font-bold">開催スケジュール</h2>
              </div>
              <div className="bg-gradient-to-br from-pastel-blue/20 to-pastel-green/20 rounded-2xl p-4">
                <p className="text-xs text-muted-foreground font-medium mb-1">
                  次回の開催
                </p>
                <p className="text-lg font-bold text-pastel-blue">
                  {isEventToday ? (
                    <span className="text-2xl">本日開催!! 🎉</span>
                  ) : (
                    formatDate(settings?.nextEventDate)
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Food Menu */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="shadow-sm border-border/50 rounded-3xl relative overflow-hidden">
            {isSoldOut && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10 rounded-3xl">
                <div className="text-center">
                  <p className="text-5xl font-black text-white drop-shadow-lg">
                    SOLD OUT
                  </p>
                </div>
              </div>
            )}
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <UtensilsCrossed className="h-5 w-5 text-pastel-pink" />
                <h2 className="text-lg font-bold">本日のメニュー</h2>
              </div>
              {foodsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-16 bg-muted rounded-2xl animate-pulse"
                    />
                  ))}
                </div>
              ) : foods && foods.length > 0 ? (
                <div className="space-y-3">
                  {foods.map((food, index) => (
                    <div key={food.id}>
                      <div className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3 flex-1">
                          {food.imageUrl ? (
                            <img
                              src={food.imageUrl}
                              alt={food.name}
                              className="h-12 w-12 rounded-xl object-cover"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-xl bg-pastel-yellow/50 flex items-center justify-center">
                              <UtensilsCrossed className="h-5 w-5 text-pastel-pink/50" />
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-sm">{food.name}</p>
                            <p className="text-xs text-muted-foreground">
                              のこり {food.quantity} 食
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={food.quantity > 0 ? "secondary" : "destructive"}
                            className="text-xs rounded-full"
                          >
                            {food.quantity > 0 ? "提供中" : "品切れ"}
                          </Badge>
                          <span className="text-sm font-bold text-pastel-pink">
                            {food.price === 0 ? "無料" : `¥${food.price.toLocaleString()}`}
                          </span>
                        </div>
                      </div>
                      {index < foods.length - 1 && <Separator className="opacity-30" />}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <UtensilsCrossed className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">メニューは準備中です</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Stamp Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          <Card className="shadow-sm border-border/50 rounded-3xl">
            <CardContent className="p-5">
              <StampCard
                count={stampCount}
                goal={stampGoal}
                variants={stampVariants}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Basic Info - moved to bottom */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card className="shadow-sm border-border/50 rounded-3xl">
            <CardContent className="p-5 space-y-3">
              {settings?.location && (
                <div className="flex items-start gap-3">
                  <div className="bg-pastel-blue/20 rounded-xl p-2 mt-0.5">
                    <MapPin className="h-4 w-4 text-pastel-blue" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">開催場所</p>
                    <p className="text-sm font-medium">{settings.location}</p>
                  </div>
                </div>
              )}
              {settings?.ownerName && (
                <div className="flex items-start gap-3">
                  <div className="bg-pastel-purple/20 rounded-xl p-2 mt-0.5">
                    <User className="h-4 w-4 text-pastel-purple" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">代表者</p>
                    <p className="text-sm font-medium">{settings.ownerName}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Warning note */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="bg-yellow-50 border border-yellow-200 rounded-2xl p-3 flex gap-2"
        >
          <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-yellow-700">
            ⚠️ スタンプのデータはこの端末のブラウザに保存されています。ブラウザのキャッシュ・履歴を削除すると、スタンプのデータが消える場合があります。ご注意ください。
          </p>
        </motion.div>

        {/* Footer spacing */}
        <div className="h-4" />
      </main>
    </div>
  );
}
