"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, LogOut, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";

interface UserMenuProps {
  user: SupabaseUser | null;
}

export function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  if (!user) return null;

  // 获取用户邮箱或显示名称
  const userEmail = user.email || "用户";
  const displayName = userEmail.split("@")[0];

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="text-sm text-muted-foreground hover:text-foreground font-light flex items-center gap-2"
      >
        <User className="size-4" />
        <span className="hidden sm:inline">{displayName}</span>
        <ChevronDown className={cn("size-4 transition-transform", isOpen && "rotate-180")} />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-md border border-border/50 bg-background shadow-lg z-50">
          <div className="p-2">
            <div className="px-3 py-2 border-b border-border/50 mb-2">
              <p className="text-sm font-medium text-foreground">{displayName}</p>
              <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="w-full justify-start text-sm text-muted-foreground hover:text-foreground font-light"
            >
              <LogOut className="size-4 mr-2" />
              退出登录
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

