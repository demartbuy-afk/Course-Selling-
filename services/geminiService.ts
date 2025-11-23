
import { GoogleGenAI } from "@google/genai";
import { Course } from "../types";

// Initialize Gemini Client
// The API key is expected to be in process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const generateSystemInstruction = (courses: Course[]) => `
You are "Omni", the dedicated academic advisor and admissions specialist for OmniLearn Academy.
Your goal is to help prospective students find the perfect course from OUR specific catalog to advance their careers.

Here is our current course catalog (Live Database):
${JSON.stringify(courses.map(c => ({ id: c.id, title: c.title, category: c.category, level: c.level, tags: c.tags, price: c.price })))}

Note: All prices are in INR (Indian Rupees).

Rules:
1. You represent OmniLearn Academy exclusively. Do not recommend outside resources.
2. Be professional, enthusiastic, and persuasive but honest.
3. Highlights the benefits of our academy: "Expert-Led", "Project-Based", and "Lifetime Access".
4. If a user asks about a topic we don't cover, politely suggest the closest alternative we offer or mention we are adding new courses soon.
5. Keep responses concise (under 150 words) and formatted for easy reading.
`;

export const getCourseRecommendation = async (
  userMessage: string, 
  chatHistory: { role: 'user' | 'model', parts: [{ text: string }] }[],
  currentCourses: Course[]
) => {
  try {
    // We use a chat session to maintain context
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: generateSystemInstruction(currentCourses),
        temperature: 0.7,
      },
      history: chatHistory
    });

    const response = await chat.sendMessage({ message: userMessage });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm currently having trouble connecting to the course database. Please try again in a moment.";
  }
};

// --- NEW FUNCTION: Course Specific Tutor ---

export const getCourseTutorResponse = async (
  userMessage: string,
  chatHistory: { role: 'user' | 'model', parts: [{ text: string }] }[],
  course: Course
) => {
  try {
    const instructorProvidedContext = course.aiContext || "No specific knowledge base provided by the instructor. Answer based on general knowledge about the course title and description.";

    const systemInstruction = `
    You are the dedicated AI Tutor for the course: "${course.title}".
    
    INSTRUCTOR KNOWLEDGE BASE:
    "${instructorProvidedContext}"

    COURSE DESCRIPTION:
    "${course.description}"

    RULES:
    1. Your primary source of truth is the INSTRUCTOR KNOWLEDGE BASE above.
    2. Answer the student's question accurately using that context.
    3. If the answer is not in the context, you may use general knowledge related to the course topic, but mention that it is a general answer.
    4. Be helpful, encouraging, and polite.
    5. DETECT THE LANGUAGE of the user. If they ask in Hindi, reply in Hindi. If English, reply in English.
    `;

    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.5, // Lower temperature for more accurate answers based on context
      },
      history: chatHistory
    });

    const response = await chat.sendMessage({ message: userMessage });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error (Tutor):", error);
    return "I am having trouble connecting to the course materials right now. Please try again.";
  }
};
