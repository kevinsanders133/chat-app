const queries = {
    checkIfUserExists: `
        SELECT COUNT(*) as count, password, nickname, id
        FROM users 
        WHERE email = ?
    `,
    insertNewUser: `
        INSERT INTO users (nickname, email, password)
        VALUES (?, ?, ?)
    `,
    selectAllUser: `
        SELECT * FROM users;
    `,
    selectAllChats: `
        SELECT * FROM chats;
    `,
    insertMessage: `
        INSERT INTO messages (type, data, chat_id, sernder_id)
        VALUES (?, ?, ?, ?)
    `
}

module.exports = { queries };