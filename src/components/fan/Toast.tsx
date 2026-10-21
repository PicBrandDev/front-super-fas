"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { Icon } from "@/components/icons";

type ToastCtx = { show: (message: string) => void };

const Ctx = createContext<ToastCtx | null>(null);

/** Aviso curto acima do menu ("Repostado no seu perfil"), some em 2,2 s. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const show = useCallback((message: string) => {
    setMsg(message);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setMsg(null), 2200);
  }, []);
  return (
    <Ctx.Provider value={{ show }}>
      {children}
      <div className="toast" role="status" hidden={!msg}>
        {msg && (
          <>
            <Icon name="check" size={16} />
            {msg}
          </>
        )}
      </div>
    </Ctx.Provider>
  );
}

export function useToast(): ToastCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useToast precisa estar dentro de <ToastProvider>");
  return v;
}
