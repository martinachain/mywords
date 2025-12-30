"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/logo";
import { UserMenu } from "@/components/user-menu";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  useEffect(() => {
    // 获取当前用户
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // 监听认证状态变化
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);


  return (
    <nav className="border-b border-border/30 bg-background/80 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2.5">
            <Logo variant="message" />
            <span className="text-lg font-light tracking-wide text-foreground">
              My Words
            </span>
          </Link>
          <div className="flex items-center space-x-6">
            {user && (
              <>
                {pathname !== "/" && (
                  <Link
                    href="/"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors font-light"
                  >
                    首页
                  </Link>
                )}
                {pathname !== "/vocabulary" && (
                  <Link
                    href="/vocabulary"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors font-light"
                  >
                    生词库
                  </Link>
                )}
                <UserMenu user={user} />
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

