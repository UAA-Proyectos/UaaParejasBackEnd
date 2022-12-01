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
        if(result.length>0){
            query = `select name from interest inner join user_interest on interest.id = user_interest.id_interest AND user_interest.id_user =${gID}`;
           connection.query(query, (err,interest) => {
            if(result.length>0){
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

    mysqlConnection.query('INSERT INTO photo set ?', [filesImg]);
    console.log('insertada')
})



app.listen(3000, (req, res)=>{
    console.log('SERVER RUNNING IN http://localhost:3000');
});
