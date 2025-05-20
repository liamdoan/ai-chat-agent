import { createContext, useContext, useEffect, useState } from "react";

const FetchChatListContext = createContext<any>(null);

const apiEndpointBasedUrl = import.meta.env.VITE_SERVER_URL;

export const FetchChatListProvider = ({children} : {children: React.ReactNode}) => {
    const [chatList, setChatlist] = useState<any>(null);

    const fetchChatList = async () => {
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
            console.error(error)
        }
    };
    
    useEffect(() => {
        fetchChatList();
    }, []);

    return (
        <FetchChatListContext.Provider value={{chatList, setChatlist, fetchChatList}}>
            {children}
        </FetchChatListContext.Provider>
    )
}

export const useFetchChatListContext = () => useContext(FetchChatListContext);
