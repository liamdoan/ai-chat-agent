import "./ChatPage.css"
import NewPrompt from "../../components/newPrompt/NewPrompt";
import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";

const chatPage = () => {
    const {id} = useParams();
    const [allChat, setAllChat] = useState<any>(null);
    const bottomChatPageRef = useRef<HTMLDivElement>(null);
    const chatPageComponentRef = useRef<HTMLDivElement | null>(null);
    const formWrapperRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const fetchChatInThread = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/chats/${id}`, {
                    credentials: "include"
                })

                if (!response.ok) {
                    throw new Error("Can't fetch all chats.")
                }

                const data = await response.json();

                if(!data || Object.keys(data).length === 0) {
                    setAllChat(null);
                    return;
                }

                setAllChat(data);
            } catch (error) {
                console.error(error)
            }
        };

        fetchChatInThread();

        // id in dependency is to render ChatPage correspondingly to the id 
        // after clicking on the chat in ChatList
    }, [id]);

    useEffect(() => {
        if (allChat?.history) {
            bottomChatPageRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [allChat]);

    // track formWrapper elem height in newPrompt component to resize chatPage component
    useEffect(() => {
        const observer = new ResizeObserver(() => {
            if (formWrapperRef.current && chatPageComponentRef.current) {
            const formWrapperHeight = formWrapperRef.current.offsetHeight;
            const fullHeight = window.innerHeight;

            chatPageComponentRef.current.style.height = `${fullHeight - formWrapperHeight}px`;
            }
        });

        // observe formWrapper's height changes
        if (formWrapperRef.current) {
            observer.observe(formWrapperRef.current);
        }

        // cleanup observer in unmount
        return () => {
            if (formWrapperRef.current) {
            observer.unobserve(formWrapperRef.current);
            }
        };
    }, []);

    return (
        <div className="chatPage" ref={chatPageComponentRef}>
            <div className="wrapper">
                <div className="chat">
                    <NewPrompt
                        allChat={allChat}
                        chatId={id}
                        setAllChat={setAllChat}
                        formWrapperRef={formWrapperRef}
                    />
                    <div ref={bottomChatPageRef} />
                </div>
            </div>
        </div>
    )
}

export default chatPage
