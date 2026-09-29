"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { sendMessage, markRead } from "@/lib/actions/messages";
import { createClient } from "@/lib/supabase/client";
import { formatDateTime } from "@/lib/format";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormMessage } from "@/components/ui/form";
import type { Message } from "@/lib/types";
import { cn } from "@/lib/utils";

export function MessageThread({
  projectId,
  initial,
  currentUserId,
  otherName,
}: {
  projectId: string;
  initial: Message[];
  currentUserId: string;
  otherName: string;
}) {
  const [messages, setMessages] = useState(initial);
  const [state, action] = useActionState(sendMessage, null);
  const formRef = useRef<HTMLFormElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMessages(initial), [initial]);

  // Realtime: nieuwe berichten direct tonen
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`messages:${projectId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `project_id=eq.${projectId}` }, (payload) => {
        const m = payload.new as Message;
        setMessages((prev) => (prev.some((p) => p.id === m.id) ? prev : [...prev, m]));
        if (m.sender_id !== currentUserId) markRead(projectId);
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, currentUserId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages.length]);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <div className="flex flex-col rounded-2xl border border-ink-700/70 bg-ink-900/60">
      <div className="max-h-[60vh] min-h-64 space-y-4 overflow-y-auto p-4 md:p-6">
        {messages.length === 0 && <p className="py-10 text-center text-sm text-mist">Nog geen berichten. Stel gerust je vraag of deel je ideeën.</p>}
        {messages.map((m) => {
          const mine = m.sender_id === currentUserId;
          return (
            <div key={m.id} className={cn("flex flex-col", mine ? "items-end" : "items-start")}>
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap md:max-w-[70%]",
                  mine ? "rounded-br-md bg-bone text-ink-950" : "rounded-bl-md border border-ink-700 bg-ink-850 text-bone-dim",
                )}
              >
                {m.body}
              </div>
              <span className="mt-1 px-1 text-[11px] text-mist-dim">
                {mine ? "Jij" : otherName} · {formatDateTime(m.created_at)}
              </span>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
      <form ref={formRef} action={action} className="space-y-3 border-t border-ink-700/70 p-3 md:p-4">
        <input type="hidden" name="project_id" value={projectId} />
        <div className="flex items-end gap-2">
          <textarea
            name="body"
            required
            rows={2}
            placeholder="Schrijf een bericht…"
            className="field min-h-12 flex-1 resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) formRef.current?.requestSubmit();
            }}
          />
          <SubmitButton pendingText="…">Stuur</SubmitButton>
        </div>
        {state?.error && <FormMessage state={state} />}
      </form>
    </div>
  );
}
