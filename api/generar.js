const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  try {
    const { imagenBase64, tipoNegocio, instrucciones, modo } = req.body;
    if (!imagenBase64) return res.status(400).json({ error: 'Falta la imagen' });

    // Inicializamos con el SDK estándar
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // USAMOS EL MODELO ESTABLE 1.5-FLASH
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let promptSistema = modo === 'prompts_visuales' 
      ? "Eres un director de arte. Analiza la prenda y genera 5 prompts detallados en inglés para IA visual (Midjourney/DALL-E) enfocados en moda realista y natural. Evita efectos artificiales."
      : `Eres un experto en marketing para ${tipoNegocio}. Analiza la imagen y genera: Análisis visual, 3 Copys para Instagram y un guion para TikTok.`;

    if (instrucciones) promptSistema += `\n\nInstrucciones extra del usuario: ${instrucciones}`;

    const result = await model.generateContent([
      promptSistema,
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: imagenBase64
        }
      }
    ]);

    const response = await result.response;
    return res.status(200).json({ resultado: response.text() });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
};
