//Database
const mysql = require('mysql');
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    charset : 'utf8mb4',
    database: process.env.DB_DATABASE,
    port: 3306
    
});

//Check database connection

connection.connect(err => {
    if(err){
        console.log('error:' + err);
    }else console.log('database connected..');
});


module.exports = connection;