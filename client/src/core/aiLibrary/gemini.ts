import { createPartFromUri, createUserContent, GoogleGenAI, HarmBlockThreshold, HarmCategory } from "@google/genai";
import { ErrorLike } from "../types/type";

const geminiPublicKey = import.meta.env.VITE_GEMINI_PUBLIC_KEY;

const ai = new GoogleGenAI({apiKey: geminiPublicKey});

const safetySettings = [
    {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
    },
];

// Gemini model only takes blob URI as valid input, not an URL
const fetchImageAsBlob = async (url: string) => {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error (`Fail to fetch img from ${url}`)
    }

    return response.blob()
}

// handle retry when model is unstable (overload error)
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2s

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const isRetryableError = (error: unknown): boolean => {
    if (typeof error !== "object" || error === null) return false;
  
    const err = error as ErrorLike;
  
    return (
        err.status === 503 ||
        err.status === 500 ||
        (typeof err.message === "string" &&
            (err.message.includes("overloaded") || err.message.includes("Internal error")))
        );
  };

export const generateContent = async (
    prompts: string | [string, string],
    handleStreamingUpdate: (newChunk: string) => void
) => {
    let retries = 0;
    const MIN_RESPONSE_LENGTH = 10; //at least 10 characters
    
    while (retries < MAX_RETRIES) {
        try {
            //from docs, prompt contents (if including both text and img) is an array
            console.log(`Attempt ${retries + 1} of ${MAX_RETRIES}`);
            let contents = [];
            let fullResponse = "";

            if (Array.isArray(prompts)) {
                const [textPrompts, imageUrl] = prompts;

                console.log("fetching image blob...");
                const imageBlob = await fetchImageAsBlob(imageUrl);
                
                console.log("uploading image to Gemini...");
                const uploadedImage = await ai.files.upload({
                    file: imageBlob
                });

                if (!uploadedImage.uri || !uploadedImage.mimeType) {
                    throw new Error("Uploaded image fails to recognize URI or mime type.")
                }

                contents = [
                    createUserContent([
                        textPrompts,
                        createPartFromUri(uploadedImage.uri, uploadedImage.mimeType)
                    ])
                ] // multimodal prompt content with text and photo
            } else {
                contents = [createUserContent([prompts])]
            }

            console.log("generating content stream...");
            const response = await ai.models.generateContentStream({
                model: "gemini-2.0-flash",
                contents: contents,
                config: {
                    safetySettings: safetySettings
                }
            });

            // handle chunk, AI model responds in small piece of text (chunk)
            // call handleStreamingUpdate to update generatedAnswers in UI
            for await (const chunk of response) {
                if (chunk.text) {
                    handleStreamingUpdate(chunk?.text)
                    fullResponse += chunk?.text
                }
            }

            if (!fullResponse || fullResponse.length < MIN_RESPONSE_LENGTH) {
                throw new Error(`Response too short or empty: "${fullResponse}"`);
            }

            console.log("Successfully generated content");
            return fullResponse;
        } catch (error: any) {
            console.error("Error details:", {
                message: error.message,
                status: error.status,
                retryCount: retries + 1,
                maxRetries: MAX_RETRIES
            });
            
            retries++; // Move retries increment here, before checking if we should retry
            
            if (isRetryableError(error) && retries < MAX_RETRIES) {
                console.log(`Retry attempt ${retries} of ${MAX_RETRIES}, waiting ${RETRY_DELAY/1000} seconds...`);
                await sleep(RETRY_DELAY);
                continue;
            }
            
            // if retry time exceeds MAX_RETRY or it's a different error, throw it
            console.error("Error generating content:", error);
            throw new Error(`Failed to generate content after ${retries} attempts: ${error.message}`);
        }
    }
    
    throw new Error("Max retries exceeded");
}

// Let AI model remember chat history and response correspondingly
let chat: any;

export const initializeChat = (history: any[] = []) => {
    chat = ai.chats.create({
        model: "gemini-2.0-flash",
        history: history.map(msg => ({
            role: msg.role,
            parts: [{ text: msg.parts[0].text }]
        }))
    });
};

export const sendMessageToChat = async (
    message: string,
    handleStreamingUpdate: (newChunk: string) => void
) => {
    if (!chat) {
        console.log("No chat is initialized");
        return;
    }

    let retries = 0;
    while (retries < MAX_RETRIES) {
        try {
            let fullResponse = "";
            const response = await chat.sendMessageStream({message: message});

            for await (const chunk of response) {
                if (chunk.text) {
                    handleStreamingUpdate(chunk.text);
                    fullResponse += chunk.text;
                }
            }

            return fullResponse;
        } catch (error: any) {
            retries++;
            
            if (isRetryableError(error)) {
                if (retries < MAX_RETRIES) {
                    console.log(`Retry attempt ${retries} failed, retrying in ${RETRY_DELAY/1000} seconds...`);
                    await sleep(RETRY_DELAY);
                    continue;
                }
            }
            
            console.error("Error sending message to chat:", error);
            throw new Error(`Failed to send message after ${retries} attempts: ${error.message}`);
        }
    }
    
    throw new Error("Max retries exceeded");
};

// error handling flow:
// - If error happens, check if it's retryable
// - If it's retryable, retry up to MAX_RETRIES times
// - If it's not retryable, throw the error
// - If all retries fail, throw an error
