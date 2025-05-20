import { useNavigate } from "react-router-dom";
import { useFetchChatListContext } from "../context/fetchChatListContext";

// pass userId just one,
// don't need to pass everytime as prompts and imageUrl 
interface UseCreateNewChatThreadProps {
    userId: string;
}

interface CreateNewChatThreadProps {
    prompt: string;
    imageUrl?: string | null;
}

const apiEndpointBasedUrl = import.meta.env.VITE_SERVER_URL;

export const useCreateNewChatThread = ({ userId }: UseCreateNewChatThreadProps) => {
    const navigate = useNavigate();
    const { fetchChatList } = useFetchChatListContext();

    const createNewChatThread = async ({ prompt, imageUrl }: CreateNewChatThreadProps) => {
        try {
            const response = await fetch(`${apiEndpointBasedUrl}/api/chats`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    userId,
                    text: prompt,
                    img: imageUrl
                })
            });

            if (!response.ok) {
                throw new Error("Failed to create a new chat");
            }

            const data = await response.json();
            await fetchChatList();
            navigate(`/dashboard/chats/${data._id}`);

            return data;
        } catch (error) {
            console.error("Error creating new chat:", error);
            throw error;
        }
    };

    return { createNewChatThread };
};
