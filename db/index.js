const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();

const { db } = require('./db');
const { queries } = require('./queries');
const { Request } = require("tedious");
const TYPES = require('tedious').TYPES;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.listen(process.env.PORT, () =>
  console.log(`Server started on ${process.env.PORT}`)
);

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

// AZURE BUS
const { ServiceBusClient } = require("@azure/service-bus");
const connectionString = "Endpoint=sb://chat-app.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=4g/Ik8N+276O9qpiwN+IV+3f63cD1kLZNIxL953Az9E=";
const sbClient = new ServiceBusClient(connectionString);
const queueName = 'messages';
// AZURE BUS

// createReceiver() can also be used to create a receiver for a subscription.
const receiver = sbClient.createReceiver(queueName);

// function to handle messages
const myMessageHandler = async (messageReceived) => {
  const message = await JSON.parse(messageReceived.body);

  try {
    const requestInsertMessage = new Request(queries.insertMessage, function (err, _) {
      if (err) throw err;
    });
    const id = getRandomInt(1000000);
    requestInsertMessage.addParameter('id', TYPES.Int, id);
    requestInsertMessage.addParameter('type', TYPES.VarChar, message.type);
    requestInsertMessage.addParameter('data', TYPES.VarChar, message.data);
    requestInsertMessage.addParameter('chat_id', TYPES.Int, message.chat_id);
    requestInsertMessage.addParameter('sender_id', TYPES.Int, message.sender_id);
    requestInsertMessage.addParameter('date', TYPES.DateTime, new Date());
    db.execSql(requestInsertMessage);
  } catch (ex) {
    console.log(ex);
  }
};

// function to handle any errors
const myErrorHandler = async (error) => {
  console.log(error);
};

// subscribe and specify the message and error handlers
receiver.subscribe({
  processMessage: myMessageHandler,
  processError: myErrorHandler
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    let responseObj;

    const results = [];
    const requestcheckIfUserExists = new Request(queries.checkIfUserExists, function (err, _) {
      if (err) throw err;

      if (results.length === 0) {
        responseObj = { status: false };
        return;
      }

      if (password === results[0].password) {
        responseObj = { status: true, user: { username: results[0].nickname, _id: results[0].id } };
      } else {
        responseObj = { status: false };
      }

      res.send(responseObj);
    });
    requestcheckIfUserExists.addParameter('email', TYPES.VarChar, email);
    requestcheckIfUserExists.on('row', function (columns) {
      const obj = {};
      columns.forEach(function(column) {
        obj[column.metadata.colName] = column.value;
      });
      results.push(obj);
    })  
    db.execSql(requestcheckIfUserExists);
  } catch (ex) {
    console.log(ex);
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const results = [];
    const requestcheckIfUserExists = new Request(queries.checkIfUserExists, function (err, _) {
      if (err) throw err;

      if (results.length > 0) {
        res.json({ status: false });
        return;
      }

      const requestInsertUser = new Request(queries.insertNewUser, function (err, _) {
        if (err) throw err;

        res.json({ status: false });
        return;
      });

      const id = getRandomInt(1000000);

      requestInsertUser.addParameter('id', TYPES.Int, id);
      requestInsertUser.addParameter('nickname', TYPES.VarChar, username);
      requestInsertUser.addParameter('email', TYPES.VarChar, email);
      requestInsertUser.addParameter('password', TYPES.VarChar, password);
      db.execSql(requestInsertUser);
    });
    requestcheckIfUserExists.addParameter('email', TYPES.VarChar, email);
    requestcheckIfUserExists.on('row', function (columns) {
      const obj = {};
      columns.forEach(function(column) {
        obj[column.metadata.colName] = column.value;
      });
      results.push(obj);
    })  
    db.execSql(requestcheckIfUserExists);
  } catch (ex) {
    console.log(ex);
  }
});

app.get('/api/auth/allusers', async (_, res) => {
  try {
    const results = [];
    const requestSelectAllChats = new Request(queries.selectAllChats, function (err, _) {
      if (err) throw err;

      res.json(results);
      return;
    });
    requestSelectAllChats.on('row', function (columns) {
      const obj = {};
      columns.forEach(function(column) {
        obj[column.metadata.colName] = column.value;
      });
      results.push(obj);
    }) 
    db.execSql(requestSelectAllChats);
  } catch (ex) {
    console.log(ex);
  }
});

app.post('/api/messages/getmsg', async (req, res) => {
  const { chatId } = req.body;
  try {
    const results = [];
    const requestSelectHistory = new Request(queries.getChatHistory, function (err, _) {
      if (err) throw err;
      res.json(results);
      return;
    });
    requestSelectHistory.addParameter('chatId', TYPES.Int, chatId);
    requestSelectHistory.on('row', function (columns) {
      const obj = {};
      columns.forEach(function(column) {
        obj[column.metadata.colName] = column.value;
      });
      results.push(obj);
    }) 
    db.execSql(requestSelectHistory);
  } catch (ex) {
    console.log(ex);
  }
});

app.post('/api/chats/create', async (req, res) => {
  const { title, password } = req.body;

  const requestInsertChat = new Request(queries.insertNewChat, function (err, _) {
    if (err) throw err;
    res.sendStatus(200);
  });

  const id = getRandomInt(1000000);

  requestInsertChat.addParameter('id', TYPES.Int, id);
  requestInsertChat.addParameter('title', TYPES.VarChar, title);
  requestInsertChat.addParameter('password', TYPES.VarChar, password);
  db.execSql(requestInsertChat);
})