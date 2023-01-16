// const mysql = require('mysql');

// const db = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: '',
//     database: 'chatDB',
// });

// const db = mysql.createConnection({
//     user: 'kevinsanders', // better stored in an app setting such as process.env.DB_USER
//     password: 'Skripka22.', // better stored in an app setting such as process.env.DB_PASSWORD
//     host: 'databaseserver1212112.database.windows.net', // better stored in an app setting such as process.env.DB_SERVER
//     port: 1433, // optional, defaults to 1433, better stored in an app setting such as process.env.DB_PORT
//     database: 'chat-app', // better stored in an app setting such as process.env.DB_NAME
//     options: {
//         encrypt: true
//     }
// });

// db.connect((err) => {
//     if (err) throw err;
//     console.log("Connected!");
// });

const { Connection } = require("tedious");

const { queries } = require("./queries");

const TYPES = require('tedious').TYPES;

// Create connection to database
const config = {
    authentication: {
        options: {
            userName: "kevinsanders", // update me
            password: "Skripka22." // update me
        },
        type: "default"
        },
        server: "databaseserver1212112.database.windows.net", // update me
        options: {
        database: "chat-app", //update me
        encrypt: true
    }
};

const db = new Connection(config);

db.connect(err => {
    if (err) {
        console.error(err);
    } else {
        console.log("DB connected");
    }
});

module.exports = { db };