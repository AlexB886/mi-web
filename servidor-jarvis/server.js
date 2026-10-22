
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: [
    "http://localhost:5500",
    "http://127.0.0.1:5500"
  ]
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.send("JARVIS está activo.");
});

app.get("/api/status", (req, res) => {
  res.json({
    assistant: "JARVIS",
    status: "online"
  });
});

app.get("/api/token", async (req, res) => {
  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({
      error: "Falta configurar la clave API en .env"
    });
  }

  try {
    const response = await fetch(
      "https://api.openai.com/v1/realtime/client_secrets",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          expires_after: {
            anchor: "created_at",
            seconds: 600
          },
          session: {
            type: "realtime",
            model: "gpt-realtime-2.1",
            instructions:
  "Eres JARVIS, el asistente personal de Alex. " +
  "Habla siempre en español de España, con una voz natural, " +
  "fluida, segura y cercana. Pronuncia con claridad y utiliza " +
  "un ritmo conversacional ágil, sin sonar robótico. " +
  "Responde normalmente en 2 a 5 frases: ofrece información " +
  "suficiente para resolver la pregunta, pero evita explicaciones " +
  "largas, repeticiones y relleno. Si el tema es sencillo, " +
  "responde en pocas frases; si es complejo, explica lo esencial " +
  "con claridad y añade detalles solo cuando sean útiles. " +
  "Sé directo, inteligente y natural, como un asistente personal " +
  "de alta tecnología. No enumeres puntos si no hace falta. " +
  "Haz preguntas de seguimiento solo cuando sean necesarias.",
            audio: {
              output: {
                voice: "cedar"
              }
            }
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(
        "Error de OpenAI:",
        data.error?.message || response.status
      );

      return res.status(response.status).json({
        error: "OpenAI no pudo crear la sesión de voz. Revisa la API."
      });
    }

    res.json({
      value: data.value,
      expires_at: data.expires_at
    });
  } catch (error) {
    console.error("Error al conectar con OpenAI:", error.message);

    res.status(500).json({
      error: "No se pudo conectar con el servicio de voz."
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`JARVIS está funcionando en http://localhost:${PORT}`);
});
