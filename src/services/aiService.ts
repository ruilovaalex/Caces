import { GoogleGenAI } from "@google/genai";
import { Indicator, Requirement } from "../types";

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
  getRequirementGuide: async (indicator: Indicator, requirement: Requirement): Promise<string> => {
    const client = getAIClient();
    
    const prompt = `Actúa como un MENTOR y GUÍA experto en acreditación universitaria CACES (Ecuador). 
      Tu objetivo es explicar cómo construir la evidencia específica "${requirement.label}" para el indicador "${indicator.code}: ${indicator.name}".
      
      DATOS DEL CONTEXTO:
      - Institución: Instituto Tecnológico Superior EduSudamericano
      - Indicador: ${indicator.code} - ${indicator.description}
      - Evidencia requerida: ${requirement.label}
      - Descripción de la evidencia: ${requirement.description}
      - Formato esperado: ${requirement.format}
      ${requirement.observation ? `- Observación actual del evaluador: ${requirement.observation}` : ""}
      
      ESTRUCTURA DE TU RESPUESTA (Usa Markdown profesional):
      1. **Qué debe contener esta evidencia**: Detalles técnicos y legales.
      2. **Organización del documento**: Cómo estructurar el archivo antes de subirlo.
      3. **Errores a evitar**: Fallos comunes que provocan observaciones del CACES.
      4. **Documentos complementarios**: Qué otros archivos podrían fortalecer esta evidencia.
      5. **Nombre de archivo recomendado**: Sigue el estándar SIG-EV-${indicator.code}-...
      6. **Recomendación final**: Consejo clave para asegurar la validación.`;

    const response = await client.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text || "No se pudo generar la guía.";
  },

  getGuideline: async (indicator: Indicator, template: any): Promise<string> => {
    const client = getAIClient();
    const prompt = `Como experto en acreditación CACES, genera una guía/plantilla para el documento "${template.label}" del indicador "${indicator.code}: ${indicator.name}".
    Explica qué secciones debe tener, qué datos son críticos y cómo redactarlo para cumplir con los estándares de evaluación 2025.`;

    const response = await client.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text || "Error al generar guía.";
  },

  generateCoordinatorEvidenceGuide: async (data: {
    indicatorCode: string;
    indicatorName: string;
    indicatorDescription: string;
    evidenceName: string;
    evidenceDescription: string;
    format: string;
    templateName?: string;
    sectionName?: string;
    content?: string;
    observations?: string;
  }): Promise<string> => {
    const client = getAIClient();
    
    const context = `
      INDICADOR: ${data.indicatorCode} - ${data.indicatorName}
      DESCRIPCIÓN INDICADOR: ${data.indicatorDescription}
      EVIDENCIA: ${data.evidenceName}
      DESCRIPCIÓN EVIDENCIA: ${data.evidenceDescription}
      FORMATO: ${data.format}
      ${data.templateName ? `PLANTILLA SELECCIONADA: ${data.templateName}` : ""}
      ${data.sectionName ? `SECCIÓN ACTUAL: ${data.sectionName}` : ""}
      ${data.content ? `CONTENIDO ACTUAL DEL COORDINADOR: ${data.content}` : ""}
      ${data.observations ? `OBSERVACIONES PREVIAS: ${data.observations}` : ""}
    `;

    const prompt = `Actúa como un ASESOR TÉCNICO EXPERTO para Coordinadores de Aseguramiento de la Calidad.
      Tu misión es guiar al coordinador paso a paso para completar la evidencia mencionada arriba.
      
      Responde de forma práctica, directa y profesional. No uses texto genérico.
      
      ESTRUCTURA DE TU GUÍA:
      1. **Qué completar**: Instrucción específica sobre qué información debe ir en esta evidencia o sección.
      2. **Puntos de revisión**: Qué verificar antes de darla por terminada.
      3. **Errores críticos**: Fallos técnicos o de contenido que invalidarían la evidencia ante el CACES.
      4. **Anexos recomendados**: Qué documentos de respaldo (fotos, actas, listados) fortalecen esta evidencia.
      5. **Mejora de texto**: ${data.content ? "Analiza el contenido actual y sugiere una redacción más técnica u oficial." : "Sugerencia de redacción inicial."}
      6. **Recomendación de oro**: Un consejo experto final.
      
      DATOS TÉCNICOS:
      ${context}`;

    const response = await client.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text || "No se pudo generar la guía técnica.";
  }
};
