import { IKContext, IKUpload } from 'imagekitio-react';
import { useRef } from 'react';
import "./Upload.css"

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
    } catch (error: any) {
        throw new Error(`Authentication request failed: ${error.message}`);
    }
};

const Upload = ({setImg}: { setImg: any }) => {
    const ikUploadRef = useRef<any>(null)

    const onError = (err: any) => {
        console.log("Error", err);
    };
    
    const onSuccess = (res: any) => {
        console.log("Success", res);
        setImg((prev: any) => ({
            ...prev,
            isLoading: false,
            dbData: res
        }))
    };
    
    const onUploadProgress = (progress: any) => {
        console.log("Progress", progress);
    };
    
    const onUploadStart = (evt: any) => {
        console.log("Start", evt);
        setImg((prev: any) => ({
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
