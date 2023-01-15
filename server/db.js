const mysql = require('mysql');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'chatDB',
});

db.connect((err) => {
    if (err) throw err;
    console.log("Connected!");
});

module.exports = { db };