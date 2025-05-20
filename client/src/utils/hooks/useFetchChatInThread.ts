// useFetchChatById.ts
import { useEffect, useState } from "react";

const apiEndpointBasedUrl = import.meta.env.VITE_SERVER_URL;

export const useFetchChatInThread = (id?: string) => {
    const [allChat, setAllChat] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [isDoneFetching, setIsDoneFetching] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!id) return;

        const fetchChatInThread = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${apiEndpointBasedUrl}/api/chats/${id}`, {
                    credentials: "include"
                });

                if (!response.ok) {
                    throw new Error("Can't fetch all chats.");
                }

                const data = await response.json();

                if(!data || Object.keys(data).length === 0) {
                    setAllChat(null);
                    return;
                }

                setAllChat(data);
            } catch (err: any) {
                setError(err);
            } finally {
                setLoading(false);
                setIsDoneFetching(true);
            }
        };

        fetchChatInThread();

        // id in dependency is to render ChatPage correspondingly to the id 
        // after clicking on the chat in ChatList
    }, [id]);

    return { allChat, setAllChat, loading, isDoneFetching, error };
};
