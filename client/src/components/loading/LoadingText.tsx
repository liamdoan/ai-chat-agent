import React from 'react'
import "./LoadingText.css"

interface LoadingTextProps {
    loadingText: string;
}

const LoadingText: React.FC<LoadingTextProps> = ({loadingText}) => {
    return (
        <p className='loading-text'>{loadingText}</p>
    )
}

export default LoadingText
