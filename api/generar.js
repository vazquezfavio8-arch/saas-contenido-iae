import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { imagenBase64, tipoNegocio } = req.body;

    if (!imagenBase64) {
      return res.status(400).json({ error: 'Falta la imagen del producto' });
    }

    const promptSistema = `
      Actúa como un Analista de Investigación Senior y Copywriter experto para comercios locales.
      Analiza la imagen adjunta de este producto de la tienda tipo: ${tipoNegocio || 'General'}.
      Identifica con precisión técnica: tipo de producto, materiales, colores y estilo visual.
      
      Genera exactamente esta estructura sin saludos ni rellenos:
      
      ### 📸 ANÁLISIS VISUAL DEL PRODUCTO
      * (Detalla lo que ves de forma cruda y natural)
      
      ### ✍️ COPIES PARA INSTAGRAM (3 OPCIONES)
      * **Opción 1 (Directa y Pragmática):** (Beneficio real sin exceso de emojis)
      * **Opción 2 (Estilo Humano/Casero):** (Enfoque sencillo y cercano)
      * **Opción 3 (Promocional Limpio):** (Llamado a la acción claro al DM)
      
      ### 🎬 GUION EXPRESO PARA TIKTOK / REELS
      * **Gancho:** (Primeros 3 segundos directos)
      * **Desarrollo:** (Explicación lógica de por qué lo necesitan)
      * **Llamado a la Acción:** (Invitar a comprar)
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        promptSistema,
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: imagenBase64
          }
        }
      ],
    });

    return res.status(200).json({ resultado: response.text });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error interno en el servidor' });
  }
}
