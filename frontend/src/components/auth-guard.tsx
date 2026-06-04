"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import { authApi } from "@/lib/api";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { accessToken, user, setUser, logout } = useAuthStore();
  const [validated, setValidated] = useState(false);

  useEffect(() => {
    if (!accessToken) {
      router.replace("/login");
      return;
    }

    // Validate token and refresh user data on mount
    authApi.me()
      .then((me) => {
        setUser(me);
        setValidated(true);
      })
      .catch(() => {
        logout();
        router.replace("/login");
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!validated || !user) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[#1E3A8A] border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 dark:text-slate-400 text-sm font-sans-body">Loading…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
