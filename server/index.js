const express = require("express");
const cors = require("cors");
const app = express();
const socket = require("socket.io");
require("dotenv").config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const server = app.listen(process.env.PORT, () =>
  console.log(`Server started on ${process.env.PORT}`)
);
const io = socket(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

// AZURE
const { ServiceBusClient } = require("@azure/service-bus");
const connectionString = "Endpoint=sb://chat-app.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=4g/Ik8N+276O9qpiwN+IV+3f63cD1kLZNIxL953Az9E=";
const sbClient = new ServiceBusClient(connectionString);
const queueName = 'messages';
const sender = sbClient.createSender(queueName);
// AZURE

async function sendMessageToQueue(message) {
	try {
		const batch = await sender.createMessageBatch(); 
		batch.tryAddMessage(message);		
		await sender.sendMessages(batch);
		console.log(`Sent message to the queue: ${queueName}`);
	} catch (ex) {
    console.log(ex);
  }
}

const users = {};

io.on('connection', function (socket) {
    socket.on('adduser', function (userId, roomId) {
        socket.room = roomId;
        socket.join(socket.room);
        users[userId] = socket.id;
    });
    socket.on('sendmessage', async function (message) {
        const obj = {
          type: message.type,
          data: message.data,
          chat_id: socket.room,
          sender_id: message.from
        }
        const objString = JSON.stringify(obj);
        await sendMessageToQueue({ body: objString });
        io.in(socket.room).emit('updatechat', obj);
    });
    socket.on('disconnect', function (userId) {
        delete users[userId];
        socket.leave(socket.room);
    });
});