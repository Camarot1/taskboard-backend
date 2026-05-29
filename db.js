const mysql = require('mysql2')

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'taskboard'
})

module.exports = pool.promise()