import "./NewPrompt.css"
import { IKImage } from "imagekitio-react";
import Upload from "../upload/Upload";
import { useEffect, useRef, useState } from "react"
import { initializeChat } from "../../core/aiLibrary/gemini";
import ReactMarkdown from "react-markdown";
import { formatText } from "../../core/helpers/formatText";
import { useGenerateAiAnswer } from "../../core/hooks/useGenerateAiAnswer";
import { useUpdateMessagesToChatThread } from "../../core/hooks/useUpdateMessagesToChatThread";
import { handleExpandTextareaHeight, handleResetTextareaHeight } from "../../core/helpers/textAreaHeightMeasure";
import { handleKeyDownSubmit } from "../../core/helpers/handleKeydownSubmit";
import Spinner from "../loading/Spinner";
import { Chat, ChatHistory, ImgUploadStateType } from "../../core/types/type";
import LoadingText from "../loading/LoadingText";
import uiMessages from "../../core/messages/uiMessages_en.json";

const urlEndpoint = import.meta.env.VITE_IMAGE_KIT_ENDPOINT;

interface NewPromptProps {
    allChat: Chat,
    chatId?: string,
    setAllChat: React.Dispatch<React.SetStateAction<Chat>>,
    formWrapperRef: React.RefObject<HTMLDivElement>
}

const NewPrompt: React.FC<NewPromptProps> = ({allChat, chatId, setAllChat, formWrapperRef}) => {
    const [prompts, setPrompts] = useState<string | undefined> ("");
    const [submittedPrompts, setSubmittedPrompts] = useState<string | undefined> ("");
    const [generatedAnswers, setGeneratedAnswers] = useState<string | undefined> ("");
    const [submittedImage, setSubmittedImage] = useState<string | undefined>(undefined);
    const [isWaitingForResponseOnImg, setIsWaitingForResponseOnImg] = useState<boolean>(false);
    const [img, setImg] = useState<ImgUploadStateType>({
        isLoading: false,
        error: "",
        dbData: {}
    });

    const endChatSeperatorRef = useRef<HTMLDivElement | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const hasGenerateAnswerForFirstMsgRef = useRef(false);

    const handleStreamingUpdate = (newChunk: string) => {
        if (isWaitingForResponseOnImg) {
            setIsWaitingForResponseOnImg(false);
        }
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

                if (firstMessage.img) {
                    setIsWaitingForResponseOnImg(true);
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
            } finally {
                setIsWaitingForResponseOnImg(false);
            }
        }

        if (!hasGenerateAnswerForFirstMsgRef.current && allChat?.history?.length === 1) {
            generateAiAnswerForFirstMessage();
            hasGenerateAnswerForFirstMsgRef.current = true;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allChat?.history, hasGenerateAnswerForFirstMsgRef]);

    useEffect(() => {
        endChatSeperatorRef.current?.scrollIntoView({behavior: "smooth"});
    }, [submittedPrompts, generatedAnswers])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!prompts) return;

        const currentPrompt = prompts; // store current prompt value
        const currentImage = img.dbData.url; // store current image url
        setSubmittedPrompts(currentPrompt);
        setSubmittedImage(currentImage);
        
        setPrompts("");
        handleResetTextareaHeight(textareaRef);

        setImg({
            isLoading: false,
            error: "",
            dbData: {}
        });

        try {
            setGeneratedAnswers("");
            // Only set waiting state if there's an image
            if (currentImage) {
                setIsWaitingForResponseOnImg(true);
            }
            
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
        } finally {
            setIsWaitingForResponseOnImg(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        handleKeyDownSubmit(e, {
            onEnter: () => handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>),
            onShiftEnter: () => setPrompts(prev => prev + '\n')
        })
    }

    return (
        <>
            {allChat?.history?.map((item: ChatHistory, index: number) => (
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
            {isWaitingForResponseOnImg &&(
                <LoadingText loadingText={uiMessages.aiResponseLoading} />
            )}
            {generatedAnswers && !allChat?.history?.some((msg: ChatHistory) => msg.parts[0].text === generatedAnswers) && 
                <div className="message">
                    <ReactMarkdown>{generatedAnswers}</ReactMarkdown>
                </div>
            }
            <div className="endChatSeperator" ref={endChatSeperatorRef}></div>
            <div className="formWrapper" ref={formWrapperRef}>
                <form className="newForm" onSubmit={handleSubmit}>
                    {img.isLoading &&
                        <div className="loading-spinner"><Spinner /></div>
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
                        onInput={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                            handleExpandTextareaHeight(e)
                        }}
                        onKeyDown={handleKeyDown}
                    ></textarea>
                    <div className="buttons">
                        <Upload setImg={setImg}/>
                        <button
                            className="submit-button"
                            disabled={!prompts || isWaitingForResponseOnImg}
                        >
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
