import "./ChatList.css"
import { Link, NavLink } from 'react-router-dom'
import { useFetchChatListContext } from "../../core/context/fetchChatListContext"
import ChatListItemMenu from "./ChatListItemMenu";

const ChatList = () => {
    const {chatList} = useFetchChatListContext();

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
            <p className="title">Recent Chats</p>
            <div className="list">
                {chatList && [...chatList].reverse().map((chat: any) => (
                    <NavLink
                        className="chatListItemLink"
                        key={chat._id}
                        to={`/dashboard/chats/${chat._id}`}
                    >
                        <p className="chatListItemTitle">{chat.title}</p>
                        <div className="chatListItemMenu">
                            <ChatListItemMenu 
                                chatId={chat._id}
                                chatTitle={chat.title}
                            />
                        </div>
                    </NavLink>
                ))}
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
    )
}

export default ChatList
