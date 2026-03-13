import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send, Sparkles, Paperclip } from "lucide-react";
import { Button } from "../ui/Button";
import { aiService } from "../../services/api";

const renderTextWithLinks = (text, keyPrefix) =>
  text.split(/(https?:\/\/[^\s]+)/g).map((part, index) => {
    if (/^https?:\/\/[^\s]+$/.test(part)) {
      return (
        <a
          key={`${keyPrefix}-link-${index}`}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 text-blue-600 dark:text-blue-300 break-all"
        >
          {part}
        </a>
      );
    }

    return <React.Fragment key={`${keyPrefix}-text-${index}`}>{part}</React.Fragment>;
  });

const renderInlineMarkdown = (text) =>
  text.split(/(\*\*.*?\*\*)/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={`strong-${index}`}>
          {renderTextWithLinks(part.slice(2, -2), `strong-${index}`)}
        </strong>
      );
    }

    return (
      <React.Fragment key={`inline-${index}`}>
        {renderTextWithLinks(part, `inline-${index}`)}
      </React.Fragment>
    );
  });

const renderMarkdownText = (text) => {
  const lines = String(text || "").split("\n");
  const blocks = [];
  let bulletItems = [];

  const flushBulletItems = () => {
    if (!bulletItems.length) return;

    blocks.push(
      <ul key={`list-${blocks.length}`} className="list-disc pl-5 space-y-1">
        {bulletItems.map((item, index) => (
          <li key={index}>{renderInlineMarkdown(item)}</li>
        ))}
      </ul>
    );
    bulletItems = [];
  };

  lines.forEach((rawLine, index) => {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    if (!trimmed) {
      flushBulletItems();
      blocks.push(<div key={`space-${index}`} className="h-2" />);
      return;
    }

    const bulletMatch = trimmed.match(/^[-*]\s+(.*)$/);
    if (bulletMatch) {
      bulletItems.push(bulletMatch[1]);
      return;
    }

    flushBulletItems();

    const headingMatch = trimmed.match(/^(#{1,3})\s+(.*)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const headingClass =
        level === 1
          ? "text-base font-bold"
          : level === 2
            ? "text-[15px] font-bold"
            : "text-sm font-semibold";

      blocks.push(
        <div key={`heading-${index}`} className={headingClass}>
          {renderInlineMarkdown(headingMatch[2])}
        </div>
      );
      return;
    }

    blocks.push(
      <p key={`paragraph-${index}`} className="leading-relaxed">
        {renderInlineMarkdown(trimmed)}
      </p>
    );
  });

  flushBulletItems();
  return blocks;
};

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I am Campus AI. Ask me about exams, syllabus, study plans, or campus events.",
      isBot: true,
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);
  const fileInputRef = useRef(null);

  const buildHistory = (allMessages) =>
    allMessages.slice(-8).map((item) => ({
      role: item.isBot ? "assistant" : "user",
      content: item.text,
    }));

  const handleSend = async (e) => {
    e.preventDefault();

    const trimmedInput = input.trim();
    if ((!trimmedInput && !attachedFile) || isTyping) return;

    const finalPrompt = trimmedInput || "Please analyze the attached file.";

    const userMsg = {
      id: Date.now(),
      text: attachedFile
        ? `${finalPrompt}\n\n[Attached: ${attachedFile.name}]`
        : finalPrompt,
      isBot: false,
    };
    const nextMessages = [...messages, userMsg];

    setMessages(nextMessages);
    setInput("");
    setIsTyping(true);

    try {
      const history = buildHistory(messages);
      const payload = attachedFile ? new FormData() : null;

      let response;
      if (payload) {
        payload.append("message", finalPrompt);
        payload.append("history", JSON.stringify(history));
        payload.append("file", attachedFile);
        response = await aiService.chat(payload);
      } else {
        response = await aiService.chat({
          message: finalPrompt,
          history,
        });
      }

      const botMsg = {
        id: Date.now() + 1,
        text: response.data?.reply || "I could not generate a response.",
        isBot: true,
      };
      setMessages((prev) => [...prev, botMsg]);
      setAttachedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      const backendMessage = error?.response?.data?.message;
      const backendDetails = error?.response?.data?.details;
      const errorMessage = [backendMessage, backendDetails]
        .filter(Boolean)
        .join("\n");

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: errorMessage || "Campus AI is unavailable right now. Please try again.",
          isBot: true,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full shadow-2xl flex items-center justify-center text-white z-50 ${isOpen ? "hidden" : "flex"}`}
      >
        <Bot className="w-8 h-8" />
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
        </span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="fixed bottom-6 right-6 w-[92vw] md:w-[50vw] h-[70vh] md:h-[72vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden z-50"
          >
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <Bot className="w-6 h-6" />
                <span className="font-bold">Campus AI</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 rounded-full p-1"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-slate-950">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.isBot ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl text-sm whitespace-pre-wrap break-words ${
                      msg.isBot
                        ? "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-none"
                        : "bg-indigo-600 text-white rounded-tr-none"
                    }`}
                  >
                    {msg.isBot && <Sparkles className="w-3 h-3 text-yellow-400 mb-1" />}
                    {msg.isBot ? renderMarkdownText(msg.text) : msg.text}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-slate-200 dark:border-slate-700">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <form
              onSubmit={handleSend}
              className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 space-y-2"
            >
              {attachedFile && (
                <div className="flex items-center justify-between rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-2 text-xs text-slate-700 dark:text-slate-200">
                  <span className="truncate pr-2">Attached: {attachedFile.name}</span>
                  <button
                    type="button"
                    className="text-slate-500 hover:text-red-500"
                    onClick={() => {
                      setAttachedFile(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*,.txt,.md,.csv,.json,.xml,.html,.css,.js,.jsx,.ts,.tsx,.py,.java,.c,.cpp,.h,.hpp,.go,.rs,.php,.sh,.yml,.yaml,.sql,.log,text/*,application/json,application/xml,application/javascript"
                  onChange={(e) => setAttachedFile(e.target.files?.[0] || null)}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-200 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700"
                  title="Attach file"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Campus AI..."
                  className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="bg-indigo-600 hover:bg-indigo-700"
                  disabled={isTyping}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIAssistant;
