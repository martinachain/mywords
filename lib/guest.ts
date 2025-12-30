// 游客模式管理工具

const GUEST_USER_ID_KEY = "mywords_guest_user_id";
const GUEST_MODE_KEY = "mywords_guest_mode";

// 生成或获取游客用户ID
export function getGuestUserId(): string {
  if (typeof window === "undefined") {
    return "00000000-0000-0000-0000-000000000000";
  }

  let guestUserId = localStorage.getItem(GUEST_USER_ID_KEY);
  
  if (!guestUserId) {
    // 生成一个唯一的游客ID（使用时间戳和随机数）
    guestUserId = `guest-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem(GUEST_USER_ID_KEY, guestUserId);
  }
  
  return guestUserId;
}

// 检查是否为游客模式
export function isGuestMode(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(GUEST_MODE_KEY) === "true";
}

// 启用游客模式
export function enableGuestMode(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(GUEST_MODE_KEY, "true");
  // 确保有游客ID
  getGuestUserId();
}

// 禁用游客模式
export function disableGuestMode(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(GUEST_MODE_KEY);
}

// 清除游客数据
export function clearGuestData(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(GUEST_USER_ID_KEY);
  localStorage.removeItem(GUEST_MODE_KEY);
}

