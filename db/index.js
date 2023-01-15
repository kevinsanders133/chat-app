const express = require("express");
const cors = require("cors");
const app = express();
const socket = require("socket.io");
require("dotenv").config();

const { db } = require('./db');
const { queries } = require('./queries');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.listen(process.env.PORT, () =>
  console.log(`Server started on ${process.env.PORT}`)
);

// AZURE BLOB
// connect-with-account-name-and-key.js
const { BlobServiceClient } = require('@azure/storage-blob');

const blobServiceClient = new BlobServiceClient("https://chatstorage123.blob.core.windows.net/?sv=2021-06-08&ss=bf&srt=co&sp=rwdlaciytfx&se=2023-01-16T05:31:14Z&st=2023-01-15T21:31:14Z&spr=https,http&sig=vuyvK3I2V8yMr7rAUIDWfBWHBIvEd8z6KZ%2B%2F3iSfv6w%3D");
const containerName = 'chat';
const containerClient = blobServiceClient.getContainerClient(containerName);

async function uploadFile(blobName) {
  const timestamp = Date.now();
  // const fileName = `my-new-file-${timestamp}.txt`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  await blockBlobClient.uploadFile(blobName);
}
// AZURE BLOB


// AZURE BUS
const { ServiceBusClient } = require("@azure/service-bus");
const connectionString = "Endpoint=sb://chat-app.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=sQQZXdh0Gep0BDbs/qZ33KtfS3pHuwMckyRpJwCyams=";
const sbClient = new ServiceBusClient(connectionString);
const queueName = 'messages';
// AZURE BUS

// createReceiver() can also be used to create a receiver for a subscription.
const receiver = sbClient.createReceiver(queueName);

// function to handle messages
const myMessageHandler = async (messageReceived) => {
  const message = await JSON.parse(messageReceived.body);

  console.log(message);

  try {
    if (message.text !== '') {
      // db.query(queries.insertMessage, [message.text, message.chat_id, message.sernder_id]);
    }
    if (message.data.type) {
      switch(message.data.type) {
        case "image":
          console.log(message.data.blob);
          await axios.put('https://myaccount.blob.core.windows.net/mycontainer/myblob', );
          // db.query(queries.insertMessage, [message.data.text, message.chat_id, message.sernder_id]);
          break;
        case "video":
          // db.query(queries.insertMessage, [message.data.text, message.chat_id, message.sernder_id]);
          break;
        case "file":
          // db.query(queries.insertMessage, [message.data.text, message.chat_id, message.sernder_id]);
      }
    }
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
    db.query(queries.checkIfUserExists, [email], (err, result) => {
      if (err) throw err;

      console.log(result);

      if (result[0].count === 0) {
        responseObj = { status: false };
        return;
      }

      if (password === result[0].password) {
        responseObj = { status: true, user: { username: result[0].nickname, _id: result[0].id } };
      } else {
        responseObj = { status: false };
      }

      res.send(responseObj);
    });
  } catch (ex) {
    console.log(ex);
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    console.log(username, email, password);
    
    db.query(queries.checkIfUserExists, [email], (err, result) => {
      if (err) throw err;

      if (result[0].count > 0) {
        res.json({ status: false });
        return;
      }

      db.query(queries.insertNewUser, [username, email, password], (err, _) => {
        if (err) throw err;
  
        res.json({ status: false });
        return;
      });
    });
  } catch (ex) {
    console.log(ex);
  }
});

app.get('/api/auth/allusers', async (_, res) => {
  try {
    db.query(queries.selectAllChats, (err, result) => {
      if (err) throw err;

      res.json(result);
    });
  } catch (ex) {
    console.log(ex);
  }
});