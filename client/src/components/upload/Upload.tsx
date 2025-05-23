import { IKContext, IKUpload } from 'imagekitio-react';
import { ChangeEvent, useRef } from 'react';
import "./Upload.css"
import { ImgUploadStateType } from '../../core/types/type';

const urlEndpoint = import.meta.env.VITE_IMAGE_KIT_ENDPOINT;
const publicKey = import.meta.env.VITE_IMAGE_KIT_PUBLIC_KEY;
const serverUrl = import.meta.env.VITE_SERVER_URL;

const authenticator =  async () => {
    try {
        const response = await fetch(`${serverUrl}/api/upload`);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Request failed with status ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        const { signature, expire, token } = data;
        return { signature, expire, token };
    } catch (error: unknown) {
        if (error instanceof Error) {
            throw new Error(`Authentication request failed: ${error.message}`);
        } else {
             throw new Error(`Authentication request failed: Unknown error`);
        }
    }
};

const Upload = ({setImg}: { setImg: React.Dispatch<React.SetStateAction<ImgUploadStateType>> }) => {
    const ikUploadRef = useRef<HTMLInputElement | null>(null)

    const onError = (err: unknown) => {
        if (err instanceof Error) {
            console.log("Error", err.message);
        } else {
            console.log("Error", err);
        }
    };
    
    const onSuccess = (res: unknown) => {
        console.log("Success", res);
        setImg((prev: ImgUploadStateType) => ({
            ...prev,
            isLoading: false,
            dbData: res as Record<string, undefined>
        }))
    };
    
    const onUploadProgress = (progress: ProgressEvent) => {
        console.log("Progress", progress);
    };
    
    const onUploadStart = (evt: ChangeEvent<HTMLInputElement>) => {
        console.log("Start", evt);
        setImg((prev: ImgUploadStateType) => ({
            ...prev,
            isLoading: true
        }))
    };

    return (
        <IKContext
            urlEndpoint={urlEndpoint}
            publicKey={publicKey}
            authenticator={authenticator}
        >
            {/* ...client side upload component goes here */}
            <IKUpload
                fileName="test-upload.png"
                onError={onError}
                onSuccess={onSuccess}
                onUploadProgress={onUploadProgress}
                onUploadStart={onUploadStart}
                useUniqueFileName={true}
                style={{display: "none"}}
                ref={ikUploadRef}
            />
            <label className='attach-button' onClick={() => ikUploadRef.current?.click()}>
                <img src="/attach-icon.svg" alt="" />
            </label>
        </IKContext>
    )
}

export default Upload
