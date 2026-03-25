const mysql = require('mysql2');

const pool = mysql.createPool({
    host: "mysql.railway.internal",
    user: "root",
    password: "mYGdiliiZCuSIApDbLtbjClsKYeAxQlF",
    database: "railway",
    port:"3306"
});

module.exports = pool;