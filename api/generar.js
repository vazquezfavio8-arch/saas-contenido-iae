const { GoogleGenAI } = require('@google/genai');

module.exports = async function handler(req, res) {
  // Configuración de cabeceras CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  try {
    const { imagenBase64, tipoNegocio, instrucciones, modo } = req.body;
    if (!imagenBase64) return res.status(400).json({ error: 'Falta la imagen en la petición' });

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    let promptSistema = "";

    // Switch lógico según el botón que toque el usuario en la interfaz
    if (modo === 'prompts_visuales') {
      promptSistema = `Actúa como un Director de Arte y Diseñador de Prompts Senior. Analiza detalladamente la prenda o artículo de la imagen (tipo de producto, corte, costuras, texturas, tela, color exacto).
      
      Genera exactamente 5 prompts de ingeniería visual muy descriptivos y estructurados en INGLÉS (para máxima compatibilidad con Midjourney, Stable Diffusion o DALL-E 3). El objetivo es colocar esa misma prenda en una modelo sin que se pierdan sus características originales.
      
      Sigue estrictamente estas reglas estéticas para los prompts:
      - Estilo de fotografía de moda realista, cruda ("raw style") y natural.
      - Prohibido el uso de efectos neón, estéticas futuristas exageradas o acabados sintéticos.
      - Iluminación suave natural, lociones urbanas, de estudio minimalista o exteriores reales.
      - Especifica cámaras y lentes profesionales (ej: Sony A7R V, 85mm lens, f/1.4, sharp focus).

      Estructura tu respuesta en español así:
      ### 🖼️ PROMPTS VISUALES PARA MODELOS
      * **Prompt 1 (Estudio Comercial):** [Prompt en inglés aquí...]
      * **Prompt 2 (Urbano / Streetwear):** [Prompt en inglés aquí...]
      * **Prompt 3 (Detalle / Close-up de textura):** [Prompt en inglés aquí...]
      * **Prompt 4 (Editorial de Moda):** [Prompt en inglés aquí...]
      * **Prompt 5 (Estilo de catálogo natural):** [Prompt en inglés aquí...]`;
    } else {
      // Modo por defecto: Copys comerciales para redes
      promptSistema = `Actúa como un Analista de Investigación Senior y Copywriter experto para comercios locales. Analiza la imagen de este producto para una tienda tipo: ${tipoNegocio || 'General'}. Identifica con precisión técnica: producto, materiales, colores y estilo.
      
      Genera estrictamente esta estructura sin saludos ni rellenos:
      ### 📸 ANÁLISIS VISUAL
      * (Detalles técnicos y físicos del producto)
      ### ✍️ COPIES PARA INSTAGRAM
      * **Opción 1 (Directa):** (Texto pragmático)
      * **Opción 2 (Humana):** (Texto cercano)
      * **Opción 3 (Comercial):** (Llamado a la acción directo)
      ### 🎬 GUION PARA TIKTOK
      * **Gancho:** (3 segundos iniciales)
      * **Desarrollo:** (Explicación lógica y atributos del producto)
      * **Cierre:** (Llamado a la acción claro)`;
    }

    // Si el usuario escribió instrucciones adicionales, se las inyectamos con prioridad al final
    if (instrucciones && instrucciones.trim() !== "") {
      promptSistema += `\n\n[CRÍTICO] Aplica estrictamente estas instrucciones adicionales solicitadas por el usuario para personalizar el resultado: "${instrucciones}"`;
    }

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
    console.error('Error en backend:', error);
    return res.status(500).json({ error: `Error en Gemini: ${error.message || error}` });
  }
};
