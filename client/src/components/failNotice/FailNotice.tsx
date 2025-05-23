import React from 'react'
import "./FailNotice.css"

interface FailNoticeProps {
    title: string,
    description?: string
}

const FailNotice: React.FC<FailNoticeProps> = ({title, description}) => {
    return (
        <div className="error-wrapper">
            <p className="error-title">{title}</p>
            <p className="error-description">{description}</p>
        </div>
    )
}

export default FailNotice
