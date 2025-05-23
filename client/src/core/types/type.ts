export interface ChatThreadType {
    _id: string;
    title: string;
}

export interface ChatHistory {
    role: string;
    parts: {
        type: string;
        text: string;
    }[];
    img?: string;
}

export interface Chat {
    _id: string;
    title: string;
    history: ChatHistory[];
}

export interface ImgUploadStateType {
    isLoading: boolean,
    error: string;
    dbData: Record<string, undefined>;
}

export interface ErrorLike {
    status?: number;
    message?: string;
}
