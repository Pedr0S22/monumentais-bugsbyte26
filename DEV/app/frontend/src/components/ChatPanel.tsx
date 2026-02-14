import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { chat } from "../api/client";

export function ChatPanel() {
  const [message, setMessage] = useState("");
  const mutation = useMutation({ mutationFn: () => chat(message) });

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Letty chat (stub)</h3>
        {mutation.isPending && <span className="text-xs text-white/60">Thinking…</span>}
      </div>
      <textarea
        className="w-full rounded bg-white/10 px-3 py-2 text-white"
        rows={3}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Ask Letty for a quick tip"
      />
      <button
        onClick={() => mutation.mutate()}
        disabled={!message || mutation.isPending}
        className="px-4 py-2 rounded bg-lettyYellow text-slate-900 font-semibold hover:brightness-110 disabled:opacity-60"
      >
        Send
      </button>
      {mutation.isSuccess && (
        <div className="text-sm text-white/90 bg-white/5 border border-white/10 rounded p-3">
          {mutation.data?.reply}
        </div>
      )}
      {mutation.isError && <div className="text-sm text-lettyRed">{(mutation.error as Error).message}</div>}
    </div>
  );
}
