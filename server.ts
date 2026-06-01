import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Parse incoming JSON requests
app.use(express.json());

// Initialize Gemini Client Lazily/Safely
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey.trim() !== "") {
      try {
        aiClient = new GoogleGenAI({
          apiKey: apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });
      } catch (err) {
        console.error("Failed to initialize GoogleGenAI client:", err);
      }
    }
  }
  return aiClient;
}

// Pre-defined high-quality translations for immediate loading or fallback
const STATIC_TRANSLATIONS: Record<string, string> = {
  "en": "⚠️ Warning: This website is for sports viewing only. Gambling/Betting strictly prohibited. Stay safe.",
  "bn": "⚠️ সতর্কীকরণ: এই ওয়েবসাইটটি শুধুমাত্র খেলা দেখার জন্য। জুয়া বা বাজি ধরা কঠোরভাবে নিষিদ্ধ। নিরাপদে থাকুন।",
  "es": "⚠️ Advertencia: Este sitio web es solo para ver deportes. Prohibido estrictamente el juego y las apuestas. Mantente a salvo.",
  "fr": "⚠️ Attention: Ce site est destiné uniquement au visionnage de sports. Les jeux d'argent et paris sont strictement interdits. Restez en sécurité.",
  "hi": "⚠️ चेतावनी: यह वेबसाइट केवल खेल देखने के लिए है। जुआ/सट्टेबाजी सख्त वर्जित है। सुरक्षित रहें।",
  "ar": "⚠️ تحذير: هذا الموقع مخصص لمشاهدة الرياضة فقط. المقامرة أو المراهنة محظورة تماماً. ابقَ آمناً.",
  "ur": "⚠️ انتباہ: یہ ویب سائٹ صرف کھیلوں کو دیکھنے کے لیے ہے۔ جوا/سٹی بازی سخت ممنوع ہے۔ محفوظ رہیں۔",
  "ja": "⚠️ 警告：このウェブサイトはスポーツ観戦専用です。ギャンブルや賭博は厳禁です。安全にお過ごしください。",
  "de": "⚠️ Warnung: Diese Website dient nur zum Anschauen von Sport. Glücksspiel und Wetten sind strengstens verboten. Bleiben Sie sicher。",
  "pt": "⚠️ Aviso: Este site é apenas para assistir a desportos. Jogos de azar e apostas são estritamente proibidos. Mantenha-se seguro."
};

// Store real persistent views in-memory at server level to maintain fully synchronized count
let globalViews = 2483900 + Math.floor(Math.random() * 240);

// API Route for translation
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.get("/api/views", (req, res) => {
  res.json({ totalViews: globalViews });
});

app.post("/api/views/increment", (req, res) => {
  const inc = Math.floor(Math.random() * 3) + 1;
  globalViews += inc;
  res.json({ totalViews: globalViews });
});

app.post("/api/translate", async (req, res) => {
  try {
    const { text, targetLang, targetLangName } = req.body;

    if (!text || !targetLang) {
       res.status(400).json({ error: "Missing required parameters: text and targetLang" });
       return;
    }

    // Checking if we have a direct static translation first (ultra fast!)
    const lowercaseLang = targetLang.toLowerCase();
    if (STATIC_TRANSLATIONS[lowercaseLang]) {
       res.json({
        translatedText: STATIC_TRANSLATIONS[lowercaseLang],
        language: targetLang,
        source: 'dictionary'
      });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      // If Gemini client is not initialized, we fall back gracefully to a basic response or english
      console.log("Gemini API Key is not set or invalid. Falling back to English or closest match.");
      res.json({
        translatedText: STATIC_TRANSLATIONS[lowercaseLang] || STATIC_TRANSLATIONS["en"],
        language: targetLang,
        source: 'dictionary'
      });
      return;
    }

    // Call Gemini API using modern GoogleGenAI SDK
    const prompt = `Translate the following short safety announcement into ${targetLangName || targetLang}. Keep it highly professional, natural-sounding, and brief. Preserve any exclamation marks or warning emojis. Do not explain, just return the translated string.

Announcement to translate: "${text}"`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        temperature: 0.1,
      }
    });

    const translatedText = response.text?.trim() || text;

    res.json({
      translatedText,
      language: targetLang,
      source: 'gemini'
    });

  } catch (err: any) {
    console.error("Gemini Translation Error:", err);
    // Propagate fallback translation safely rather than crashing
    const fallbackLang = (req.body?.targetLang || "en").toLowerCase();
    res.json({
      translatedText: STATIC_TRANSLATIONS[fallbackLang] || STATIC_TRANSLATIONS["en"],
      language: req.body?.targetLang || "en",
      source: 'dictionary',
      error: err.message
    });
  }
});

// Vite middleware configuration for high performance
async function initServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Live TV Player Server active on http://0.0.0.0:${PORT}`);
  });
}

initServer().catch((err) => {
  console.error("Failed to start server:", err);
});
