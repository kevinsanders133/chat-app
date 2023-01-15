const mysql = require('mysql');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'chatDB',
});

// host: 'mydemoserver.mysql.database.azure.com',
// user: 'myadmin@mydemoserver',
// password: 'your_password',
// database: 'quickstartdb',
// port: 3306,
// ssl: {ca: fs.readFileSync("your_path_to_ca_cert_file_BaltimoreCyberTrustRoot.crt.pem")}

db.connect((err) => {
    if (err) throw err;
    console.log("Connected!");
});

module.exports = { db };