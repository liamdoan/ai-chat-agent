import "./ChatListItem.css";
import { NavLink } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import ChatListItemMenu from "./ChatListItemMenu";
import { useFetchChatListContext } from "../../core/context/fetchChatListContext";
import { useEditChatThreadTitle } from "../../core/hooks/useEditChatThreadTitle";
import { ChatThreadType } from "../../core/types/type";
import { handleKeyDownSubmit } from "../../core/helpers/handleKeydownSubmit";

interface ChatListItemProps {
    chatThread: ChatThreadType;
}

const ChatListItem: React.FC<ChatListItemProps> = ({ chatThread }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(chatThread.title);
    const inputRef = useRef<HTMLInputElement>(null);

    const { fetchChatList } = useFetchChatListContext();
    const { confirmEditChatThreadTitle } = useEditChatThreadTitle();

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleSubmit = async () => {
        if (title.trim() === chatThread.title) {
            setIsEditing(false);
            return;
        }

        await confirmEditChatThreadTitle({
            chatThreadId: chatThread._id,
            chatThreadTitle: title.trim(),
            onSuccess: async () => {
                await fetchChatList();
                setIsEditing(false);
            },
            onError: () => {
                setTitle(chatThread.title);
                setIsEditing(false);
            }
        })
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        handleKeyDownSubmit(e, {
            onEnter: handleSubmit,
            onEscape: () => {
                setTitle(chatThread.title);
                setIsEditing(false);
            }
        })
    }

    if (isEditing) {
        return (
            <div className="chatListItem">
                <input
                    ref={inputRef}
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={handleSubmit}
                    className="chatListItemTitleInput"
                />
            </div>
        );
    }

    return (
        <NavLink
            className="chatListItemLink"
            to={`/dashboard/chats/${chatThread._id}`}
        >
            <p className="chatListItemTitle">{chatThread.title}</p>
            <div className="chatListItemMenu">
                <ChatListItemMenu 
                    chatThreadId={chatThread._id}
                    chatThreadTitle={chatThread.title}
                    onRenameTitle={() => setIsEditing(true)}
                />
            </div>
        </NavLink>
    );
};

export default ChatListItem;
