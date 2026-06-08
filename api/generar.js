// api/generar.js
import { GoogleGenAI } from '@google/genai';

// El servidor lee de forma segura tu clave guardada en Vercel
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default async function handler(req, res) {
  // Solo permitimos peticiones de envío de datos (POST)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { imagenBase64, tipoNegocio } = req.body;

    if (!imagenBase64) {
      return res.status(400).json({ error: 'Falta la imagen del producto' });
    }

    // Instrucciones estrictas para la IA: Tono directo, sincero y pragmático
    const promptSistema = `
      Actúa como un Analista de Investigación Senior y Copywriter experto para comercios locales.
      Analiza minuciosamente la imagen adjunta de este producto de la tienda tipo: ${tipoNegocio || 'General'}.
      
      Debes identificar con precisión técnica: tipo de producto, materiales o telas, colores dominantes y el estilo visual real.
      
      Genera exactamente la siguiente estructura de respuesta de forma limpia, sin añadir introducciones falsas, ni saludos ni rellenos:
      
      ### 📸 ANÁLISIS VISUAL DEL PRODUCTO
      * (Detalla de forma cruda, realista y natural lo que ves en la imagen)
      
      ### ✍️ COPIES PARA INSTAGRAM (3 OPCIONES)
      * **Opción 1 (Directa y Pragmática):** (Redacta un texto sincero enfocado en el beneficio real para el cliente, sin usar frases trilladas como "¡Atención comunidad!" ni exceso de emojis).
      * **Opción 2 (Estilo Humano/Casero):** (Un enfoque sencillo que conecte con el día a día de las personas).
      * **Opción 3 (Promocional Limpio):** (Enfoque comercial con un llamado a la acción claro para escribir al DM o comprar).
      
      ### 🎬 GUION EXPRESO PARA TIKTOK / REELS
      * **Gancho (Primeros 3 segundos):** (Frase directa e impactante sin rodeos).
      * **Desarrollo:** (Muestra del producto en video + explicación lógica de por qué lo necesitan).
      * **Llamado a la Acción:** (Invitar a interactuar o comprar).
    `;

    // Conexión directa con el modelo multimodal gemini-2.5-flash
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

    // Retorna el resultado final estructurado hacia tu interfaz web
    return res.status(200).json({ resultado: response.text });

  } catch (error) {
    console.error("Error en el servidor:", error);
    return res.status(500).json({ error: 'Error interno al procesar la imagen con Gemini' });
  }
}
