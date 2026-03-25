const mysql = require('mysql2');

const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "instrumentos_db"
});

module.exports = pool;