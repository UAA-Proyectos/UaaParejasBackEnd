// 1 - Invocamos a Express
const express = require('express');
const app = express();

app.all('/*', function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	next();
});

const multer = require('multer');
const path = require('path');

//2 - Para poder capturar los datos del formulario (sin urlencoded nos devuelve "undefined")
app.use(express.urlencoded({ extended: false }));
app.use(express.json());//además le decimos a express que vamos a usar json

//3- Invocamos a dotenv
const dotenv = require('dotenv');
dotenv.config({ path: './env/.env' });

//4 -seteamos el directorio de assets
app.use('/resources', express.static('public'));
app.use('/resources', express.static(__dirname + '/public'));

//5 - Establecemos el motor de plantillas
app.set('view engine', 'ejs');
  
//6 -Invocamos a bcrypt
const bcrypt = require('bcryptjs');

//7- variables de session
const session = require('express-session');
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));


// 8 - Invocamos a la conexion de la DB
const connection = require('./database/db');

//9 - establecemos las rutas
app.get('/login', (req, res) => {
	res.render('login');
});

app.get('/register', (req, res) => {
	res.render('register');
})

//10 - Método para la REGISTRACIÓN
app.post('/register', async (req, res) => {
	const user = req.body.user;
    const pass = req.body.pass;
	const date = req.body.date;
	const email = req.body.email;
	let passwordHash = await bcrypt.hash(pass, 8);
	
    connection.query('INSERT INTO user SET ?', { username: user, birthdate: date, email: email, password: passwordHash }, async (error, results) => {
		if (error) {
			console.log(error);
			if (error.code = "ER_DUP_ENTRY") {
				res.status(409)
				res.send();
			}
			else {
				res.status(500)
				res.send()
			}
		} else {
			res.status(201)
			res.send()
		}
	});
})



//11 - Metodo para la autenticacion
app.post('/auth', async (req, res) => {
	const user = req.body.email;
	const pass = req.body.password;
	if (user && pass) {
		let passwordHash = await bcrypt.hash(pass, 8);
		connection.query(`SELECT * FROM user WHERE email = '${user}'`, async (error, results, fields) => {
        
        if (error) {
            console.log(error, 'errs');
        }
        console.log(passwordHash);
    
        if (results.length > 0) {
            const match = await bcrypt.compare(pass, results[0].password)
            //creamos una var de session y le asignamos true si INICIO SESSION   
            req.session.loggedin = true;                
            req.session.username = results[0].username;
            if (match) {
                res.send({
                    id: results[0].id
                })
            }
            else {
                res.status(401);
                res.send({
                    message: 'Data not found'
                })
            }
        } else {
            res.status(404);
            res.send({
                message: 'Data not found'
            })
        }
        res.end();
    });
			
	} else {	
		res.send('Please enter user and Password!');
		res.end();
	}
});

//12 - Método para controlar que está auth en todas las páginas
app.get('/', (req, res) => {
	if (req.session.loggedin) {
		res.render('index', {
			login: true,
            name: req.session.username
		});
	} else {	
		res.render('index', {
			login: false,
			name: 'Debe iniciar sesión',
		});
	}
	res.end();
});


//función para limpiar la caché luego del logout
app.use(function (req, res, next) {
	if (!req.user)
		res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
	next();
});

 //Logout
//Destruye la sesión.
app.get('/logout', function (req, res) {
	req.session.destroy(() => {
        res.status(200);
        
        res.redirect('/') // siempre se ejecutará después de que se destruya la sesión
	})
});

// const express = require('express');
const bodyparser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');
const { ok } = require('assert');

// const app = express();

app.use(cors());
app.use(bodyparser.json());


