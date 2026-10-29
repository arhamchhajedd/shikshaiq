"use client";

import React, { useState, useEffect, useRef, useTransition } from "react";
import {
  Sparkles,
  X,
  Send,
  Loader2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { ConceptId } from "@/types/curriculum";
import { CONCEPTS } from "@/lib/curriculum/concepts";
import { TutorLanguage, TutorMessage, TutorContextType } from "@/types/tutor";
import { TUTOR_QUICK_ACTIONS } from "@/lib/tutor/prompts";
import { getOrCreateTutorConversation } from "@/lib/tutor/tutorActions";
import { syncManager } from "@/lib/offline/syncManager";
import { WifiOff } from "lucide-react";

interface SocraticTutorDrawerProps {
  conceptId: ConceptId;
  contextType?: TutorContextType;
  currentQuestionId?: string;
  currentQuestionPrompt?: string;
}

export function SocraticTutorDrawer({
  conceptId,
  contextType = "learn",
  currentQuestionId,
}: SocraticTutorDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof window !== "undefined" ? syncManager.getOnlineStatus() : true
  );
  const [language, setLanguage] = useState<TutorLanguage>("en");
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const conceptMeta = CONCEPTS[conceptId];

  // Monitor online status
  useEffect(() => {
    const unsub = syncManager.subscribe((state) => {
      setIsOnline(state.isOnline);
    });
    return unsub;
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isSending]);

  // Load conversation when opened
  useEffect(() => {
    if (!isOpen) return;

    let ignore = false;
    startTransition(async () => {
      try {
        const res = await getOrCreateTutorConversation(conceptId, contextType);
        if (!ignore && res.success && res.conversation) {
          setConversationId(res.conversation.id);
          if (res.conversation.messages && res.conversation.messages.length > 0) {
            setMessages(res.conversation.messages);
          } else {
            // Friendly default greeting
            setMessages([
              {
                id: "initial_greeting",
                role: "assistant",
                content:
                  language === "hi"
                    ? `नमस्ते! मैं आपका ShikshaIQ AI ट्यूटर हूँ। हम "${conceptMeta?.title}" सीख रहे हैं। आपका कोई भी सवाल हो, बेझिझक पूछें!`
                    : language === "mr"
                    ? `नमस्कार! मी तुमचा ShikshaIQ AI ट्यूटर आहे. आपण "${conceptMeta?.title}" शिकत आहोत. काही अडचण असल्यास विचारू शकता!`
                    : `Hello! I'm your ShikshaIQ Socratic Math Tutor. We are studying ${conceptMeta?.title}. How can I guide you today?`,
                createdAt: new Date().toISOString(),
                language,
              },
            ]);
          }
        }
      } catch (err) {
        console.error("Failed to load tutor conversation:", err);
      }
    });

    return () => {
      ignore = true;
    };
  }, [isOpen, conceptId, contextType, language, conceptMeta?.title]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isSending) return;

    setErrorMessage(null);
    setErrorCode(null);
    setInputMessage("");

    const userMessage: TutorMessage = {
      id: `user_${Date.now()}`,
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
      language,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsSending(true);

    try {
      const response = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conceptId,
          contextType,
          message: text,
          language,
          conversationId: conversationId || undefined,
          currentQuestionId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setErrorMessage(data.error || "Failed to receive guidance from the AI Tutor.");
        setErrorCode(data.errorCode || "PROVIDER_ERROR");
        return;
      }

      if (data.conversationId && !conversationId) {
        setConversationId(data.conversationId);
      }

      if (data.message) {
        setMessages((prev) => [...prev, data.message]);
      }
    } catch {
      setErrorMessage("Network connection error. Please check your connection and try again.");
      setErrorCode("NETWORK_ERROR");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickActions = TUTOR_QUICK_ACTIONS[language] || TUTOR_QUICK_ACTIONS.en;

  return (
    <>
      {/* Floating Trigger Pill */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2.5 px-4 sm:px-5 py-3 rounded-full bg-black text-white hover:bg-neutral-800 shadow-[0_8px_30px_rgba(0,0,0,0.15)] active:scale-95 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
          aria-label="Open ShikshaIQ AI Socratic Tutor"
        >
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          <span className="text-xs sm:text-sm font-semibold tracking-tight">Ask AI Tutor</span>
          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-white/20 text-white font-medium">
            Class 7
          </span>
        </button>
      )}

      {/* Slide-over Tutoring Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-xs transition-opacity"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Surface */}
          <div className="relative w-full sm:w-[440px] md:w-[480px] bg-white h-full shadow-2xl flex flex-col justify-between border-l border-black/10 z-10 animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-black/[0.08] bg-[#fbfbfd] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-neutral-900 tracking-tight flex items-center gap-1.5">
                    <span>ShikshaIQ AI Tutor</span>
                    <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-black/5 text-neutral-600 border border-black/5">
                      Socratic
                    </span>
                  </h2>
                  <p className="text-[11px] text-neutral-500 font-medium truncate max-w-[220px]">
                    {conceptMeta?.title || "Class 7 Mathematics"}
                  </p>
                </div>
              </div>

              {/* Language Switcher & Close */}
              <div className="flex items-center gap-2">
                <div className="flex items-center p-0.5 bg-neutral-100 rounded-lg border border-black/5 text-[11px] font-medium">
                  <button
                    type="button"
                    onClick={() => setLanguage("en")}
                    className={`px-2 py-1 rounded-md transition-all ${
                      language === "en" ? "bg-white text-black shadow-xs font-semibold" : "text-neutral-500 hover:text-black"
                    }`}
                    title="English"
                  >
                    EN
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage("hi")}
                    className={`px-2 py-1 rounded-md transition-all ${
                      language === "hi" ? "bg-white text-black shadow-xs font-semibold" : "text-neutral-500 hover:text-black"
                    }`}
                    title="हिन्दी (Hindi)"
                  >
                    हि
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage("mr")}
                    className={`px-2 py-1 rounded-md transition-all ${
                      language === "mr" ? "bg-white text-black shadow-xs font-semibold" : "text-neutral-500 hover:text-black"
                    }`}
                    title="मराठी (Marathi)"
                  >
                    म
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-black flex items-center justify-center transition-colors"
                  aria-label="Close AI Tutor Drawer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Message Thread Body */}
            <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4">
              {isPending && messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-center p-6 text-neutral-400">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-neutral-900" />
                  <p className="text-xs">Connecting to tutoring session...</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      <span className="text-[10px] font-medium text-neutral-400">
                        {msg.role === "user" ? "You" : "ShikshaIQ Tutor"}
                      </span>
                    </div>

                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-black text-white rounded-tr-xs"
                          : "bg-neutral-100 text-neutral-900 border border-black/5 rounded-tl-xs"
                      }`}
                    >
                      <div className="whitespace-pre-wrap font-sans">{msg.content}</div>
                    </div>
                  </div>
                ))
              )}

              {/* Generating / Thinking Indicator */}
              {isSending && (
                <div className="flex items-start gap-2">
                  <div className="bg-neutral-100 text-neutral-600 rounded-2xl rounded-tl-xs px-4 py-3 text-xs flex items-center gap-2 border border-black/5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-neutral-900" />
                    <span>Thinking Socratic step...</span>
                  </div>
                </div>
              )}

              {/* Truthful Error / Unconfigured Notice */}
              {errorMessage && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs space-y-1.5">
                  <div className="flex items-center gap-2 font-semibold">
                    <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>
                      {errorCode === "UNCONFIGURED"
                        ? "AI Provider Key Required"
                        : errorCode === "RATE_LIMITED"
                        ? "Rate Limit Reached"
                        : "Tutoring Notice"}
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-amber-800">{errorMessage}</p>
                  {errorCode !== "UNCONFIGURED" && (
                    <button
                      type="button"
                      onClick={() => handleSendMessage()}
                      className="mt-1 text-[11px] font-semibold text-amber-950 underline hover:text-black flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Retry question</span>
                    </button>
                  )}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Action Chips & Input Area */}
            <div className="p-3 sm:p-4 border-t border-black/[0.08] bg-[#fbfbfd] space-y-3 shrink-0">
              {!isOnline && (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/60 text-amber-900 text-xs flex items-center gap-2">
                  <WifiOff className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>
                    Offline Mode: AI Tutoring requires internet connectivity. You can read the cached lesson and practice offline below.
                  </span>
                </div>
              )}

              {/* Quick Action Suggestion Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {quickActions.map((action, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(action.prompt)}
                    disabled={isSending || !isOnline}
                    className="shrink-0 px-2.5 py-1 rounded-full bg-white hover:bg-neutral-100 text-neutral-700 hover:text-black border border-black/10 text-[11px] font-medium transition-colors disabled:opacity-40 cursor-pointer shadow-2xs"
                  >
                    {action.label}
                  </button>
                ))}
              </div>

              {/* Chat Text Input Area */}
              <div className="relative flex items-center gap-2 bg-white rounded-2xl border border-black/10 p-1.5 focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-all">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    !isOnline
                      ? "AI Tutoring unavailable offline. Practice offline below..."
                      : language === "hi"
                      ? "गणित का सवाल पूछें (Enter दबाएँ)..."
                      : language === "mr"
                      ? "गणिताचा प्रश्न विचारा (Enter दाबा)..."
                      : "Ask a math question (Press Enter to send)..."
                  }
                  rows={2}
                  maxLength={500}
                  disabled={isSending || !isOnline}
                  className="w-full resize-none px-2.5 py-1 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 bg-transparent focus:outline-none disabled:opacity-50"
                />

                <div className="flex flex-col items-center justify-between self-stretch shrink-0 pr-1">
                  <span className="text-[9px] font-mono text-neutral-400 select-none">
                    {inputMessage.length}/500
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSendMessage()}
                    disabled={!inputMessage.trim() || isSending || !isOnline}
                    className="p-2 rounded-xl bg-black text-white hover:bg-neutral-800 disabled:opacity-30 disabled:hover:bg-black transition-all cursor-pointer shadow-2xs"
                    aria-label="Send question to tutor"
                  >
                    {isSending ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
