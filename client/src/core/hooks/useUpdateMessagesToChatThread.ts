import { useFetchChatListContext } from "../context/fetchChatListContext";

interface UseUpdateMessagesToChatThreadProps {
    chatId: string;
    setAllChat: React.Dispatch<React.SetStateAction<any>>;
}

interface UpdateMessagesToChatThreadProps {
    question?: string;
    answer: string;
    imageUrl?: string;
}

const apiEndpointBasedUrl = import.meta.env.VITE_SERVER_URL;

export const useUpdateMessagesToChatThread = ({ chatId, setAllChat }: UseUpdateMessagesToChatThreadProps) => {
    const { fetchChatList } = useFetchChatListContext();

    const updateMessagesToChatThread = async ({ question, answer, imageUrl }: UpdateMessagesToChatThreadProps) => {
        try {
            const response = await fetch(`${apiEndpointBasedUrl}/api/chats/${chatId}`, {
                method: "PUT",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    question,
                    answer,
                    img: imageUrl
                })
            });

            if (!response.ok) {
                throw new Error("Failed to update chat.");
            }

            // Update local state
            setAllChat((prevChat: any) => {
                if (question) {
                    // for new messages from NewPrompt,
                    // update user prompt and AI answer to database
                    return {
                        ...prevChat,
                        history: [
                            ...prevChat.history,
                            { role: "user", parts: [{ text: question }], img: imageUrl },
                            { role: "model", parts: [{ text: answer }] },
                        ],
                    };
                } else {
                    // for very first message, dealt with at DashboardPage,
                    // update chat history with AI answer,
                    // prevent next message to remove just-generated response
                    return {
                        ...prevChat,
                        history: [
                            ...prevChat.history,
                            { role: "model", parts: [{ text: answer }] }
                        ],
                    };
                }
            });

            // Refresh the chat list to update the order
            await fetchChatList();
        } catch (error) {
            console.error("Error updating chat:", error);
            throw error;
        }
    };

    return { updateMessagesToChatThread };
};
