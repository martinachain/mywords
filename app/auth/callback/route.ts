import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { migrateGuestWordsToUser } from "@/lib/storage";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await createClient();
    const { data } = await supabase.auth.exchangeCodeForSession(code);
    
    // 如果用户已确认邮箱，迁移游客数据
    if (data.user) {
      // 注意：这里在服务器端无法直接访问 localStorage
      // 我们会在客户端组件中处理迁移
    }
  }

  // URL to redirect to after sign in process completes
  const response = NextResponse.redirect(`${origin}/`);
  // 清除游客模式 cookie
  response.cookies.delete("mywords_guest_mode");
  return response;
}

