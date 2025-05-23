import "./ChatList.css"
import { Link } from 'react-router-dom'
import { useFetchChatListContext } from "../../core/context/fetchChatListContext"
import ChatListItem from "./ChatListItem";
import { ChatThreadType } from "../../core/types/type";
import Spinner from "../loading/Spinner";

const ChatList = () => {
    const { chatList, isFetchingChatList } = useFetchChatListContext();

    return (
        <div className='chatList'>
            <div className="functionalLinks">
                <Link className="mainLink createNewChat" to="/dashboard">
                    <img src="/create-new-chat.svg" alt="create new chat" />
                </Link>
            </div>
            <>
                <Link className="mainLink explore" to="/explore">
                    <img src="/explore.svg" alt="" />
                    Explore our AI chat
                </Link>
                <Link className="mainLink contact" to="/contact">
                    <img src="/contact-us.svg" alt="" />
                    Contact
                </Link>
            </>
            <hr />
            <p className="section-title">Recent Chats</p>
            <div className="list">
                {isFetchingChatList ?
                    <div className="loading-spinner"><Spinner /></div>
                : (
                    chatList && [...chatList].reverse().map((chatThread: ChatThreadType) => (
                        <ChatListItem 
                            key={chatThread._id}
                            chatThread={chatThread}
                        />
                    ))
                )}
            </div>
            <Link className="mainLink upgrade" to="/upgrade">
                <img src="/upgrade-icon.svg" alt="" />
                <div className="text">
                    <span>Upgrade plans</span>
                    <br />
                    <span className="subText">More access to the best features of our AI chat</span>
                </div>
            </Link>
        </div>
    );
};

export default ChatList;
