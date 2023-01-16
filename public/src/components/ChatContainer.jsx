import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import ChatInput from "./ChatInput";
import Logout from "./Logout";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { io } from "socket.io-client";
import { sendMessageRoute, recieveMessageRoute } from "../utils/APIRoutes";
import { BlobServiceClient, ContainerClient} from '@azure/storage-blob';
import ChatText from "./ChatText";
import ChatImage from "./ChatImage";
import ChatVideo from "./ChatVideo";
import ChatFile from "./ChatFile";
import './Chat.css';

const containerName = 'messages';
const sasToken = '?sv=2021-06-08&ss=bf&srt=co&sp=rwdlaciytfx&se=2023-01-17T02:13:47Z&st=2023-01-16T18:13:47Z&spr=https,http&sig=pf9iUWWJLBFuFzOgAHUFNA6gsW00Qmtu%2BWvM447MFUU%3D';
const storageAccountName = 'chatstorage123';

export default function ChatContainer({ currentChat, currentUserId }) {
  const [messages, setMessages] = useState([]);
  const scrollRef = useRef();
  const socket = useRef();
  const [arrivalMessage, setArrivalMessage] = useState(null);

  useEffect(async () => {
    const response = await axios.post(recieveMessageRoute, {
      chatId: currentChat.id,
    });
    setMessages(response.data);
  }, [currentChat]);

  useEffect(() => {
    const getCurrentChat = async () => {
      if (currentChat) {
        await JSON.parse(
          localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
        ).id;
      }
    };
    getCurrentChat();
  }, [currentChat]);

  const createBlobInContainer = async (containerClient, file, fileName) => {
  
    // create blobClient for container
    const blobClient = containerClient.getBlockBlobClient(fileName);
  
    // set mimetype as determined from browser with file upload control
    const options = { blobHTTPHeaders: { blobContentType: file.type } };
  
    // upload file
    await blobClient.uploadData(file, options);
  }

  const getBlobsInContainer = async (containerClient) => {
    const returnedBlobUrls = [];
  
    // get list of blobs in container
    // eslint-disable-next-line
    for await (const blob of containerClient.listBlobsFlat()) {
      // if image is public, just construct URL
      returnedBlobUrls.push(
        `https://${storageAccountName}.blob.core.windows.net/${containerName}/${blob.name}`
      );
    }
  
    return returnedBlobUrls;
  }

  const handleSendMsg = async (msg) => {
    const data = await JSON.parse(localStorage.getItem("chat-app-current-user"));
    const input = document.querySelector(".input-file");
    const file = input.files?.[0];
    const msgs = [...messages];

    if (file !== undefined) {

      const lengthSplited = file.name.split('.').length;
      const ext = file.name.split('.')[lengthSplited - 1];
      let type = '';

      const fileName = `${Date.now()}-${file.name}`;

      if (['jpg', 'jpeg', 'png', 'svg'].includes(ext)) {
        type = 'image';
      } else if (ext === 'mp4') {
        type = 'video';
      } else {
        type = 'file';
      }

      // get BlobService = notice `?` is pulled out of sasToken - if created in Azure portal
      const blobService = new BlobServiceClient(
        `https://${storageAccountName}.blob.core.windows.net/?${sasToken}`
      );

      // get Container - full public read access
      const containerClient = blobService.getContainerClient(containerName);
      // await containerClient.createIfNotExists({
      //   access: 'container',
      // });

      // upload file
      await createBlobInContainer(containerClient, file, fileName);

      // get list of blobs in container
      const list = await getBlobsInContainer(containerClient);
      console.log(list);

      socket.current.emit("sendmessage", {
        from: data._id,
        type,
        data: fileName
      });

      msgs.push({ sender_id: data._id, type, data: fileName });
    }

    if (msg !== '') {
      socket.current.emit("sendmessage", {
        from: data._id,
        type: 'text',
        data: msg
      });
  
      msgs.push({ sender_id: data._id, type: "text", data: msg });
    }

    setMessages(msgs);
  };

  useEffect(() => {
    socket.current = io("http://localhost:5000");
    socket.current.emit("adduser", currentUserId, currentChat.id);
    
    socket.current.on("updatechat", (message) => {
      console.log(message);
      if (currentUserId != message.sender_id) {
        setArrivalMessage({ sender_id: message.sender_id, type: message.type, data: message.data });
      }
    });

    setTimeout(() => {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 500)

    return () => {
      socket.current.disconnect();
    };    
  }, [currentChat]);

  useEffect(() => {
    arrivalMessage && setMessages((prev) => [...prev, arrivalMessage]);
  }, [arrivalMessage]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Container>
      <div className="chat-header">
        <div className="user-details">
          <div className="username">
            <h3>{currentChat.username}</h3>
          </div>
        </div>
        <Logout />
      </div>
      <div className="chat-messages">
        {messages.map((message, index) => {
          switch (message.type) {
            case "text":
              return <ChatText key={index} side={`${message.sender_id == currentUserId ? "sended" : "recieved"}`} data={message.data} />;
            case "image":
              return <ChatImage key={index} side={`${message.sender_id == currentUserId ? "sended" : "recieved"}`} data={message.data} />;
            case "video":
              return <ChatVideo key={index} side={`${message.sender_id == currentUserId ? "sended" : "recieved"}`} data={message.data} />;
            case "file":
              return <ChatFile key={index} side={`${message.sender_id == currentUserId ? "sended" : "recieved"}`} data={message.data} />;
          }
        })}
        <div ref={scrollRef}></div>
      </div>
      <ChatInput handleSendMsg={handleSendMsg} />
    </Container>
  );
}

const Container = styled.div`
  display: grid;
  grid-template-rows: 10% 80% 10%;
  gap: 0.1rem;
  overflow: hidden;
  @media screen and (min-width: 720px) and (max-width: 1080px) {
    grid-template-rows: 15% 70% 15%;
  }
  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 2rem;
    .user-details {
      display: flex;
      align-items: center;
      gap: 1rem;
      .avatar {
        img {
          height: 3rem;
        }
      }
      .username {
        h3 {
          color: white;
        }
      }
    }
  }
  .chat-messages {
    padding: 1rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow: auto;
    &::-webkit-scrollbar {
      width: 0.2rem;
      &-thumb {
        background-color: #ffffff39;
        width: 0.1rem;
        border-radius: 1rem;
      }
    }
    .message {
      display: flex;
      align-items: center;
      .content {
        max-width: 40%;
        overflow-wrap: break-word;
        padding: 1rem;
        font-size: 1.1rem;
        border-radius: 1rem;
        color: #d1d1d1;
        @media screen and (min-width: 720px) and (max-width: 1080px) {
          max-width: 70%;
        }
      }
    }
    .sended {
      justify-content: flex-end;
      .content {
        background-color: #4f04ff21;
      }
    }
    .recieved {
      justify-content: flex-start;
      .content {
        background-color: #9900ff20;
      }
    }
  }
`;
