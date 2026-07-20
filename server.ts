import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
} else {
  console.warn("⚠️ GEMINI_API_KEY environment variable is not defined.");
}

// AI Bridal Stylist Consultation Endpoint
app.post("/api/stylist", async (req, res) => {
  const { messages } = req.body;

  if (!ai) {
    return res.status(503).json({
      error: "O serviço de Inteligência Artificial não está configurado. Por favor, configure a chave API.",
    });
  }

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "O histórico de mensagens é obrigatório." });
  }

  try {
    // Format messages for @google/genai SDK
    // SDK expects: contents: [{ role: 'user' | 'model', parts: [{ text: '...' }] }]
    const formattedContents = messages.map((msg: any) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction: `Você é Helena, a Consultora de Noivas e Estilista Oficial de IA da Enlace Noivas, uma tradicional e luxuosa boutique de casamentos brasileira. 
Seu papel é ajudar as noivas (e noivos, madrinhas, debutantes) a encontrarem o visual dos seus sonhos com extrema elegância, empatia e conhecimento técnico de alta-costura.

Diretrizes de Comportamento:
1. Idioma: Fale sempre em português do Brasil, de forma calorosa, acolhedora, sofisticada e profissional.
2. Conhecimento: Você entende profundamente de:
   - Silhuetas de vestidos (Sereia, Princesa, Evasê, Reto, Boho, Imperial).
   - Tecidos de alta-costura (Renda Renascença, Renda Francesa, Zibelina, Crepe Silk, Organza de Seda, Tule Point d'Esprit).
   - Decotes (Coração, Canoa, Ombro a Ombro, Frente Única, V Profundo).
   - Tipos de cerimônia (Pé na areia, Casamento no Campo, Catedral Clássica, Mini Wedding Urbano).
3. Tom: Use palavras como "querida noiva", "um sonho de vestido", "sua personalidade brilhando", "alta-costura", "momento inesquecível".
4. Soluções: Sempre que apropriado, incentive a noiva a agendar um atendimento presencial (Prova dos Sonhos) na Enlace Noivas para experimentar os modelos pessoalmente e ter os ajustes sob medida feitos por nossa equipe de costureiras especializadas.
5. Seja concisa mas poética. Ofereça de 2 a 3 sugestões de estilo específicas baseadas no que a noiva descrever (local, época do ano, preferências de corpo, estilo pessoal).`,
        temperature: 0.7,
      },
    });

    const replyText = response.text || "Desculpe, não consegui processar suas preferências neste momento. Que tal tentarmos novamente?";

    return res.json({ content: replyText });
  } catch (error: any) {
    console.error("Error in AI Stylist route:", error);
    return res.status(500).json({
      error: "Ocorreu um erro ao processar sua consulta com a estilista. Detalhes: " + (error.message || error),
    });
  }
});

// Mock Booking/Agendamento Endpoint
app.post("/api/bookings", (req, res) => {
  const { name, email, phone, date, time, category, notes } = req.body;
  if (!name || !email || !phone || !date || !time) {
    return res.status(400).json({ error: "Por favor, preencha todos os campos obrigatórios para o agendamento." });
  }
  
  // Return a simulation response
  return res.json({
    success: true,
    message: "Agendamento pré-confirmado com sucesso!",
    booking: {
      id: "ENL-" + Math.floor(1000 + Math.random() * 9000),
      name,
      email,
      phone,
      date,
      time,
      category,
      notes,
      consultant: ["Helena Prado", "Gabriela Vasconcelos", "Renata Martins"][Math.floor(Math.random() * 3)],
    },
  });
});

// Vite Integration Middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`✨ Enlace Noivas backend running on port ${PORT}`);
  });
}

startServer();
