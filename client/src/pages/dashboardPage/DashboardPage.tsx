import "./DashboardPage.css"
import { useState } from "react";
import { IKImage } from "imagekitio-react";
import Upload from "../../components/upload/Upload";
import { useCreateNewChatThread } from "../../core/hooks/useCreateNewChatThread";
import { handleExpandTextareaHeight } from "../../core/helpers/textAreaHeightmeasure";

const urlEndpoint = import.meta.env.VITE_IMAGE_KIT_ENDPOINT;

interface ImgUploadStateType {
    isLoading: boolean,
    error: string;
    dbData: any
}

const DashboardPage = () => {
    // add userId later when integrating AUTH model into this project
    const userId = "12345";
    const [prompts, setPrompts] = useState<string | undefined> ("");
    const [img, setImg] = useState<ImgUploadStateType>({
        isLoading: false,
        error: "",
        dbData: {}
    });

    const { createNewChatThread } = useCreateNewChatThread({ userId });

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        if (!prompts) return;

        try {
            await createNewChatThread({
                prompt: prompts,
                imageUrl: img.dbData.url || null
            });
        } catch (error) {
            console.error("Something is wrong, cant create a new chat.", error)
        }
    };

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
                <form className="newForm" onSubmit={handleSubmit}>
                    {img.isLoading &&
                        <div>Loading ...</div>
                    }
                    {img.dbData?.filePath && (
                        <IKImage
                            urlEndpoint={urlEndpoint}
                            path={img.dbData?.filePath}
                            width="150"
                            height="auto"
                            loading="lazy"
                        />
                    )}
                    <textarea
                        placeholder="Ask me something..."
                        value={prompts}
                        onChange={e => setPrompts(e.target.value)}
                        onInput={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                            handleExpandTextareaHeight(e)
                        }}
                    ></textarea>
                    <div className="buttons">
                        <Upload setImg={setImg}/>
                        <button className="submit-button" disabled={!prompts}>
                            <img src="/up-arrow-icon.svg" alt="" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default DashboardPage