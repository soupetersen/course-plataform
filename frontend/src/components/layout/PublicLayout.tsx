import type { ReactNode } from "react";
import { PublicHeader } from "./PublicHeader";

interface PublicLayoutProps {
  children: ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <main>{children}</main>
    </div>
  );
}
