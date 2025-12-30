"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/logo";
import { createClient } from "@/lib/supabase/client";
import { enableGuestMode, disableGuestMode, isGuestMode } from "@/lib/guest";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (isLogin) {
        // 登录
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        // 登录成功，重定向
        const redirect = searchParams.get("redirect") || "/";
        router.push(redirect);
        router.refresh();
      } else {
        // 注册
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (error) throw error;

        // 如果注册成功且用户已确认（某些情况下可能立即确认），迁移游客数据
        if (data.user && isGuestMode()) {
          const { migrateGuestWordsToUser } = await import("@/lib/storage");
          await migrateGuestWordsToUser(data.user.id);
          disableGuestMode();
          document.cookie = "mywords_guest_mode=; path=/; max-age=0";
        }

        setMessage("注册成功！请检查邮箱确认邮件。注册后，您的游客数据将自动迁移到新账号。");
        setEmail("");
        setPassword("");
      }
    } catch (error: any) {
      setError(error.message || "操作失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestAccess = async () => {
    enableGuestMode();
    // 设置 cookie 以便中间件识别游客模式
    document.cookie = "mywords_guest_mode=true; path=/; max-age=31536000"; // 1年
    const redirect = searchParams.get("redirect") || "/";
    router.push(redirect);
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Logo variant="message" />
            <span className="text-2xl font-light tracking-wide text-foreground">
              My Words
            </span>
          </div>
          <h1 className="text-3xl font-light tracking-tight mb-2">
            {isLogin ? "登录" : "注册"}
          </h1>
          <p className="text-sm text-muted-foreground font-light">
            {isLogin
              ? "登录你的账户继续学习"
              : "创建新账户开始学习"}
          </p>
        </div>

        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-center">
              {isLogin ? "登录" : "注册"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="邮箱地址"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                  disabled={loading}
                />
              </div>
              <div>
                <Input
                  type="password"
                  placeholder="密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="h-11"
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md">
                  {error}
                </div>
              )}

              {message && (
                <div className="p-3 bg-primary/10 text-primary text-sm rounded-md">
                  {message}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 font-normal"
                disabled={loading}
              >
                {loading
                  ? isLogin
                    ? "登录中..."
                    : "注册中..."
                  : isLogin
                  ? "登录"
                  : "注册"}
              </Button>
            </form>

            <div className="mt-6 space-y-3">
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError(null);
                    setMessage(null);
                  }}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors font-light"
                >
                  {isLogin
                    ? "还没有账户？点击注册"
                    : "已有账户？点击登录"}
                </button>
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/50" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">或</span>
                </div>
              </div>
              
              <Button
                type="button"
                variant="outline"
                className="w-full h-11 font-normal"
                onClick={handleGuestAccess}
                disabled={loading}
              >
                游客访问
              </Button>
              <p className="text-xs text-center text-muted-foreground font-light">
                游客模式下，数据仅保存在本地浏览器
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

