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
}

module.exports = { queries };