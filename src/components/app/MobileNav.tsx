"use client";

import { usePathname } from "next/navigation";
import { Drawer } from "@/components/app/ui/Drawer";
import { NavList } from "@/components/app/NavList";

export function MobileNav({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const pathname = usePathname();
  return (
    <Drawer open={open} onOpenChange={onOpenChange} title="MODUS">
      <NavList pathname={pathname} onNavigate={() => onOpenChange(false)} />
    </Drawer>
  );
}
