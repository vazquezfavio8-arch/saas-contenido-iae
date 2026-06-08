const { GoogleGenAI } = require('@google/genai');

module.exports = async function handler(req, res) {
  // Configuración de cabeceras CORS para producción
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  try {
    const { imagenBase64, tipoNegocio } = req.body;
    if (!imagenBase64) return res.status(400).json({ error: 'Falta la imagen en la petición' });

    // Inicializar el SDK moderno con la variable de entorno
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const promptSistema = `Actúa como un Analista de Investigación Senior y Copywriter experto para comercios locales. Analiza la imagen de este producto para una tienda tipo: ${tipoNegocio || 'General'}. Identifica con precisión técnica: producto, materiales, colores y estilo.
    
    Genera estrictamente esta estructura sin saludos ni rellenos:
    ### 📸 ANÁLISIS VISUAL
    * (Detalles del producto)
    ### ✍️ COPIES PARA INSTAGRAM
    * **Opción 1 (Directa):** (Texto pragmático)
    * **Opción 2 (Humana):** (Texto cercano)
    * **Opción 3 (Comercial):** (Llamado a la acción)
    ### 🎬 GUION PARA TIKTOK
    * **Gancho:** (3 segundos)
    * **Desarrollo:** (Explicación lógica)
    * **Cierre:** (Llamado a la acción)`;

    // Llamada multimodal al modelo estable Gemini 2.5 Flash
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        promptSistema,
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: imagenBase64
          }
        }
      ]
    });

    return res.status(200).json({ resultado: response.text });
  } catch (error) {
    console.error('Error detallado del backend:', error);
    return res.status(500).json({ error: `Error en Gemini: ${error.message || error}` });
  }
};
