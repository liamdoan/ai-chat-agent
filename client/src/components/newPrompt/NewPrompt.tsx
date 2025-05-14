import "./NewPrompt.css"
import { IKImage } from "imagekitio-react";
import Upload from "../upload/Upload";
import { useEffect, useRef, useState } from "react"
import { generateContent } from "../../utils/aiLibrary/gemini";
import Markdown from "react-markdown";
import { formatText } from "../../utils/formatText";

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
    const [img, setImg] = useState<ImgUploadStateType>({
        isLoading: false,
        error: "",
        dbData: {}
    })

    const endChatSeperatorRef = useRef<HTMLDivElement | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const hasGenerateAnswerForFirstMsgRef = useRef(false);
    
    // Generate answer when providing prompt from Dashboard
    // a.k.a when chat has only 1 message
    useEffect(() => {
        const generateAiAnswerForFirstMessage = async () => {
            let aiResponse: string | undefined = "";

            try {
                if (img.dbData.url) {
                    aiResponse = await generateContent([allChat.history[0].parts[0].text, img.dbData.url], handleStreamingUpdate) 
                } else {
                    aiResponse = await generateContent(allChat.history[0].parts[0].text, handleStreamingUpdate)
                }

                // save AI response to database
                const response = await fetch(`http://localhost:5000/api/chats/${chatId}`, {
                    method: "PUT",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        answer: aiResponse,
                        img: img.dbData.url
                    })
                });

                if (!response.ok) {
                    throw new Error("Failed to update chat with AI response.");
                }

                setImg({
                    isLoading: false,
                    error: "",
                    dbData: {}
                })

                // update chat history with AI answer
                setAllChat((prevChat: any) => ({
                    ...prevChat,
                    history: [
                        ...prevChat.history,
                        { role: "model", parts: [{ text: aiResponse }], img: img.dbData.url || null }
                    ]
                }));

                setGeneratedAnswers("");

            } catch (error) {
                console.error("Error generating answers:", error)
                console.log("this settAllChat in useEffect is called in error")

            }
        }

        if (!hasGenerateAnswerForFirstMsgRef.current && allChat?.history?.length === 1) {
            generateAiAnswerForFirstMessage();
            hasGenerateAnswerForFirstMsgRef.current = true;
        }
    }, [allChat?.history, hasGenerateAnswerForFirstMsgRef])

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

    const handleStreamingUpdate = (newChunk: string) => {
        setGeneratedAnswers(prevText => prevText + newChunk)
    }

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        if (!prompts) return;

        const currentPrompt = prompts; // store current prompt value
        setSubmittedPrompts(currentPrompt);
        
        setPrompts("");
        handleResetTextareaHeight();

        try {
            setGeneratedAnswers("");
            
            let aiResponse;
            if (img.dbData.url) {
                aiResponse = await generateContent([currentPrompt, img.dbData.url], handleStreamingUpdate) 
            } else {
                aiResponse = await generateContent(currentPrompt, handleStreamingUpdate)
            }

            // save user message and AI answer to database
            const response = await fetch(`http://localhost:5000/api/chats/${chatId}`, {
                method: "PUT",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    question: currentPrompt,
                    answer: aiResponse,
                    img: img.dbData.url
                })
            });

            if (!response.ok) {
                throw new Error("Failed to update chat.");
            }

            setImg({
                isLoading: false,
                error: "",
                dbData: {}
            })

            setAllChat((prevChat: any) => ({
                ...prevChat,
                history: [
                    ...prevChat.history,
                    { role: "user", parts: [{ text: currentPrompt }] },
                    { role: "model", parts: [{ text: aiResponse }], img: img.dbData.url || null },
                ],
            }));

            // Only clear states after successful update
            setSubmittedPrompts("");
            setGeneratedAnswers("");
        } catch (error) {
            console.error("Error generating answers:", error);
            // Don't clear submittedPrompts on error
            setGeneratedAnswers("");
        }
    }
  
    return (
        <>
            {img.isLoading && 
                <div>Loading ...</div>
            }
            {img.dbData?.filePath && (
                <IKImage
                    urlEndpoint={urlEndpoint}
                    path={img.dbData?.filePath}
                    width="200"
                    height="auto"
                    loading="lazy"
                />
            )}
            {allChat?.history?.map((item: any, index: number) => (
                <div key={index} className={`message ${item.role === "user" ? "user" : ""}`}>
                    {item.img && <img src={item.img} alt="Uploaded" width={200} />}
                    {item.role === "user" ? (
                        <div>{formatText(item.parts[0].text)}</div> // preserve line break
                    ) : (
                    
                        <Markdown>{item.parts[0].text}</Markdown>
                    )}
                </div>
            ))}
            {submittedPrompts && 
                <div className="message user">{formatText(submittedPrompts)}</div>
            }
            {/* make sure new prompt doesnt replace the previous one whose AI answer is not generated */}
            {generatedAnswers && !allChat?.history?.some((msg: any) => msg.parts[0].text === generatedAnswers) && 
                <div className="message">
                    <Markdown>{generatedAnswers}</Markdown>
                </div>
            }
            <div className="endChatSeperator" ref={endChatSeperatorRef}></div>
            <div className="formWrapper" ref={formWrapperRef}>
                <form className="newForm" onSubmit={handleSubmit}>
                    <textarea
                        ref={textareaRef}
                        value={prompts}
                        onChange={e => setPrompts(e.target.value)}
                        placeholder="Ask me something..."
                        onInput={handleExpandTextareaHeight}
                    ></textarea>
                    <div className="buttons">
                        <Upload setImg={setImg}/>
                        <button className="submit-button">^</button>
                    </div>
                </form>
                <p>Our AI agent can make mistakes. Check important info. See Cookie Preference</p>
            </div>
        </>
    )
}

export default NewPrompt
