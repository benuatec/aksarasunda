import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

/**
 * Supabase Keep-Alive Hook
 *
 - Ping Supabase tiap 6 jam selama user buka app
 * - Ping tambahan setiap kali tab jadi aktif lagi
 * - Tujuan: biar project free-tier gak ke-pause (butuh aktivitas min sekali per 7 hari)
 *
 * Cara pakai:
 *   import { useSupabaseKeepAlive } from "@/hooks/use-supabase-keepalive";
 *   useSupabaseKeepAlive();
 */

const KEEPALIVE_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 jam
const STORAGE_KEY = "sunda-keepalive-last";

export function useSupabaseKeepAlive() {
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!supabase) return;

    const ping = async (reason: string) => {
      try {
        // Query ringan ke tabel admin_profiles (gak nge-mutate data, cuma count)
        // Pakai limit 1 biar hemat bandwidth
        const { error } = await supabase
          .from("admin_profiles")
          .select("id", { count: "exact", head: true })
          .limit(1);

        if (error) {
          console.warn(`[keepalive] ${reason}: ${error.message}`);
        } else {
          localStorage.setItem(STORAGE_KEY, new Date().toISOString());
        }
      } catch (err) {
        // Silent fail — kalo offline ya gpp, next attempt pasti nyoba lagi
        console.warn(`[keepalive] ${reason}: ${err}`);
      }
    };

    // Ping pertama kali pas app mount
    void ping("mount");

    // Ping periodik tiap 6 jam
    timerRef.current = window.setInterval(() => {
      void ping("interval");
    }, KEEPALIVE_INTERVAL_MS);

    // Ping tambahan kalo user balik ke tab setelah lama
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const last = localStorage.getItem(STORAGE_KEY);
        const lastDate = last ? new Date(last) : new Date(0);
        const hoursSinceLast =
          (Date.now() - lastDate.getTime()) / (1000 * 60 * 60);

        // Kalo terakhir ping > 12 jam, ping lagi
        if (hoursSinceLast > 12) {
          void ping("visibility");
        }
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
      }
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);
}

/**
 * Helper buat liat kapan terakhir ping (bisa dipake di admin panel)
 */
export function getLastKeepAlive(): Date | null {
  if (typeof window === "undefined") return null;
  const v = localStorage.getItem(STORAGE_KEY);
  return v ? new Date(v) : null;
}
