import { useNavigate } from "react-router-dom";
import "./DashboardPage.css"
import { useFetchChatListContext } from "../../utils/context/fetchChatListContext";

const DashboardPage = () => {
    //add userId later when integrating AUTH model into this project
    const userId = "12345";
    const navigate = useNavigate();
    const {fetchChatList} = useFetchChatListContext()

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        const text = e.target.text.value;
        if (!text) return;

        try {
            const response = await fetch("http://localhost:5000/api/chats", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({userId: userId ,text: text})
            })

            if (!response.ok) {
                throw new Error("Something is wrong when creating a new chat...")
            };

            const data = await response.json();

            await fetchChatList();
            
            navigate(`/dashboard/chats/${data._id}`)
        } catch (error) {
            console.error("Something is wrong, cant create a new chat.", error)
        }
    }

    return (
        <div className='dashboardPage'>
            <div className="texts">
                <div className="logo">LOGO</div>
                <h1>My AI</h1>
                <div className="options">
                    <div className="option">
                        Create new chat
                    </div>
                    <div className="option">
                        Analyze image
                    </div>
                    <div className="option">
                        Help with my code
                    </div>
                </div>
            </div>
            <div className="formContainer">
                <form action="" onSubmit={handleSubmit}>
                    <input type="text" name="text" placeholder='Ask me something...'/>
                    <button>
                        ^
                    </button>
                </form>
            </div>
        </div>
    )
}

export default DashboardPage