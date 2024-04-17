const {createPool} = require('mysql2')

const pool = createPool({
    port : "3306",
    host: "localhost",
    user: "root",
    password: "G@123456789",
    database: "bus_tickets",
    connectionLimit: 10
})


module.exports = pool