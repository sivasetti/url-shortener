const {Pool} = require('pg');

const pool = new Pool({
    connectionString : 'postgres://shortener:shortener@localhost:5432/shortener',
    max : 20
});



module.exports = pool;