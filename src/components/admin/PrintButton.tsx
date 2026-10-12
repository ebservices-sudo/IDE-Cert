"use client";

import { Printer } from "lucide-react";
import { buttonCls } from "./ui";

export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className={buttonCls.dark}>
      <Printer aria-hidden className="size-4" />
      Print
    </button>
  );
}
