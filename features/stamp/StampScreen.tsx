"use client";

import { useStamp } from "@/hooks/useStamp";
import { fetchSettings } from "@/lib/api/settings";
import type { SettingsDTO } from "@/lib/mock/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

type StampResult = {
  type: "success" | "already" | "goal" | "first-time";
  message: string;
};

export function StampScreen() {
  const { stampCount, addStamp } = useStamp();
  const [settings, setSettings] = useState<SettingsDTO | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchSettings().then((s) => {
      if (!cancelled) setSettings(s);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  const [result, setResult] = useState<StampResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  const stampGoal = settings?.stampGoal ?? 10;

  const processStamp = useCallback(() => {
    const { success, message, isFirstTime } = addStamp();

    if (success) {
      if (isFirstTime) {
        setResult({ type: "first-time", message });
      } else {
        const newCount = stampCount + 1;
        if (stampGoal > 0 && newCount >= stampGoal) {
          setResult({ type: "goal", message: `おめでとうございます！スタンプが${stampGoal}個たまりました！` });
        } else {
          setResult({ type: "success", message });
        }
      }
    } else {
      setResult({ type: "already", message });
    }
    setIsProcessing(false);
  }, [addStamp, stampCount, stampGoal]);

  useEffect(() => {
    if (settings) {
      const timer = setTimeout(processStamp, 800);
      return () => clearTimeout(timer);
    }
  }, [settings, processStamp]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-pastel-green/30 to-background flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-br from-pastel-pink to-pastel-purple text-white">
        <div className="container py-6">
          <div className="text-center">
            <h1 className="text-xl font-bold">スタンプ受取</h1>
            <p className="text-sm text-white/80 mt-1">
              {settings?.shopName || "こども食堂"}
            </p>
          </div>
        </div>
      </header>

      <main className="container flex-1 flex items-center justify-center py-8">
        <AnimatePresence mode="wait">
          {isProcessing ? (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center space-y-4"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="h-12 w-12 border-3 border-pastel-pink border-t-transparent rounded-full mx-auto"
              />
              <p className="text-muted-foreground">スタンプを処理中...</p>
            </motion.div>
          ) : result ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="w-full max-w-sm"
            >
              <Card className="shadow-lg border-border/50 overflow-hidden rounded-3xl">
                {result.type === "goal" ? (
                  <>
                    <div className="bg-gradient-to-br from-pastel-pink to-pastel-purple p-8 text-center text-white">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                      >
                        <span className="text-6xl">🎉</span>
                      </motion.div>
                      <h2 className="text-2xl font-bold mb-2 mt-4">達成！</h2>
                      <p className="text-white/90">{result.message}</p>
                    </div>
                    <CardContent className="p-6 text-center space-y-4">
                      <p className="text-sm text-muted-foreground">
                        スタッフにこの画面をお見せください
                      </p>
                    </CardContent>
                  </>
                ) : result.type === "first-time" ? (
                  <CardContent className="p-8 text-center space-y-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                      className="bg-gradient-to-br from-pastel-yellow to-pastel-pink rounded-full h-24 w-24 flex items-center justify-center mx-auto"
                    >
                      <span className="text-5xl">🎁</span>
                    </motion.div>
                    <div>
                      <h2 className="text-xl font-bold mb-1 text-pastel-pink">
                        はじめてのスタンプ！
                      </h2>
                      <p className="text-muted-foreground text-sm">
                        {result.message}
                      </p>
                    </div>
                    <div className="bg-pastel-pink/10 rounded-2xl p-4">
                      <p className="text-sm text-muted-foreground mb-1">
                        現在のスタンプ数
                      </p>
                      <p className="text-3xl font-bold text-pastel-pink">
                        2 {stampGoal > 0 ? `/ ${stampGoal}` : "個"}
                      </p>
                    </div>
                  </CardContent>
                ) : result.type === "success" ? (
                  <CardContent className="p-8 text-center space-y-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                      className="bg-pastel-green/20 rounded-full h-20 w-20 flex items-center justify-center mx-auto"
                    >
                      <CheckCircle2 className="h-10 w-10 text-pastel-green" />
                    </motion.div>
                    <div>
                      <h2 className="text-xl font-bold mb-1">スタンプ獲得！</h2>
                      <p className="text-muted-foreground text-sm">
                        {result.message}
                      </p>
                    </div>
                    <div className="bg-pastel-blue/10 rounded-2xl p-4">
                      <p className="text-sm text-muted-foreground mb-1">
                        現在のスタンプ数
                      </p>
                      <p className="text-3xl font-bold text-pastel-blue">
                        {stampCount}{" "}
                        <span className="text-base font-normal text-muted-foreground">
                          {stampGoal > 0 ? `/ ${stampGoal}` : "個"}
                        </span>
                      </p>
                    </div>
                  </CardContent>
                ) : (
                  <CardContent className="p-8 text-center space-y-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                      className="bg-muted rounded-full h-20 w-20 flex items-center justify-center mx-auto"
                    >
                      <XCircle className="h-10 w-10 text-muted-foreground" />
                    </motion.div>
                    <div>
                      <h2 className="text-xl font-bold mb-1">受取済み</h2>
                      <p className="text-muted-foreground text-sm">
                        {result.message}
                      </p>
                    </div>
                    <div className="bg-secondary rounded-2xl p-4">
                      <p className="text-sm text-muted-foreground mb-1">
                        現在のスタンプ数
                      </p>
                      <p className="text-3xl font-bold">
                        {stampCount}{" "}
                        <span className="text-base font-normal text-muted-foreground">
                          {stampGoal > 0 ? `/ ${stampGoal}` : "個"}
                        </span>
                      </p>
                    </div>
                  </CardContent>
                )}

                <div className="px-6 pb-6">
                  <Button variant="outline" className="w-full rounded-2xl" asChild>
                    <Link
                      href="/"
                      className="inline-flex items-center justify-center"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      トップページへ戻る
                    </Link>
                  </Button>
                </div>
              </Card>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </main>
    </div>
  );
}
