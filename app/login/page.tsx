"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/logo";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
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
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (error) throw error;

        setMessage("注册成功！请检查邮箱确认邮件。");
        setEmail("");
        setPassword("");
      }
    } catch (error: any) {
      setError(error.message || "操作失败，请重试");
    } finally {
      setLoading(false);
    }
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

            <div className="mt-6 text-center">
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

