const apiEndpointBasedUrl = import.meta.env.VITE_SERVER_URL;

interface confirmEditChatThreadTitleProps {
    chatThreadId: string,
    chatThreadTitle: string,
    onSuccess: () => void,
    onError: () => void
}

export const useEditChatThreadTitle = () => {
    const confirmEditChatThreadTitle = async ({chatThreadId, chatThreadTitle, onSuccess, onError}: confirmEditChatThreadTitleProps) => {
        try {
            const response = await fetch(`${apiEndpointBasedUrl}/api/chats/${chatThreadId}/title`, {
                method: 'PUT',
                credentials: "include",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: chatThreadTitle.trim()
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update title')
            };

            onSuccess?.();
        } catch (error) {
            console.error('Error updating chat title:', error);
            onError?.();
        }
    }
    
    return { confirmEditChatThreadTitle }
};
