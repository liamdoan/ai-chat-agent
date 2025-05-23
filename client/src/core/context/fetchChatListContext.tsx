import { createContext, useContext, useEffect, useState } from "react";

const FetchChatListContext = createContext<any>(null);

const apiEndpointBasedUrl = import.meta.env.VITE_SERVER_URL;

export const FetchChatListProvider = ({children} : {children: React.ReactNode}) => {
    const [chatList, setChatlist] = useState<any>(null);
    const [isFetchingChatList, setIsFetchingChatList] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchChatList = async () => {
        setIsFetchingChatList(true);
        setError(null);
        
        try {
            const response = await fetch(`${apiEndpointBasedUrl}/api/chats`, {
                credentials: "include"
            })

            if (!response.ok) {
                throw new Error("Can't fetch all chats.")
            }

            const data = await response.json();
            setChatlist(data);
        } catch (error) {
            console.error(error);
            setError(error as Error);
        } finally {
            setIsFetchingChatList(false);
        }
    };
    
    useEffect(() => {
        fetchChatList();
    }, []);

    return (
        <FetchChatListContext.Provider value={{
            chatList, 
            setChatlist, 
            fetchChatList,
            isFetchingChatList,
            error
        }}>
            {children}
        </FetchChatListContext.Provider>
    )
}

export const useFetchChatListContext = () => useContext(FetchChatListContext);