// EndPoint Obtener info de un usuario
app.get('/user/:id', (req, res) => {
    let gID = req.params.id;
    let query = `select u.birthdate, u.created_at, u.description, u.zodiac_sign, u.username, u.email from user u inner join user_interest i on (u.id = i.id_user && u.id = ${gID}) inner join interest ine on ine.id = i.category_id`;
    connection.query(query,(err,user) =>{
        if(err){
            console.log(err,'errs');
        }
        if(user.length>0){
            query = `select name from interest inner join user_interest on interest.id = user_interest.id_interest AND user_interest.id_user =${gID}`;
           connection.query(query, (err,interest) => {
            if(interest.length>0){
                res.status(200).send({status: "ok", message: "1 User data", data: {user,interest}});
            }
           }) 
           
        }
        else{
            res.status(400).send('Data not found');
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
   
    let query = `update user set birthdate = '${birthdate}', description = '${description}',
                    zodiac_sign = '${zodiac}', username = '${username}', email = '${email}' where id = ${gID}`;

    connection.query(query, (err, result) =>{
        if(err){
            console.log(err);
        }
        res.status(201).send({
            message:'data updated'
        })
    })
})

//Cambio de contraseña

app.post('/changepassw', async (req, res) => {
    console.log('Edit contraseña');
    
    let email = req.body.email;
    let oldPassword = req.body.oldPassword;
    let newPassword = req.body.newPassword;
    
    console.log(email, oldPassword, newPassword)
    
    connection.query(`SELECT password FROM user WHERE email = ${email}`, async (error, results, fields) => {
        const match = await bcrypt.compare(oldPassword,results[0].password);
        if(match){
            let query = `update user set password = '${newPassword}' where email = ${email}`;
            connection.query(query, (err, result) => {
                if(err){
                    console.log(err);
                }
                res.status(201).send({status: "ok", message: "data updated"});
            });
        }
        else{
            res.status(400).send('Error contraseña');
        }
    });
        
})

//Ruta donde almacenamos las imagenes

app.use('/uploads', express.static(path.join(__dirname,'uploads')));
const storage = multer.diskStorage({
	destination:(req,file,callback) =>{
		callback(null, 'uploads')
	},
	filename: (req, file, callback) =>{
		callback(null, file.originalname)
	}
});

const upload = multer({
	storage: storage
});


app.get("/upload/:id", (req, res) => {
    connection.query(`select path from photo where id_user = ${id}`, (err, rows, fields) => {
        if(!err)
            res.json(rows);
        else
            console.log(err);
    })
})

//Recibir las imagenes
app.post('/file',upload.single('file'),(req,res,next) => {
	const file = req.file;

    const filesImg = {

        id: null,
        nombre: file.filename,
        path: file.path,
        
    }

    if (!file) {
        const error = new Error('No File')
        error.httpStatusCode = 400;
        return next(error)
	}

    res.send(file);
    console.log(filesImg);

    connection.query('INSERT INTO photo set ?', [filesImg], (err, result)=>{
        if(result.length>0){
            res.status(200).send({status: "ok", message: "1 User data", data: result});
        }
    });
})

// Recibe el Id del usuario actual y asi como un status (like, block, etc) para mostrar todos los usuarios con los que tiene ese status 
app.get('/matches/:id',(req, res) => {
    let gID = req.params.id;
    let status = req.body.status;
    console.log(req.body.status);
    
    let query = `select user.username, interaction.status from user inner join interaction on (user.id = interaction.id_user2 and interaction.id_user1= ${gID}) and (interaction.status = "${status}") `;
    connection.query(query,(err,users) =>{
        if(err){
            console.log(err,'errs');
        }
        if(users.length>0){
                res.status(200).send({status: "ok", message: "Matches found", data: users});
           
        }
        else{
            res.status(400).send('Data not found');
        }
    })

});

//Mostrar lista de orientacion sexual
app.get('/orientations',(req, res) => {    
    let query = `select name from sexual_orientation`;
    connection.query(query,(err,orientations) =>{
        if(err){
            console.log(err,'errs');
        }
        if(orientations.length>0){
                res.status(200).send({status: "ok", message: "Sexual orientations", data: orientations});
           
        }
        else{
            res.status(400).send('Data not found');
        }
    })

});

//Recibe el id del usuario 2 y el nuevo status y actualiza la tabla status

app.put('/changeinteraction/:id', (req,res) => {
    
    console.log(req.body, 'updatedata');
    
    let gID = req.params.id;

    let user2 = req.body.user2; 
    let newStatus = req.body.newStatus;
   
    let query = `update interaction set status = '${newStatus}' where id_user1 = ${gID} and id_user2 = ${user2}`;

    connection.query(query, (err, result) =>{
        if(err){
            console.log(err);
        }
        res.status(201).send({
            message:'data updated'
        })
    })
})

//recibir la lista de gustos/preferencias/intereses
app.get('/preferenceslist',(req,res)=>{
    let cuery='select name from interest';
    
    connection.query(cuery,(err,interest)=>{
        if(err){
            res.status(404).send('Error papito');
        }
        let query = `select name from sexual_orientation`;
        connection.query(query,(err,orientationn)=>{
            if(err){
                res.status(404).send('Error papito');
            }else{
                res.status(200).send({status:"ok",message:"list",data:{interest,orientationn}});
            }
        })
        
    })

})
//reporte #1
app.get('/reportone',(req, res) => {

    let query = `select count(*) FROM user where deleted != 1 `;
    connection.query(query, (err, result) =>{
        if(err){
            res.status(404).send('Error papito');
        }else{
        res.status(201).send({status:"ok",message:"reportone",data:{result}});
        }
    })

});

//reporte #3
app.get('/reportthree',(req, res) => {

    let query = `select id_sexual_orientation, (count(id_sexual_orientation)/(select count() from user))100 as porcentaje from user GROUP BY id_sexual_orientation `;
    connection.query(query, (err, result) =>{
        if(err){
            res.status(404).send('Error papito');
        }else{
            res.status(201).send({status:"ok",message:"reportthree",data:{result}});
        }
        
    })

});

//reporte #6
app.get('/reportsix',(req, res) => {

    let query = `select gender, (count(gender)/(select count() from user))100 as cantidad FROM user GROUP BY gender `;
    connection.query(query, (err, result) =>{
        if(err){
            console.log(err);
        }else{
            res.status(201).send({status:"ok",message:"reportsix",data:{result}});
        }
        
    })

});

//reporte #7
app.get('/reportseven',(req, res) => {

    let query = `select count(*) from mydb.match `;
    connection.query(query, (err, result) =>{
        if(err){
            console.log(err);
        }else{
            res.status(201).send({status:"ok",message:"reportseven",data:{result}});
        }
        
    })

});

//reporte #8
app.get('/reporteight',(req, res) => {

    let query = `select u.id, u.username, i.id_user1, count() as cou from user u INNER JOIN interaction i on u.id= i.id_user1 GROUP BY i.id_user1 HAVING COUNT()>0 ORDER BY cou DESC limit 25 `;
    connection.query(query, (err, result) =>{
        if(err){
            console.log(err);
        }else{
            res.status(201).send({status:"ok",message:"reporteight",data:{result}});
        }
        
    })

});

//reporte #9
app.get('/reportnine',(req, res) => {

    let query = ` SELECT u.id, u.username, count() as cou FROM user u INNER JOIN interaction i on u.id= i.id_user1 inner join mydb.match m on i.idInteraction = m.idInteraction GROUP BY i.id_user1 HAVING COUNT()>0 ORDER BY cou DESC limit 25`;
    connection.query(query, (err, result) =>{
        if(err){
            console.log(err);
        }else{
            res.status(201).send({status:"ok",message:"reportnine",data:{result}});
        }
        
    })

});

//reporte edad
app.get('/reportedad',(req, res) => {

    let query = `select avg( Year(now()) - Year(birthdate) ) from user`;
    connection.query(query, (err, result) =>{
        if(err){
            console.log(err);
        }else{
            res.status(201).send({status:"ok",message:"reportedad",data:{result}});
        }
        
    })

});

//reporte signo
app.get('/reportsigno',(req, res) => {

    let query = `SELECT zodiac_sign, (count(zodiac_sign)/(select count() from user))100 as cantidad FROM user GROUP BY zodiac_sign`;
    connection.query(query, (err, result) =>{
        if(err){
            console.log(err);
        }else{
            res.status(201).send({status:"ok",message:"reportsigno",data:{result}});
        }
        
    })

});

//reporte Estados
app.get('/reportestados',(req, res) => {

    let query = `SELECT location, (count(location)/(select count() from user))100 as cantidad FROM user GROUP BY location having COUNT(*) >0 ORDER BY cantidad DESC limit 25`;
    connection.query(query, (err, result) =>{
        if(err){
            console.log(err);
        }else{
            res.status(201).send({status:"ok",message:"reportestados",data:{result}});
        }
        
    })

});

app.listen(3000, (req, res)=>{
    console.log('SERVER RUNNING IN http://localhost:3000');
});
