const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { imagenBase64, tipoNegocio, instrucciones, modo } = req.body;
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let prompt = "";
    if (modo === 'prompts_visuales') {
      prompt = `Actúa como director de arte. Analiza la imagen y genera 5 prompts detallados en inglés para IA visual (tipo Midjourney) para que una modelo luzca el producto sin perder sus características. Reglas: estilo fotografía cruda ("raw"), iluminación natural, sin efectos artificiales.`;
    } else {
      prompt = `Eres experto en marketing para ${tipoNegocio}. Analiza la imagen y genera: Análisis visual, 3 Copys para Instagram y un guion para TikTok.`;
    }

    if (instrucciones) prompt += `\n\nInstrucciones extra del usuario: ${instrucciones}`;

    const result = await model.generateContent([
      prompt,
      { inlineData: { mimeType: "image/jpeg", data: imagenBase64 } }
    ]);

    res.status(200).json({ resultado: result.response.text() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
