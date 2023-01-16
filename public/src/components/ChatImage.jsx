import React, { memo } from 'react';

const storageAPI = 'https://chatstorage123.blob.core.windows.net/messages/';

const ChatImage = memo(({ side, data }) => {

    return (
        <div className={`chat__${side}-message message`}>
            <img
                src={`${storageAPI}${data}`}
                className="chat__image"
                alt=""
            />
        </div>
    )
})

export default ChatImage;