const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { imagenBase64, tipoNegocio, instrucciones, modo } = req.body;
    
    // Inicialización directa
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY.trim());
    
    // MODELO CAMBIADO: Usamos gemini-pro-vision que es el estándar para imágenes
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

    let prompt = modo === 'prompts_visuales' 
      ? "Actúa como Director de Arte. Analiza la imagen y genera 5 prompts detallados en inglés para IA (Midjourney/DALL-E) estilo 'raw photography', sin efectos neón."
      : `Eres experto en marketing para ${tipoNegocio}. Analiza la imagen y genera: Análisis visual, 3 Copys para Instagram y un guion para TikTok.`;

    if (instrucciones) prompt += `\n\nInstrucciones adicionales: ${instrucciones}`;

    // Estructura de contenido específica para gemini-pro-vision
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: imagenBase64
        }
      }
    ]);

    const response = await result.response;
    res.status(200).json({ resultado: response.text() });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
};
