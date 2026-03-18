"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, MessageCircle, Plus } from "lucide-react";
import api from "@/lib/api";
import AuthGuard from "@/components/layout/AuthGuard";
import Button from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";

export default function SupportChatPage() {
  const { user } = useAuth();
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const qc = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: convData } = useQuery({
    queryKey: ["my-conversations"],
    queryFn: async () => { const { data } = await api.get("/api/v1/messages/conversations", { params: { conversation_type: "customer_support" } }); return data; },
  });

  const { data: msgData } = useQuery({
    queryKey: ["conversation-messages", selectedConv],
    queryFn: async () => { const { data } = await api.get(`/api/v1/messages/conversations/${selectedConv}/messages`); return data; },
    enabled: !!selectedConv,
    refetchInterval: 10000,
  });

  const sendMutation = useMutation({
    mutationFn: async () => { await api.post(`/api/v1/messages/conversations/${selectedConv}/messages`, { content: replyText }); },
    onSuccess: () => { setReplyText(""); qc.invalidateQueries({ queryKey: ["conversation-messages", selectedConv] }); },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post("/api/v1/messages/conversations", { conversation_type: "customer_support", subject: newSubject, initial_message: newMessage });
      return data;
    },
    onSuccess: (data) => { setShowNew(false); setNewSubject(""); setNewMessage(""); setSelectedConv(data.id); qc.invalidateQueries({ queryKey: ["my-conversations"] }); },
  });

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgData]);

  const conversations = convData?.items || [];
  const messages = msgData?.messages || [];

  return (
    <AuthGuard>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Support Chat</h1>
        <div className="flex gap-4 h-[500px]">
          {/* Conversations */}
          <div className="w-64 bg-white rounded-xl border overflow-y-auto flex-shrink-0">
            <div className="p-3 border-b">
              <button onClick={() => setShowNew(true)} className="w-full flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100">
                <Plus className="h-4 w-4" /> New Conversation
              </button>
            </div>
            {conversations.map((c: Record<string, string | number>) => (
              <button key={c.id as string} onClick={() => setSelectedConv(c.id as string)}
                className={`w-full text-left p-3 border-b hover:bg-gray-50 ${selectedConv === c.id ? "bg-blue-50" : ""}`}>
                <p className="text-sm font-medium truncate">{c.subject}</p>
                <p className="text-xs text-gray-500 truncate mt-1">{c.last_message_preview || "..."}</p>
              </button>
            ))}
          </div>

          {/* Chat */}
          <div className="flex-1 bg-white rounded-xl border flex flex-col">
            {!selectedConv ? (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center"><MessageCircle className="h-10 w-10 mx-auto mb-2 text-gray-300" /><p className="text-sm">Select or start a conversation</p></div>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((m: Record<string, string | boolean>) => (
                    <div key={m.id as string}>
                      {m.message_type === "system" ? (
                        <p className="text-center text-xs text-gray-400 italic my-2">{m.content}</p>
                      ) : (
                        <div className={`max-w-[70%] ${m.sender_id === user?.id ? "ml-auto" : ""}`}>
                          <p className="text-[10px] text-gray-400 mb-1">{m.sender_name}</p>
                          <div className={`rounded-lg p-3 text-sm ${m.sender_id === user?.id ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-800"}`}>
                            {m.content}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                <div className="p-3 border-t flex gap-2">
                  <input value={replyText} onChange={e => setReplyText(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && replyText.trim()) sendMutation.mutate(); }}
                    placeholder="Type a message..." className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                  <button onClick={() => { if (replyText.trim()) sendMutation.mutate(); }} disabled={!replyText.trim()}
                    className="p-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"><Send className="h-4 w-4" /></button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* New conversation modal */}
        {showNew && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/50" onClick={() => setShowNew(false)} />
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
              <h3 className="text-lg font-semibold mb-4">New Support Conversation</h3>
              <div className="space-y-3">
                <select value={newSubject} onChange={e => setNewSubject(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                  <option value="">Select a topic...</option>
                  <option value="Booking Issue">Booking Issue</option>
                  <option value="Refund Request">Refund Request</option>
                  <option value="Trip Delay">Trip Delay</option>
                  <option value="Lost Item">Lost Item</option>
                  <option value="General Question">General Question</option>
                </select>
                <textarea value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Describe your issue..." rows={3} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <Button variant="secondary" onClick={() => setShowNew(false)}>Cancel</Button>
                <Button onClick={() => createMutation.mutate()} loading={createMutation.isPending} disabled={!newSubject || !newMessage.trim()}>Start Chat</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
