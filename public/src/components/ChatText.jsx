import React, { memo } from 'react';

const ChatText = memo(({ side, data }) => {

    return (
        <div className={`chat__${side}-message message`}>
            {data}
        </div>
    );
})

export default ChatText;