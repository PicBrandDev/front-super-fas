"use client";

import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

/**
 * Coluna de conteúdo + menu de baixo (celular).
 * No celular o conteúdo reserva o espaço do deck (--navspace); no desktop
 * o menu lateral faz esse papel e a coluna fica centralizada (até 600px).
 */
export function FanFrame({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="pb-navspace relative min-h-dvh w-full min-w-0 flex-1 lg:mx-auto lg:max-w-[600px] lg:border-x lg:border-line lg:pb-12">
        {children}
      </div>
      <BottomNav />
    </>
  );
}
