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

    const prompt = `Actua como un MENTOR y GUIA experto en acreditacion universitaria CACES (Ecuador).
      Tu objetivo es explicar como construir la evidencia especifica "${requirement.label}" para el indicador "${indicator.code}: ${indicator.name}".

      DATOS DEL CONTEXTO:
      - Institucion: Instituto Tecnologico Superior EduSudamericano
      - Indicador: ${indicator.code} - ${indicator.description}
      - Evidencia requerida: ${requirement.label}
      - Descripcion de la evidencia: ${requirement.description}
      - Formato esperado: ${requirement.format}
      ${requirement.observation ? `- Observacion actual del evaluador: ${requirement.observation}` : ""}

      ESTRUCTURA DE TU RESPUESTA (Usa Markdown profesional):
      1. **Que debe contener esta evidencia**: Detalles tecnicos y legales.
      2. **Organizacion del documento**: Como estructurar el archivo antes de subirlo.
      3. **Errores a evitar**: Fallos comunes que provocan observaciones del CACES.
      4. **Documentos complementarios**: Que otros archivos podrian fortalecer esta evidencia.
      5. **Nombre de archivo recomendado**: Sigue el estandar SIG-EV-${indicator.code}-...
      6. **Recomendacion final**: Consejo clave para asegurar la validacion.`;

    const response = await client.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text || "No se pudo generar la guia.";
  },

  getGuideline: async (indicator: Indicator, template: any): Promise<string> => {
    const client = getAIClient();
    const prompt = `Como experto en acreditacion CACES, genera una guia/plantilla para el documento "${template.label}" del indicador "${indicator.code}: ${indicator.name}".
    Explica que secciones debe tener, que datos son criticos y como redactarlo para cumplir con los estandares de evaluacion 2025.`;

    const response = await client.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text || "Error al generar guia.";
  },

  generateCoordinatorEvidenceGuide: async (data: {
    action?: string;
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
    const actionGuide = {
      guia_general: 'Explica el panorama completo de la evidencia y como abordarla desde cero.',
      revisar_borrador: 'Evalua el borrador actual, detecta vacios y sugiere correcciones concretas.',
      mejorar_redaccion: 'Redacta en tono tecnico, formal y mas convincente sin perder claridad.',
      sugerir_nombre: 'Propon nombres de archivo y encabezados institucionales adecuados.',
      help_section: 'Concentrate en la seccion activa y genera contenido accionable para completarla.'
    } as const;

    const context = `
      ACCION SOLICITADA: ${data.action || 'guia_general'}
      INDICADOR: ${data.indicatorCode} - ${data.indicatorName}
      DESCRIPCION INDICADOR: ${data.indicatorDescription}
      EVIDENCIA: ${data.evidenceName}
      DESCRIPCION EVIDENCIA: ${data.evidenceDescription}
      FORMATO: ${data.format}
      ${data.templateName ? `PLANTILLA SELECCIONADA: ${data.templateName}` : ""}
      ${data.sectionName ? `SECCION ACTUAL: ${data.sectionName}` : ""}
      ${data.content ? `CONTENIDO ACTUAL DEL COORDINADOR: ${data.content}` : ""}
      ${data.observations ? `OBSERVACIONES PREVIAS: ${data.observations}` : ""}
    `;

    const prompt = `Actua como un ASESOR TECNICO EXPERTO para Coordinadores de Aseguramiento de la Calidad.
      Tu mision es guiar al coordinador paso a paso para completar la evidencia mencionada arriba.

      Responde de forma practica, directa y profesional. No uses texto generico.
      OBJETIVO DE ESTA RESPUESTA: ${actionGuide[data.action as keyof typeof actionGuide] || actionGuide.guia_general}

      ESTRUCTURA DE TU GUIA:
      1. **Que completar**: Instruccion especifica sobre que informacion debe ir en esta evidencia o seccion.
      2. **Puntos de revision**: Que verificar antes de darla por terminada.
      3. **Errores criticos**: Fallos tecnicos o de contenido que invalidarian la evidencia ante el CACES.
      4. **Anexos recomendados**: Que documentos de respaldo (fotos, actas, listados) fortalecen esta evidencia.
      5. **Mejora de texto**: ${data.content ? "Analiza el contenido actual y sugiere una redaccion mas tecnica u oficial." : "Sugerencia de redaccion inicial."}
      6. **Recomendacion de oro**: Un consejo experto final.

      DATOS TECNICOS:
      ${context}`;

    const response = await client.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text || "No se pudo generar la guia tecnica.";
  }
};
