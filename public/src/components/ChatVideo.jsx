import React, { memo } from 'react';

const storageAPI = 'https://chatstorage123.blob.core.windows.net/messages/';

const ChatVideo = memo(({ side, data }) => {

    const setVolumeTo50Percent = (e) => {
        const video = e.target;
        video.volume = 0.3;
    }

    return (
        <div className={`chat__${side}-message message no-padding`}>
            <video className="chat__video" onLoadStart={setVolumeTo50Percent} controls>
                <source src={`${storageAPI}${data}`} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
        </div>
    )
})

export default ChatVideo;