/* eslint-disable */
"use client";
import { TypographyH2, TypographyP } from "@/components/ui/typography";
import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

interface ChatApiResponse {
  response?: string;
  error?: string;
}

export default function SpeciesChatbot() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState<{ role: "user" | "bot"; content: string }[]>([]);

  const handleInput = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  const handleSubmit = async () => {
    if (!message.trim()) return;

    // Add user message to log
    setChatLog((prev) => [...prev, { role: "user", content: message }]);
    setMessage("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      // ✅ Cast response JSON to our type
      const data = (await res.json()) as ChatApiResponse;

      setChatLog((prev) => [...prev, { role: "bot", content: data.response ?? "⚠️ No response from chatbot." }]);
    } catch (err) {
      console.error("Chatbot request failed:", err);
      setChatLog((prev) => [...prev, { role: "bot", content: "⚠️ Failed to contact the chatbot service." }]);
    }
  };

  return (
    <>
      <TypographyH2>Species Chatbot</TypographyH2>
      <div className="mt-4 flex gap-4">
        <div className="mt-4 rounded-lg bg-foreground p-4 text-background">
          <TypographyP>
            The Species Chatbot is a feature specialized to answer questions about animals. It can provide information
            on species’ habitat, diet, conservation status, and other relevant details. Any unrelated prompts will
            return a message saying it only handles species-related queries.
          </TypographyP>
          <TypographyP>
            To use the chatbot, type your question in the input field below and hit enter. The chatbot will respond with
            the best available information.
          </TypographyP>
        </div>
      </div>

      {/* Chat UI */}
      <div className="mx-auto mt-6">
        {/* Chat history */}
        <div className="h-[400px] space-y-3 overflow-y-auto rounded-lg border border-border bg-muted p-4">
          {chatLog.length === 0 ? (
            <p className="text-sm text-muted-foreground">Start chatting about a species!</p>
          ) : (
            chatLog.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] whitespace-pre-wrap rounded-2xl p-3 text-sm ${
                    msg.role === "user"
                      ? "rounded-br-none bg-primary text-primary-foreground"
                      : "rounded-bl-none border border-border bg-foreground text-primary-foreground"
                  }`}
                >
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Textarea + submit */}
        <div className="mt-4 flex flex-col items-end">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onInput={handleInput}
            rows={1}
            placeholder="Ask about a species..."
            className="w-full resize-none overflow-hidden rounded border border-border bg-background p-2 text-sm text-foreground focus:outline-none"
          />
          <button
            type="button"
            onClick={() => void handleSubmit()} // ✅ properly voided
            className="mt-2 rounded bg-primary px-4 py-2 text-background transition hover:opacity-90"
          >
            Enter
          </button>
        </div>
      </div>
    </>
  );
}
