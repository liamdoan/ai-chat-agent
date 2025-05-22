import { useFetchChatListContext } from "../context/fetchChatListContext";

interface ConfirmDeleteChatThreadProps {
    chatId: string;
    onSuccess?: () => void;
    onError?: (error: Error) => void;
}

const apiEndpointBasedUrl = import.meta.env.VITE_SERVER_URL;

export const useConfirmDeleteChatThread = () => {
    const { fetchChatList } = useFetchChatListContext();

    const confirmDeleteChatThread = async ({ chatId, onSuccess, onError }: ConfirmDeleteChatThreadProps) => {
        try {
            const response = await fetch(`${apiEndpointBasedUrl}/api/chats/${chatId}`, {
                method: 'DELETE',
                credentials: "include"
            });

            if (!response.ok) {
                throw new Error('Failed to delete chat');
            }

            // fetch updated chat list to refresh UI,
            // make it consistent with Dashboard
            await fetchChatList();
            
            // call success callbacks if API call is ok
            onSuccess?.();
        } catch (error) {
            console.error("Error deleting chat:", error);
            onError?.(error as Error);
        }
    };

    return { confirmDeleteChatThread };
};
