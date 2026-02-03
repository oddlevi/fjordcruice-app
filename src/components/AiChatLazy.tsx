"use client";

import dynamic from "next/dynamic";

const AiChat = dynamic(() => import("@/components/AiChat").then((m) => m.AiChat), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center py-12">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
    </div>
  ),
});

export function AiChatLazy() {
  return <AiChat />;
}
