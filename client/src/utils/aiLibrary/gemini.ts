import { createPartFromUri, createUserContent, GoogleGenAI, HarmBlockThreshold, HarmCategory } from "@google/genai";

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

export const generateContent = async (
    prompts: string | [string, string],
    handleStreamingUpdate: (newChunk: string) => void
) => {
    //from docs, prompt contents (if including both text and img) is an array
    let contents = [];
    let fullResponse = "";
    
    if (Array.isArray(prompts)) {
        const [textPrompts, imageUrl] = prompts;

        const imageBlob = await fetchImageAsBlob(imageUrl);
        const uploadedImage = await ai.files.upload({
            file: imageBlob
        });

        if (!uploadedImage.uri || ! uploadedImage.mimeType) {
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

    try {
        const response = await ai.models.generateContentStream({
            model: "gemini-2.0-flash",
            contents: contents,
            config: {
                safetySettings: safetySettings
            }
        })

        // handle chunk, AI model responds in small piece of text (chunk)
        // call handleStreamingUpdate to update generatedAnswers in UI
        for await (const chunk of response) {
            if (chunk.text) {
                handleStreamingUpdate(chunk?.text)
                fullResponse += chunk?.text
            }
            console.log("chunk:", chunk.text)
        }

        return fullResponse;
    } catch (error) {
        console.error("Error generating content:", error);
    }
}

// Let AI model remember chat history and response correspondingly
let chat: any;

export const initializeChat = () => {
    chat = ai.chats.create({
        model: "gemini-2.0-flash",
        history: []
    })
};

export const sendMessageToChat = async (message: string) => {
    if (!chat) {
        console.log("No chat is initialized");
        return
    }

    try {
        const response = await chat.sendMessage({message});
        return response.text;
    } catch (error) {
        console.error("Error sending message to chat:", error)    }
}

