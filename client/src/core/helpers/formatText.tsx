export const formatText = (text: string) => {
    return text.split("\n").map((item, index) => (
        <span key={index}>
            {item}
            <br />
        </span>
    ));
};

// format text in textarea so that submitted messages 
// appear similarly as written in textarea