import "./NewPrompt.css"
import { IKImage } from "imagekitio-react";
import Upload from "../upload/Upload";
import { useEffect, useRef, useState } from "react"
import { initializeChat } from "../../utils/aiLibrary/gemini";
import ReactMarkdown from "react-markdown";
import { formatText } from "../../utils/helpers/formatText";
import { useGenerateAiAnswer } from "../../utils/hooks/useGenerateAiAnswer";
import { useUpdateMessagesToChatThread } from "../../utils/hooks/useUpdateMessageToChatThread";

const urlEndpoint = import.meta.env.VITE_IMAGE_KIT_ENDPOINT;

interface ImgUploadStateType {
    isLoading: boolean,
    error: string;
    dbData: any
}

interface NewPromptProps {
    allChat: any,
    chatId: any,
    setAllChat: any,
    formWrapperRef: React.RefObject<HTMLDivElement>
}

const NewPrompt: React.FC<NewPromptProps> = ({allChat, chatId, setAllChat, formWrapperRef}) => {
    const [prompts, setPrompts] = useState<string | undefined> ("");
    const [submittedPrompts, setSubmittedPrompts] = useState<string | undefined> ("");
    const [generatedAnswers, setGeneratedAnswers] = useState<string | undefined> ("");
    const [submittedImage, setSubmittedImage] = useState<string | undefined>(undefined);
    const [img, setImg] = useState<ImgUploadStateType>({
        isLoading: false,
        error: "",
        dbData: {}
    });

    const endChatSeperatorRef = useRef<HTMLDivElement | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const hasGenerateAnswerForFirstMsgRef = useRef(false);

    const handleStreamingUpdate = (newChunk: string) => {
        setGeneratedAnswers(prevText => prevText + newChunk);
    };

    const { generateAiAnswer } = useGenerateAiAnswer({
        onStreamingUpdate: handleStreamingUpdate
    });

    const { updateMessagesToChatThread } = useUpdateMessagesToChatThread({
        chatId,
        setAllChat
    });

    // initialize chat history history changes
    useEffect(() => {
        if (allChat?.history) {
            initializeChat(allChat.history);
        }
    }, [allChat?.history]);
    
    // Generate answer when providing prompt from Dashboard
    // a.k.a when chat has only 1 message
    useEffect(() => {
        const generateAiAnswerForFirstMessage = async () => {
            try {
                // get img data from chat history instead of local state
                const firstMessage = allChat.history[0];
                if (!firstMessage?.parts?.[0]?.text) {
                    throw new Error("Invalid message format");
                }

                const aiResponse = await generateAiAnswer({
                    prompt: firstMessage.parts[0].text,
                    imageUrl: firstMessage.img
                });

                if (!aiResponse) {
                    throw new Error("No response from AI");
                }

                await updateMessagesToChatThread({
                    answer: aiResponse
                });

                setImg({
                    isLoading: false,
                    error: "",
                    dbData: {}
                });

                setGeneratedAnswers("");

            } catch (error) {
                console.error("Error generating answers:", error);
            }
        }

        if (!hasGenerateAnswerForFirstMsgRef.current && allChat?.history?.length === 1) {
            generateAiAnswerForFirstMessage();
            hasGenerateAnswerForFirstMsgRef.current = true;
        }
    }, [allChat?.history, hasGenerateAnswerForFirstMsgRef]);

    useEffect(() => {
        endChatSeperatorRef.current?.scrollIntoView({behavior: "smooth"});
    }, [submittedPrompts, generatedAnswers])

    const handleExpandTextareaHeight = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        e.target.style.height = "auto";
        e.target.style.height = `${e.target.scrollHeight}px`;
    };

    const handleResetTextareaHeight = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
        }
    }

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        if (!prompts) return;

        const currentPrompt = prompts; // store current prompt value
        const currentImage = img.dbData.url; // store current image url
        setSubmittedPrompts(currentPrompt);
        setSubmittedImage(currentImage);
        
        setPrompts("");
        handleResetTextareaHeight();

        setImg({
            isLoading: false,
            error: "",
            dbData: {}
        });

        try {
            setGeneratedAnswers("");
            
            const aiResponse = await generateAiAnswer({
                prompt: currentPrompt,
                imageUrl: currentImage
            });

            if (!aiResponse) {
                throw new Error("No response from AI");
            }

            await updateMessagesToChatThread({
                question: currentPrompt,
                answer: aiResponse,
                imageUrl: currentImage
            });

            setSubmittedPrompts("");
            setSubmittedImage(undefined);
            setGeneratedAnswers("");
        } catch (error) {
            console.error("Error generating answers:", error);
            // Don't clear submittedPrompts on error
            setGeneratedAnswers("");
        }
    };

    return (
        <>
            {allChat?.history?.map((item: any, index: number) => (
                <div key={index} className={`message ${item.role === "user" ? "user" : ""}`}>
                    {item.img && <img src={item.img} alt="Uploaded" width={200} />}
                    {item.role === "user" ? (
                        <div>{formatText(item.parts[0].text)}</div> // preserve line break
                    ) : (
                        <ReactMarkdown>{item.parts[0].text}</ReactMarkdown>
                    )}
                </div>
            ))}
            {submittedPrompts && 
                <div className="message user">
                    {submittedImage && <img src={submittedImage} alt="Uploaded" width={200} />}
                    {formatText(submittedPrompts)}
                </div>
            }
            {/* make sure new prompt doesnt replace the previous one whose AI answer is not generated */}
            {generatedAnswers && !allChat?.history?.some((msg: any) => msg.parts[0].text === generatedAnswers) && 
                <div className="message">
                    <ReactMarkdown>{generatedAnswers}</ReactMarkdown>
                </div>
            }
            <div className="endChatSeperator" ref={endChatSeperatorRef}></div>
            <div className="formWrapper" ref={formWrapperRef}>
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
                        ref={textareaRef}
                        value={prompts}
                        onChange={e => setPrompts(e.target.value)}
                        placeholder="Ask me something..."
                        onInput={handleExpandTextareaHeight}
                    ></textarea>
                    <div className="buttons">
                        <Upload setImg={setImg}/>
                        <button className="submit-button" disabled={!prompts}>
                            <img src="/up-arrow-icon.svg" alt="" />
                        </button>
                    </div>
                </form>
                <p>Our AI agent can make mistakes. Please double check the information before any major decisions.</p>
            </div>
        </>
    )
}

export default NewPrompt

// explain the seperate rendering state of uploaded photo
// -  when a photo is uploaded, setImg is called from Upload component
// -  photo is rendered in the newForm element
// -  when user message is sent, clear immediately the photo state (to remove it from newForm)
// -  before clearing setImg, save photo URL to submittedImage state
// -  now we can use the photo URL to render img where we need constantly, without having to wait for anything
// -  clear submittedImage when user message is sent and saved successfully
