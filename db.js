const mysql = require('mysql2');

const pool = mysql.createPool({
    host: "crossover.proxy.rlwy.net",
    user: "root",
    password: "mYGdiliiZCuSIApDbLtbjClsKYeAxQlF",
    database: "railway",
    port:"3306"
    ssl: {
    rejectUnauthorized:false
}
});

module.exports = pool;
