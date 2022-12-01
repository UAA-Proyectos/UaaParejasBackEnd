
var store = require('store')

// 1 - Invocamos a Express
const express = require('express');
const app = express();

//2 - Para poder capturar los datos del formulario (sin urlencoded nos devuelve "undefined")
app.use(express.urlencoded({extended:false}));
app.use(express.json());//además le decimos a express que vamos a usar json

//3- Invocamos a dotenv
const dotenv = require('dotenv');
dotenv.config({ path: './env/.env'});

//4 -seteamos el directorio de assets
app.use('/resources',express.static('public'));
app.use('/resources', express.static(__dirname + '/public'));

//5 - Establecemos el motor de plantillas
app.set('view engine','ejs');

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
	app.get('/login',(req, res)=>{
		res.render('login');
	})

	app.get('/register',(req, res)=>{
		res.render('register');
	})
	app.get('/index',(req, res)=>{
		res.render('index');
	})

//10 - Método para la REGISTRACIÓN
app.post('/register', async (req, res)=>{
	const user = req.body.user;
    const id = req.body.id;
    const pass = req.body.pass;
    const date = req.body.date;
    const email = req.body.email;
	let passwordHash = await bcrypt.hash(pass, 8);
    connection.query('INSERT INTO user SET ?',{id:id, username:user, birthdate:date, email:email,password:passwordHash}, async (error, results)=>{
        if(error){
            console.log(error);
			if(error.code = "ER_DUP_ENTRY"){
				res.status(409);
				res.send();
			}else{
				res.status(500);
				res.send();
			}
        }else{            
			
			res.status(201);
			req.session.loggedin = true;                
			req.session.email = email;
			// req.session.code= 200;
			console.log(req.session.email);
			//res.send('inicie sesion codigo:' + req.session.code + req.session.email);
            res.redirect('/');         
        }
	});
})



//11 - Metodo para la autenticacion
app.post('/auth', async (req, res)=> {
	const user = req.body.user;
	const pass = req.body.pass;    
    let passwordHash = await bcrypt.hash(pass, 8);
	if (user && pass) {
		connection.query('SELECT * FROM user WHERE username = ?', [user], async (error, results, fields)=> {
			if( results.length == 0/*!(await bcrypt.compare(pass, results[0].pass)*/) {    
				res.status(404);
				
			} else {         
				//creamos una var de session y le asignamos true si INICIO SESSION       
				req.session.loggedin = true;                
				req.session.email = user;
				res.status(200);
				console.log("logeado");
				res.redirect('/'); 
			}			
			res.end();
		});
	} else {	
		res.send('Please enter user and Password!');
		res.end();
	}
});

//12 - Método para controlar que está auth en todas las páginas
app.get('/', (req, res)=> {
	if (req.session.loggedin) {
		res.render('index',{
			login: true,
			email: req.session.email,

		},console.log(req.session.email)
		);		
			
	} else {
		res.render('index',{
			login:false,
			name:'Debe iniciar sesión',			
		});				
	}
	res.end();
});


//función para limpiar la caché luego del logout
app.use(function(req, res, next) {
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


app.listen(3000, (req, res)=>{
    console.log('SERVER RUNNING IN http://localhost:3000');
});
