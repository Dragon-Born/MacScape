"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  // Always render the ThemeProvider to avoid hydration mismatches
  // The suppressHydrationWarning on html tag handles any minor theme differences
  return (
    <NextThemesProvider {...props}>
      {children}
    </NextThemesProvider>
  );
} 