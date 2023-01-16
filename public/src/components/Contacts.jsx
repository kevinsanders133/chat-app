import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Logo from "../assets/logo.svg";
import TeamSpeak from "../assets/TeamSpeak.png";
import axios from "axios";

export default function Contacts({ contacts, changeChat, updateChats }) {
  const [currentUserName, setCurrentUserName] = useState(undefined);
  const [currentSelected, setCurrentSelected] = useState(undefined);
  useEffect(async () => {
    const data = await JSON.parse(
      localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
    );
    setCurrentUserName(data.username);
  }, []);
  const changeCurrentChat = (index, contact) => {
    const password = document.querySelector(`#pass${contact.id}`).value;
    if (contact.password !== password) {
      return;
    }

    const chat = document.querySelector(`#chat${contact.id}`);
    chat.querySelector('input[name=chatPassword2]').style.display = 'none';
    chat.querySelector('input[name=chatPassword2]').value = '';
    chat.querySelector('.logintochat').style.display = 'none';
    chat.querySelector('.username').style.display = 'flex';

    setCurrentSelected(index);
    changeChat(contact);
  };
  const handleChatCreation = async (e) => {
    const title = document.querySelector('input[name=chatTitle]').value;
    const password = document.querySelector('input[name=chatPassword]').value;

    if (title !== '' && password !== '') {
      await axios.post('http://localhost:5001/api/chats/create', {
        title,
        password
      });
      document.querySelector('input[name=chatTitle]').value = '';
      document.querySelector('input[name=chatPassword]').value = '';
      updateChats();
    }
  };
  const loginIntoChat = (id, e) => {
    if (e.target.classList.contains('contact') || e.target.classList.contains('selected')) {
      const allInputs = document.querySelectorAll('input[name=chatPassword2]');
      const allButtons = document.querySelectorAll('.logintochat');
      const allNames = document.querySelectorAll('.chatTitle2');
      allInputs.forEach(input => {
        input.style.display = 'none';
        input.value = '';
      });
      allButtons.forEach(button => button.style.display = 'none');
      allNames.forEach(name => name.style.display = 'flex');
    }
    if (!e.target.classList.contains('contact') || e.target.classList.contains('selected')) {
      return;
    }

    const chat = document.querySelector(`#chat${id}`);
    chat.querySelector('.username').style.display = 'none';
    chat.querySelector('input[name=chatPassword2]').style.display = 'flex';
    chat.querySelector('.logintochat').style.display = 'flex';
  }
  return (
    <>
      {true && (
        <Container>
          <div className="brand">
            <img src={TeamSpeak} alt="logo" className="logo" />
            <h3>team.chat</h3>
          </div>
          <div className="create-chat-container">
            <input type="text" name="chatTitle" placeholder="Title" />
            <input type="password" name="chatPassword" placeholder="Password" />
            <button onClick={handleChatCreation}>Create chat</button>
          </div>
          <div className="contacts">
            {contacts.map((contact, index) => {
              return (
                <div
                  key={contact.id}
                  id={`chat${contact.id}`}
                  className={`contact ${
                    contact.id === currentSelected ? "selected" : ""
                  }`}
                  onClick={(e) => loginIntoChat(contact.id, e)}
                >
                  <div className="avatar">
                    {/* <img
                      // src={`data:image/svg+xml;base64,${contact.avatarImage}`}
                      alt=""
                    /> */}
                  </div>
                  <div className="username chatTitle2">
                    <h3>{contact.title}</h3>
                  </div>
                  <input type="password" name="chatPassword2" id={`pass${contact.id}`} placeholder="Password" style={{display: "none"}} />
                  <button onClick={() => changeCurrentChat(contact.id, contact)} className="logintochat" style={{display: "none"}} >Login</button>
                </div>
              );
            })}
          </div>
          <div className="current-user">
            {/* <div className="avatar">
              <img
                src={`data:image/svg+xml;base64,${currentUserImage}`}
                alt="avatar"
              />
            </div> */}
            <div className="username">
              <h2>{currentUserName}</h2>
            </div>
          </div>
        </Container>
      )}
    </>
  );
}
const Container = styled.div`
  display: grid;
  grid-template-rows: 10% 5% 70% 15%;
  overflow: hidden;
  background-color: #080420;
  .logo {
    border-radius: 50%;
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 1rem;
    justify-content: center;
    img {
      height: 2rem;
    }
    h3 {
      color: white;
      text-transform: uppercase;
    }
  }
  .create-chat-container {
    display: flex;
    justify-content: space-between;
    width: 90%;
    margin: 0 auto;
  }
  input {
    background-color: transparent;
    padding: 5px;
    border: 0.1rem solid #4e0eff;
    border-radius: 0.4rem;
    color: white;
    width: 32%;
    font-size: 14px;
    &:focus {
      border: 0.1rem solid #997af0;
      outline: none;
    }
  }
  button {
    background-color: #4e0eff;
    color: white;
    padding: 5px;
    border: none;
    font-weight: bold;
    cursor: pointer;
    border-radius: 0.4rem;
    font-size: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-transform: uppercase;
    &:hover {
      background-color: #4e0eff;
    }
  }
  .contacts {
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow: auto;
    padding-top: 20px;
    gap: 0.8rem;
    &::-webkit-scrollbar {
      width: 0.2rem;
      &-thumb {
        background-color: #ffffff39;
        width: 0.1rem;
        border-radius: 1rem;
      }
    }
    .contact {
      background-color: #ffffff34;
      min-height: 5rem;
      cursor: pointer;
      width: 90%;
      border-radius: 0.2rem;
      padding: 0.4rem;
      display: flex;
      gap: 1rem;
      align-items: center;
      transition: 0.5s ease-in-out;
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
    .selected {
      background-color: #9a86f3;
    }
  }

  .current-user {
    background-color: #0d0d30;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 2rem;
    .avatar {
      img {
        height: 4rem;
        max-inline-size: 100%;
      }
    }
    .username {
      h2 {
        color: white;
      }
    }
    @media screen and (min-width: 720px) and (max-width: 1080px) {
      gap: 0.5rem;
      .username {
        h2 {
          font-size: 1rem;
        }
      }
    }
  }
`;
