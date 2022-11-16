const express = require('express');
const bodyparser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();

app.use(cors());
app.use(bodyparser.json());

//Database

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'mydb',
    port: 3306
});

//Check database connection

db.connect(err => {
    if(err)console.log(err,'err')
    else console.log('database connected..');
})

app.listen(3000, () =>{
    console.log('server runningg...');
})