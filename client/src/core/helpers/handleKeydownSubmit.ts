interface HandleKeyDownProps {
    onEnter: () => void,
    onShiftEnter?: () => void,
    onEscape?: () => void
}

export const handleKeyDownSubmit = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
    {onEnter, onShiftEnter, onEscape}: HandleKeyDownProps
) => {
    if (e.key === 'Enter') {
        e.preventDefault();

        if(e.shiftKey && onShiftEnter) {
            onShiftEnter?.();
        } else {
            onEnter?.()
        }
    } else if (e.key === 'Escape') {
        onEscape?.()
    }
};
