import { GoogleGenAI } from "@google/genai";
import { Indicator, Template } from "../types";

// Inicialización perezosa (Lazy) del cliente
let aiClient: GoogleGenAI | null = null;

const getAIClient = () => {
    if (!aiClient) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("GEMINI_API_KEY no configurada");
        aiClient = new GoogleGenAI({ apiKey });
    }
    return aiClient;
};

export const AIService = {
  getGuideline: async (indicator: Indicator, template: Template): Promise<string> => {
    const client = getAIClient();
    
    const prompt = `Actúa como un MENTOR y GUÍA experto en acreditación universitaria CACES (Ecuador). 
      Tu objetivo NO es redactar el documento final, sino EXPLICAR paso a paso cómo construir la evidencia perfecta para el indicador "${indicator.code}: ${indicator.name}".
      
      DATOS DEL CONTEXTO:
      - Institución: Instituto Tecnológico Superior EduSudamericano
      - Período: 2025
      - Indicador: ${indicator.code}
      - Descripción CACES: ${indicator.description}
      - Tipo de Documento: ${template.label}
      
      ESTRUCTURA DE TU GUÍA (Usa Markdown formal):
      1. **¿Qué evalúa exactamente el CACES aquí?**: Explica el espíritu del indicador.
      2. **Contenido Imprescindible**: Puntos clave que debe tener este ${template.label}.
      3. **Paso a Paso**: Guía de 3 a 5 pasos.
      4. **Errores Comunes**: Qué suele observar el CACES negativamente.
      5. **Ejemplo de Estructura**: Esquema del documento con placeholders.`;

    const response = await client.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text || "No se pudo generar la guía.";
  }
};
