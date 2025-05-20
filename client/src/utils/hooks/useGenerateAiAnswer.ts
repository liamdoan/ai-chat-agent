import { generateContent, sendMessageToChat } from "../aiLibrary/gemini";

interface UseGenerateAiAnswerProps {
    onStreamingUpdate: (newChunk: string) => void;
}

interface GenerateAiAnswerParams {
    prompt: string;
    imageUrl?: string;
}

export const useGenerateAiAnswer = ({ onStreamingUpdate }: UseGenerateAiAnswerProps) => {
    const generateAiAnswer = async ({ prompt, imageUrl }: GenerateAiAnswerParams) => {
        try {
            let aiResponse;

            // currently, "gemini-2.0-flash" model can't directly process
            // img inputs within sendMessageToChat function,
            // hence the conditions
            if (imageUrl) {
                aiResponse = await generateContent([prompt, imageUrl], onStreamingUpdate);
            } else {
                aiResponse = await sendMessageToChat(prompt, onStreamingUpdate);
            }

            return aiResponse;
        } catch (error) {
            console.error("Error generating message:", error);
            throw error;
        }
    };

    return { generateAiAnswer };
};
