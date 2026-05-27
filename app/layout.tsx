import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "韩娱关系模拟器 DeepSeek版",
  description: "DeepSeek驱动互动小说模拟器"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
