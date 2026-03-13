const GEMINI_API_URL =
  process.env.GEMINI_API_URL || "https://generativelanguage.googleapis.com/v1beta";
const GEMINI_MODEL =
  process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
const MAX_FILE_TEXT_CHARS = 12000;

const TEXT_MIME_PREFIXES = ["text/"];
const TEXT_MIME_TYPES = new Set([
  "application/json",
  "application/javascript",
  "application/xml",
  "application/x-yaml",
  "application/yaml",
  "application/x-sh",
  "application/sql",
  "application/csv",
]);
const TEXT_EXTENSIONS = new Set([
  ".txt",
  ".md",
  ".csv",
  ".json",
  ".xml",
  ".html",
  ".css",
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".py",
  ".java",
  ".c",
  ".cpp",
  ".h",
  ".hpp",
  ".go",
  ".rs",
  ".php",
  ".sh",
  ".yml",
  ".yaml",
  ".sql",
  ".log",
]);
const SUPPORTED_INLINE_MIME_TYPES = new Set([
  "application/pdf",
]);

const getFileExtension = (fileName = "") => {
  const lastDot = fileName.lastIndexOf(".");
  if (lastDot === -1) return "";
  return fileName.slice(lastDot).toLowerCase();
};

const isTextFile = (file) => {
  if (!file) return false;

  const mimeType = (file.mimetype || "").toLowerCase();
  const hasTextPrefix = TEXT_MIME_PREFIXES.some((prefix) => mimeType.startsWith(prefix));
  if (hasTextPrefix || TEXT_MIME_TYPES.has(mimeType)) {
    return true;
  }

  return TEXT_EXTENSIONS.has(getFileExtension(file.originalname));
};

const isInlineGeminiFile = (file) => {
  if (!file) return false;

  const mimeType = (file.mimetype || "").toLowerCase();
  return mimeType.startsWith("image/") || SUPPORTED_INLINE_MIME_TYPES.has(mimeType);
};

const parseHistory = (history) => {
  let parsedHistory = history;

  if (typeof parsedHistory === "string") {
    try {
      parsedHistory = JSON.parse(parsedHistory);
    } catch (error) {
      parsedHistory = [];
    }
  }

  return Array.isArray(parsedHistory)
    ? parsedHistory
        .filter(
          (item) =>
            item &&
            (item.role === "user" || item.role === "assistant") &&
            typeof item.content === "string"
        )
        .slice(-8)
    : [];
};

const buildSystemPrompt = (user) => {
  const userContext = [
    `Name: ${user?.name || "Unknown"}`,
    `Role: ${user?.role || "student"}`,
  ].join(", ");

  return [
    "You are Campus AI, a helpful academic assistant for CampusSync.",
    `Current user: ${userContext}.`,
    "Prioritize concise, actionable student guidance.",
    "If a request needs official college policy or dates, tell the user to verify with faculty/admin.",
    "Never claim access to private records, marksheets, or personal data.",
    "Use markdown formatting when it improves readability, especially bold headings or bullet lists.",
    "If the user asks unsafe or illegal content, refuse and suggest a safe alternative.",
  ].join(" ");
};

const buildTextFileContext = (file) => {
  const extractedText = file.buffer.toString("utf8").replace(/\u0000/g, "").trim();

  if (!extractedText) {
    return null;
  }

  const limitedText = extractedText.slice(0, MAX_FILE_TEXT_CHARS);

  return [
    `Attached file name: ${file.originalname}`,
    `Attached file type: ${file.mimetype || "unknown"}`,
    "Use the attached file content to answer accurately.",
    "Attached file content:",
    limitedText,
  ].join("\n");
};

const buildGeminiContents = ({ systemPrompt, history, promptText, file }) => {
  const contents = history.map((item) => ({
    role: item.role === "assistant" ? "model" : "user",
    parts: [{ text: item.content }],
  }));

  const userParts = [{ text: promptText }];

  if (file) {
    if (isTextFile(file)) {
      const fileContext = buildTextFileContext(file);

      if (!fileContext) {
        return { error: "Uploaded file is empty or unreadable." };
      }

      userParts[0] = { text: `${promptText}\n\n${fileContext}` };
    } else if (isInlineGeminiFile(file)) {
      userParts.push({
        inline_data: {
          mime_type: file.mimetype,
          data: file.buffer.toString("base64"),
        },
      });
    } else {
      return {
        error:
          "This file type is not supported yet. Please upload images, PDFs, text, code, JSON, CSV, or markdown files.",
      };
    }
  }

  contents.push({
    role: "user",
    parts: userParts,
  });

  return {
    systemInstruction: {
      parts: [{ text: systemPrompt }],
    },
    contents,
  };
};

const extractGeminiText = (data) => {
  const parts = data?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return "";

  return parts
    .map((part) => part?.text || "")
    .join("")
    .trim();
};

exports.chatWithCampusAI = async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        message: "Gemini API key is missing.",
        details: "Set GEMINI_API_KEY in backend/.env and restart the backend.",
      });
    }

    const { message } = req.body;
    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    const promptText = message.trim();
    const history = parseHistory(req.body.history);
    const systemPrompt = buildSystemPrompt(req.user);
    const requestBody = buildGeminiContents({
      systemPrompt,
      history,
      promptText,
      file: req.file,
    });

    if (requestBody.error) {
      return res.status(400).json({ message: requestBody.error });
    }

    const response = await fetch(
      `${GEMINI_API_URL}/models/${GEMINI_MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          ...requestBody,
          generationConfig: {
            temperature: 0.4,
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(502).json({
        message: "Campus AI service error",
        details:
          data?.error?.message || `Gemini request failed with HTTP ${response.status}.`,
      });
    }

    const aiText = extractGeminiText(data);
    if (!aiText) {
      return res.status(502).json({
        message: "Campus AI returned an empty response",
      });
    }

    return res.status(200).json({
      reply: aiText,
      model: GEMINI_MODEL,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Campus AI is not reachable right now.",
      details: error.message,
    });
  }
};
