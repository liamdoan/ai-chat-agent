import React from 'react'
import "./ConfirmDeletePopup.css"

interface ConfirmDeletePopupProps {
    chatTitle: string;
    handleConfirmDeleteThread: () => void;
    handleCancelDeleteThread: () => void;
}

const ConfirmDeletePopup: React.FC<ConfirmDeletePopupProps> = ({ chatTitle, handleConfirmDeleteThread, handleCancelDeleteThread }) => {
    const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        handleConfirmDeleteThread();
    }

    const handleCancel = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        handleCancelDeleteThread();
    }
    
    const handleClickOutside = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        handleCancelDeleteThread();
    }

    return (
        <div className='confirm-delete-popup-wrapper' onClick={handleClickOutside}>
            <div
                className='confirm-delete-popup-container'
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                }}
            >
                <p className='confirm-delete-popup-title'>
                    Delete Chat?
                </p>
                <div className='confirm-delete-popup-content'>
                    <p>
                        This will delete
                        {' '}<span className='delete-title'>{chatTitle}</span>{'.'}
                    </p>
                    <p><span className='delete-description'>This action cannot be undone.</span></p>
                    <div className='confirm-delete-popup-buttons'>
                        <button
                            className='cancel-button'
                            onClick={handleCancel}
                        >
                            Cancel
                        </button>
                        <button
                            className='delete-button'
                            onClick={handleDelete}
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ConfirmDeletePopup
