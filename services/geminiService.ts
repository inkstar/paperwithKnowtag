
import { GoogleGenAI } from "@google/genai";
import { UploadedFile, QuestionItem } from "../types";
import { SYSTEM_INSTRUCTION, QUESTION_SCHEMA } from "../constants";

const processImage = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 1200; 
        let width = img.width;
        let height = img.height;
        if (width > MAX_SIZE || height > MAX_SIZE) {
          if (width > height) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          } else {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve((e.target?.result as string).split(',')[1]);
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        resolve(dataUrl.split(',')[1]);
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

const fileToPart = async (file: File) => {
  let base64String: string;
  let mimeType = file.type;
  if (file.type.startsWith('image/')) {
    base64String = await processImage(file);
    mimeType = 'image/jpeg';
  } else {
    base64String = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
      reader.readAsDataURL(file);
    });
  }
  return { inlineData: { data: base64String, mimeType } };
};

export async function analyzeExam(files: UploadedFile[]): Promise<QuestionItem[]> {
  if (!process.env.API_KEY) throw new Error("API Key is missing.");

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const modelId = 'gemini-3-flash-preview'; 

  const fileParts = await Promise.all(files.map(f => fileToPart(f.file)));
  const todayStr = new Date().toISOString().split('T')[0];

  const response = await ai.models.generateContent({
    model: modelId,
    contents: [
      {
        role: 'user',
        parts: [
          ...fileParts,
          { text: "Identify all questions in these documents. For each question, extract its number, content in LaTeX, knowledge point, and question type. For 填空题, ensure blanks are marked as $\\fillin$." }
        ]
      }
    ],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: QUESTION_SCHEMA,
      temperature: 0.1,
    }
  });

  const rawJson = JSON.parse(response.text || "{}");
  const questions: any[] = rawJson.questions || [];

  return questions.map((q, idx) => {
    let cleanContent = q.content || "";
    if (typeof cleanContent === 'string') {
      cleanContent = cleanContent.replace(/\\n/g, '\\\\');
      if (q.type === '填空题') {
        cleanContent = cleanContent.replace(/_{3,}/g, '$\\fillin$');
        cleanContent = cleanContent.replace(/（\s*）/g, '$\\fillin$');
        cleanContent = cleanContent.replace(/(?<!\$)\\fillin(?!\$)/g, '$\\fillin$');
      }
    }

    return {
      id: `q-${idx}-${Date.now()}`,
      number: q.number || `${idx + 1}`,
      content: cleanContent,
      knowledgePoint: q.knowledgePoint || "未分类",
      source: todayStr,
      type: q.type || "其他"
    };
  });
}

/**
 * Parses existing LaTeX code back into structured question objects.
 * This allows users to import previously generated code and continue adding to it.
 */
export async function parseLatexToQuestions(latexCode: string): Promise<QuestionItem[]> {
  if (!process.env.API_KEY) throw new Error("API Key is missing.");
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const todayStr = new Date().toISOString().split('T')[0];

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Please parse the following LaTeX code and extract the mathematical questions into JSON format. 
    Pay special attention to the question number, knowledge point, source (usually inside parentheses near the start of the item), 
    the question content itself, and the type (选择题, 填空题, or 解答题).
    
    LaTeX Code:
    ${latexCode}`,
    config: {
      systemInstruction: "You are a LaTeX parser. Convert LaTeX question items into a structured list based on the provided schema. If knowledge points or sources are in parentheses like (Point, Source), extract them correctly.",
      responseMimeType: "application/json",
      responseSchema: QUESTION_SCHEMA,
    }
  });

  const rawJson = JSON.parse(response.text || "{}");
  const questions: any[] = rawJson.questions || [];

  return questions.map((q, idx) => ({
    id: `imported-${idx}-${Date.now()}`,
    number: q.number || `${idx + 1}`,
    content: q.content || "",
    knowledgePoint: q.knowledgePoint || "未分类",
    source: q.source || todayStr,
    type: q.type || "其他"
  }));
}
