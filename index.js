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

// EndPoint Obtener info de un usuario
app.get('/user/:id', (req, res) => {
    let gID = req.params.id;
    let query = `select * from user where id = ${gID}`;
    db.query(query,(err,result) =>{
        if(err){
            console.log(err,'errs');
        }
        if(result.length>0){
            res.send({
                message:'1 User data',
                data: result
            })
        }
        else{
            res.send({
                message: 'Data not found'
            })
        }
    })
}) 

//EndPoint Para modificar perfil
app.put('/user/:id', (req,res) => {
    console.log(req.body, 'updatedata');
    
    let gID = req.params.id;

    let birthdate = req.body.birthdate;
    let description = req.body.description;
    let zodiac = req.body.zodiac_sign;
    let username = req.body.username;
    let email = req.body.email;
    let password = req.body.password;

    let query = `update user set birthdate = '${birthdate}', description = '${description}',
                    zodiac_sign = '${zodiac}', username = '${username}', email = '${email}', password = '${password}'
                    where id = ${gID}`;

    db.query(query, (err, result) =>{
        if(err){
            console.log(err);
        }
        res.send({
            message:'data updated'
        })
    })
})

app.listen(3000, () =>{
    console.log('server runningg...');
})