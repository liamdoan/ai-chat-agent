import "./ChatListItemMenu.css"
import { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";


const ChatListItemMenu = () => {
    const [isItemMenuVisible, setIsItemMenuVisible] = useState<boolean>(false);
    const [coords, setCoords] = useState<{ top: number, left: number } | null>(null);
    const buttonRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isItemMenuVisible && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setCoords({
            top: rect.bottom + window.scrollY,
            left: rect.left + window.scrollX,
        });
        }
    }, [isItemMenuVisible]);

  return (
    <div
        ref={buttonRef}
        className="chatListItemMenuWrapper"
        onClick={() => {
            setIsItemMenuVisible(!isItemMenuVisible),
            console.log("isItemMenuVisible", isItemMenuVisible);
        }}
    >
        <p>...</p>
        {isItemMenuVisible && coords ? ReactDOM.createPortal(
            <div
                className="chatListItemMenuOptions"
                style={{
                    top: coords.top,
                    left: coords.left,
                }}
            >
                <p>DeleteDeleteDeleteDelete</p>
                <p>DeleteDeleteDeleteDelete</p>
                <p>DeleteDeleteDeleteDelete</p>
                <p>DeleteDeleteDeleteDelete</p>

            </div>,
            document.getElementById("menu-portal")!
            ) : null
        }
    </div>
  )
}

export default ChatListItemMenu