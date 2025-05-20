import "./ChatListItemMenu.css"
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import ConfirmDeletePopup from "./ConfirmDeletePopup";
import { useFetchChatListContext } from "../../utils/context/fetchChatListContext";

interface ChatListItemMenuProps {
    chatId: string;
    chatTitle: string;
}

const ChatListItemMenu: React.FC<ChatListItemMenuProps> = ({ chatId, chatTitle }) => {
    const [isItemMenuVisible, setIsItemMenuVisible] = useState<boolean>(false);
    const [isDeletePopupVisible, setIsDeletePopupVisible] = useState<boolean>(false);
    const [coords, setCoords] = useState<{ top: number, left: number } | null>(null);
    const buttonRef = useRef<HTMLDivElement>(null);
    const { fetchChatList } = useFetchChatListContext();

    const menuContainer = document.querySelector('.menu') as HTMLElement;

    useEffect(() => {
        if (isItemMenuVisible && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setCoords({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX,
            });
        }
    }, [isItemMenuVisible]);

    useEffect(() => {
        if (isItemMenuVisible) {
            document.body.style.overflow = "hidden";

            if (menuContainer) {
                menuContainer.style.overflow = "hidden";
            }
        } else {
            document.body.style.overflow = "";

            if (menuContainer) {
                menuContainer.style.overflow = "auto";
            }
        }

        return () => {
            document.body.style.overflow = "";

            if (menuContainer) {
                menuContainer.style.overflow = "auto";
            }
        };
    }, [isItemMenuVisible]);

    const handleClickDeleteButtonFromMenu = () => {
        setIsDeletePopupVisible(true);
        setIsItemMenuVisible(false);
    }

    const handleConfirmDeleteThread = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/chats/${chatId}`, {
                method: 'DELETE',
                credentials: "include"
            });

            if (!response.ok) {
                throw new Error('Failed to delete chat');
            }

            // Fetch updated chat list,
            // make it consistent as DashboardPage
            await fetchChatList();
            
            setIsDeletePopupVisible(false);
        } catch (error) {
            console.error("Error deleting chat:", error);
        }
    }

    const handleCancelDeleteThread = () => {
        setIsDeletePopupVisible(false);
    }

  return (
    <div
        ref={buttonRef}
        className="chat-list-item-menu-wrapper"
        onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsItemMenuVisible(!isItemMenuVisible);
        }}
    >
        <p>...</p>
        {isItemMenuVisible && coords ? createPortal(
            <div 
                className="menu-overlay"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsItemMenuVisible(false);
                }}
            >
                <div
                    className="chat-list-item-menu-options"
                    style={{
                        top: coords.top,
                        left: coords.left,
                    }}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsItemMenuVisible(false);
                    }}
                >
                    <p className="menu-option">
                        <img src="/pen-icon.svg" alt="rename" />
                        Rename
                    </p>
                    <p
                        className="menu-option delete"
                        onClick={handleClickDeleteButtonFromMenu}
                    >
                        <img src="/trashcan-icon.svg" alt="delete" />
                        Delete
                    </p>
                </div>
            </div>,
            document.getElementById("menu-portal")!
        ) : null}
        {isDeletePopupVisible && chatId ? createPortal(
            <ConfirmDeletePopup
                chatTitle={chatTitle}
                handleConfirmDeleteThread={handleConfirmDeleteThread}
                handleCancelDeleteThread={handleCancelDeleteThread}
            />,
            document.getElementById("menu-portal")!
        ) : null}
    </div>
  )
}

export default ChatListItemMenu
