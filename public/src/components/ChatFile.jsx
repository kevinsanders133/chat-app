import React, { memo, useEffect, useState } from 'react';

const storageAPI = 'https://chatstorage123.blob.core.windows.net/messages/';

const ChatFile = memo(({ side, data }) => {

    return (
        <div className={`chat__${side}-message message`}>
            <div className="chat__file-image-container">
                <div className="chat__file-image"></div>
            </div>
            <div className="chat__file-info">
                <div className="chat__file-name">
                    {data}
                </div>
            </div>
        </div>
    )
})

export default ChatFile;