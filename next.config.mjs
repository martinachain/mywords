import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  // 明确配置 Turbopack（即使为空，也可以避免警告）
  turbopack: {},
  // 禁用 Next.js 开发工具（左下角的调试面板）
  devIndicators: {
    buildActivity: false,
    buildActivityPosition: "bottom-right",
  },
  // 确保输出模式正确（Netlify 需要）
  output: undefined, // 让 Next.js 自动检测，Netlify 插件会处理
};

export default withPWA(nextConfig);

