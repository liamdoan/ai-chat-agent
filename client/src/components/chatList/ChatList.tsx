import "./ChatList.css"
import { Link } from 'react-router-dom'
import { useFetchChatListContext } from "../../utils/context/fetchChatListContext"

const ChatList = () => {
    const {chatList} = useFetchChatListContext();

    return (
        <div className='chatList'>
            <>
                <Link to="/dashboard">Create a new chat</Link>
                <Link to="/explore">Explore our AI chat</Link>
                <Link to="/contact">Contact</Link>
            </>
            <hr />
            <p className="title">RECENT CHATS</p>
            <div className="list">
                {chatList?.map((chat: any) => (
                    <Link
                        className="chatListItemLink"
                        key={chat._id}
                        to={`/dashboard/chats/${chat._id}`}
                    >
                        {chat.title}
                    </Link>
                ))}
            </div>
            <hr />
            <div className="upgrade">
                <div className="text">
                    <span>Upgrade to pro version</span>
                </div>
            </div>
        </div>
    )
}

export default ChatList