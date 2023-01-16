const queries = {
    checkIfUserExists: `
        SELECT COUNT(*) as count, password, nickname, id
        FROM users 
        WHERE email = @email
        GROUP BY password, nickname, id
    `,
    insertNewUser: `
        INSERT INTO users (id, nickname, email, password)
        VALUES (@id, @nickname, @email, @password)
    `,
    selectAllUser: `
        SELECT * FROM users
        WHERE email = @email;
    `,
    selectAllChats: `
        SELECT * FROM chats;
    `,
    insertMessage: `
        INSERT INTO messages (id, type, data, chat_id, sender_id, date)
        VALUES (@id, @type, @data, @chat_id, @sender_id, @date)
    `,
    getChatHistory: `
        SELECT * FROM messages WHERE chat_id = @chatId ORDER BY date ASC
    `,
    insertNewChat: `
        INSERT INTO chats (id, title, password)
        VALUES (@id, @title, @password)
    `,
}

module.exports = { queries };