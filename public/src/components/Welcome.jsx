import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Robot from "../assets/robot.gif";
import TeamSpeak from "../assets/TeamSpeak.png";

export default function Welcome() {
  const [userName, setUserName] = useState("");
  useEffect(async () => {
    setUserName(
      await JSON.parse(
        localStorage.getItem("chat-app-current-user")
      ).username
    );
  }, []);
  return (
    <Container>
      <img src={TeamSpeak} alt="" className="welcome-logo" />
      <h1>
        Welcome, <span>{userName}!</span>
      </h1>
      <h3>Please select a chat to Start messaging.</h3>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  flex-direction: column;
  .welcome-logo {
    width: 100px;
    height: 100px;
    margin-bottom: 30px;
    border-radius: 50%;
  }
  img {
    height: 20rem;
  }
  span {
    color: #4e0eff;
  }
`;
