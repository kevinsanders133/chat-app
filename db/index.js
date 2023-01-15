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
const connectionString = "Endpoint=sb://chat-app.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=sQQZXdh0Gep0BDbs/qZ33KtfS3pHuwMckyRpJwCyams=";
const sbClient = new ServiceBusClient(connectionString);
const queueName = 'messages';
// AZURE

async function sendMessageToQueue(message) {
	const sender = sbClient.createSender(queueName);
	try {
		let batch = await sender.createMessageBatch(); 
		batch.tryAddMessage(message);		

		await sender.sendMessages(batch);

		console.log(`Sent message to the queue: ${queueName}`);

		await sender.close();
	} finally {
		await sbClient.close();
	}
}


const users = {};

io.on('connection', function (socket) {
    socket.on('adduser', function (userId, roomId) {
        socket.room = roomId;
        socket.join(socket.room);
        users[userId] = socket.id;
    });
    socket.on('sendmessage', async function (data) {
        console.log(data);

        await io.in(socket.room).emit('updatechat', data);
    });
    socket.on('disconnect', function (userId) {
        delete users[userId];
        socket.leave(socket.room);
    });
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

app.get('/api/auth/allusers', async (req, res) => {
  try {
    db.query(queries.selectAllChats, (err, result) => {
      if (err) throw err;
  
      res.json(result);
      return;
    });

  } catch (ex) {
    next(ex);
  }
});

app.post('/api/messages/getmsg', async (req, res) => {
  try {
    const { from, to } = req.body;

    // const messages = await Messages.find({
    //   users: {
    //     $all: [from, to],
    //   },
    // }).sort({ updatedAt: 1 });

    // const projectedMessages = messages.map((msg) => {
    //   return {
    //     fromSelf: msg.sender.toString() === from,
    //     message: msg.message.text,
    //   };
    // });
    // res.json(projectedMessages);
    res.json([]);
  } catch (ex) {
    next(ex);
  }
});

app.post('/api/messages/addmsg', async (req, res) => {
  try {
    const { from, to, message } = req.body;
    // const data = await Messages.create({
    //   message: { text: message },
    //   users: [from, to],
    //   sender: from,
    // });

    // if (data) return res.json({ msg: "Message added successfully." });
    if (true) return res.json({ msg: "Message added successfully." });
    else return res.json({ msg: "Failed to add message to the database" });
  } catch (ex) {
    next(ex);
  }
});