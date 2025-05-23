import "./ChatPage.css"
import NewPrompt from "../../components/newPrompt/NewPrompt";
import { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useFetchChatInThread } from "../../core/hooks/useFetchChatInThread";
import LoadingText from "../../components/loading/LoadingText";
import FailNotice from "../../components/failNotice/FailNotice";
import uiMessages from "../../core/messages/uiMessages_en.json";

const ChatPage = () => {
    const {id} = useParams();
    const bottomChatPageRef = useRef<HTMLDivElement>(null);
    const chatPageComponentRef = useRef<HTMLDivElement | null>(null);
    const formWrapperRef = useRef<HTMLDivElement | null>(null);
    const navigate = useNavigate();

    const { allChat, setAllChat, loading, isDoneFetching, error } = useFetchChatInThread(id);

    useEffect(() => {
        if (isDoneFetching && !allChat) {
            navigate("/dashboard");
            return;
        }
        
    }, [isDoneFetching]);

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
            {loading ??
                <LoadingText loadingText={uiMessages.chatHistoryLoading} />
            }
            {error &&
                <FailNotice
                    title={uiMessages.chatHistoryLoadingErrorTitle}
                    description={uiMessages.chatHistoryLoadingErrorDescription}
                />
            }
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

export default ChatPage
