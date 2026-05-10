"use client";

import { useState, useEffect, useCallback } from "react";

const STAMP_COUNT_KEY = "kodomo_stamp_count";
const STAMP_UUID_KEY = "kodomo_stamp_uuid";
const STAMP_LAST_DATE_KEY = "kodomo_stamp_last_date";
const STAMP_VARIANTS_KEY = "kodomo_stamp_variants"; // New: store variant IDs for each stamp
const STAMP_FIRST_TIME_KEY = "kodomo_stamp_first_time"; // New: track if first time

// Stamp variant types
export type StampVariant = "star" | "heart" | "circle" | "flower" | "square";

const STAMP_VARIANTS: StampVariant[] = ["star", "heart", "circle", "flower", "square"];

function generateUUID(): string {
  return crypto.randomUUID?.() ?? 
    "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
}

function getTodayString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function getRandomVariant(): StampVariant {
  return STAMP_VARIANTS[Math.floor(Math.random() * STAMP_VARIANTS.length)];
}

export function useStamp() {
  const [stampCount, setStampCount] = useState<number>(0);
  const [uuid, setUuid] = useState<string>("");
  const [canStampToday, setCanStampToday] = useState<boolean>(true);
  const [stampVariants, setStampVariants] = useState<StampVariant[]>([]);
  const [isFirstTime, setIsFirstTime] = useState<boolean>(false);

  useEffect(() => {
    // Initialize UUID
    let storedUuid = localStorage.getItem(STAMP_UUID_KEY);
    if (!storedUuid) {
      storedUuid = generateUUID();
      localStorage.setItem(STAMP_UUID_KEY, storedUuid);
    }
    setUuid(storedUuid);

    // Initialize stamp count
    const storedCount = localStorage.getItem(STAMP_COUNT_KEY);
    setStampCount(storedCount ? parseInt(storedCount, 10) : 0);

    // Initialize stamp variants
    const storedVariants = localStorage.getItem(STAMP_VARIANTS_KEY);
    const variants = storedVariants ? JSON.parse(storedVariants) : [];
    setStampVariants(variants);

    // Check if first time
    const firstTime = localStorage.getItem(STAMP_FIRST_TIME_KEY) === null;
    setIsFirstTime(firstTime);

    // Check if already stamped today
    const lastDate = localStorage.getItem(STAMP_LAST_DATE_KEY);
    const today = getTodayString();
    setCanStampToday(lastDate !== today);
  }, []);

  const addStamp = useCallback((): { success: boolean; message: string; isFirstTime: boolean } => {
    const today = getTodayString();
    const lastDate = localStorage.getItem(STAMP_LAST_DATE_KEY);

    if (lastDate === today) {
      return { success: false, message: "本日はすでにスタンプを受け取っています", isFirstTime: false };
    }

    const currentCount = parseInt(localStorage.getItem(STAMP_COUNT_KEY) || "0", 10);
    const currentVariants: StampVariant[] = JSON.parse(localStorage.getItem(STAMP_VARIANTS_KEY) || "[]");
    
    // Check if this is the first time ever
    const firstTimeEver = localStorage.getItem(STAMP_FIRST_TIME_KEY) === null;
    
    // Add 1 stamp, or 2 if first time
    const stampToAdd = firstTimeEver ? 2 : 1;
    const newCount = currentCount + stampToAdd;
    
    // Add variant(s)
    const newVariants = [...currentVariants];
    for (let i = 0; i < stampToAdd; i++) {
      newVariants.push(getRandomVariant());
    }

    localStorage.setItem(STAMP_COUNT_KEY, String(newCount));
    localStorage.setItem(STAMP_LAST_DATE_KEY, today);
    localStorage.setItem(STAMP_VARIANTS_KEY, JSON.stringify(newVariants));
    
    // Mark as not first time
    if (firstTimeEver) {
      localStorage.setItem(STAMP_FIRST_TIME_KEY, "false");
    }

    setStampCount(newCount);
    setStampVariants(newVariants);
    setCanStampToday(false);
    setIsFirstTime(false);

    const message = firstTimeEver 
      ? "はじめてのスタンプ！おまけ付き🎁" 
      : "スタンプを受け取りました！";

    return { success: true, message, isFirstTime: firstTimeEver };
  }, []);

  const resetStamps = useCallback(() => {
    localStorage.setItem(STAMP_COUNT_KEY, "0");
    localStorage.removeItem(STAMP_LAST_DATE_KEY);
    localStorage.setItem(STAMP_VARIANTS_KEY, "[]");
    setStampCount(0);
    setStampVariants([]);
    setCanStampToday(true);
  }, []);

  return {
    stampCount,
    uuid,
    canStampToday,
    stampVariants,
    isFirstTime,
    addStamp,
    resetStamps,
  };
}
