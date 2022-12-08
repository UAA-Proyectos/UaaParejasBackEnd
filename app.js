// 1 - Invocamos a Express
const express = require('express');
const app = express();

app.all('/*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header('Content-type: text/html; charset=utf-8');
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
            console.log(results)
            connection.query(`INSERT INTO photo set id_user = ${results.insertId}, path= "http://localhost:3000/uploads/profile.png"`, (err, result) => {
                if (err) {
                    res.status(500).send({ error: "Internal server error", res: err });
                }
                else {
                    res.status(200).send({ status: "ok", message: "photo uploaded", data: result });
                }
            });

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


            if (results.length > 0) {
                const match = await bcrypt.compare(pass, results[0].password)
                //creamos una var de session y le asignamos true si INICIO SESSION   
                req.session.loggedin = true;
                req.session.username = results[0].username;
                if (match) {
                    res.send({
                        id: results[0].id, user_type: results[0].user_type
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
app.post('/logout', function (req, res) {
    req.session.destroy()
    res.status(200).send({ message: "user logged out" })
});

// const express = require('express');
const bodyparser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');
const { ok, match } = require('assert');
const { profile } = require('console');

// const app = express();

app.use(cors());
app.use(bodyparser.json());


// EndPoint Obtener info de un usuario
app.get('/user/:id', (req, res) => {
    let gID = req.params.id;
    let query = `select u.id, DATE_FORMAT(birthdate,'%m/%d/%Y') as birthdate, u.created_at, u.description, u.zodiac_sign, u.username, u.email, u.location, u.id_sexual_orientation, u.gender, u.show_me, u.user_type from user u where u.id = ${gID}`;
    connection.query(query, (err, user) => {
        if (err) {
            console.log(err, 'errs');
        }
        if (user.length > 0) {
            console.log(user)
            query = `select id, name from interest inner join user_interest on interest.id = user_interest.id_interest AND user_interest.id_user =${gID}`;
            connection.query(query, (err, interest) => {
                if (!err) {
                    query = `select * from photo where id_user = ${gID}`
                    connection.query(query, (err, photos) => {
                        if (err) {
                            res.status(500).send({ error: err })
                        }
                        else {
                            user = user[0]
                            res.status(200).send({ status: "ok", message: "1 User data", user_profile: { user, interest, photos } });
                        }
                    })
                } else {
                    res.status(500).send({ error: err })
                }
            })

        }
        else {
            res.status(400).send('Data not found');
        }
    })
})

//EndPoint Para modificar perfil
app.put('/user/:id', (req, res) => {
    console.log(req.body, 'updatedata');

    let gID = req.params.id;

    let gender = req.body.gender;
    let show_me = req.body.show_me;
    let birthdate = req.body.birthdate;
    let description = req.body.description;
    let zodiac = req.body.zodiac_sign;
    let sexual_orientation = req.body.id_sexual_orientation
    let username = req.body.username;
    let email = req.body.email;
    let location = req.body.location;
    let interests = req.body.interests;

    let query = `update user set  gender = ${gender}, show_me = ${show_me}, location = '${location}', description = '${description}',  zodiac_sign = '${zodiac}', username = '${username}', email = '${email}', id_sexual_orientation= '${sexual_orientation}' where id = ${gID}`;

    connection.query(query, (err, result) => {
        if (err) {
            res.status(500).send({ error: err })
            console.log(err);
        }
        else {
            deleteQuery = `delete from user_interest where id_user = '${gID}'`
            connection.query(deleteQuery, (err, result) => { })

            for (let i = 0; i < interests.length; i++) {
                query = `insert into user_interest (id_user, category_id, id_interest) values ('${gID}', '${1}', '${interests[i]}')`
                connection.query(query, (err, result) => {
                    if (err) {
                        console.log(err)
                    }
                })
            }
            res.status(201).send({
                message: 'data updated'
            })
        }
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
        const match = await bcrypt.compare(oldPassword, results[0].password);
        if (match) {
            let query = `update user set password = '${newPassword}' where email = ${email}`;
            connection.query(query, (err, result) => {
                if (err) {
                    console.log(err);
                }
                res.status(201).send({ status: "ok", message: "data updated" });
            });
        }
        else {
            res.status(400).send('Error contraseña');
        }
    });

})

//Ruta donde almacenamos las imagenes

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'uploads')
    },
    filename: (req, file, callback) => {
        callback(null, file.originalname)
    }
});

const upload = multer({
    storage: storage
});


app.get("/upload/:id", (req, res) => {
    const id = req.params.id;
    connection.query(`select path from photo where id_user = ${id}`, (err, rows, fields) => {
        if (!err)
            res.json(rows);
        else
            console.log(err);
    })
})

//Recibir las imagenes
app.post('/file', upload.single('file'), (req, res, next) => {

    const userId = req.body.userId ?? 13
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

    console.log(filesImg.path);

    connection.query(`INSERT INTO photo set id_user = ${userId}, path= "http://localhost:3000/${filesImg.path.replace("\\", "/")}"`, (err, result) => {
        if (err) {
            res.status(500).send({ error: "Internal server error", res: err });
        }
        else {
            res.status(200).send({ status: "ok", message: "photo uploaded", data: result });
        }
    });
})

// Recibe el Id del usuario actual y asi como un status (like, block, etc) para mostrar todos los usuarios con los que tiene ese status 
app.get('/matches/:id', (req, res) => {
    let gID = req.params.id;
    let status = req.body.status;
    console.log(req.body.status);

    let query = `select user.username, interaction.status from user inner join interaction on (user.id = interaction.id_user2 and interaction.id_user1= ${gID}) and (interaction.status = "${status}") `;
    connection.query(query, (err, users) => {
        if (err) {
            console.log(err, 'errs');
        }
        if (users.length > 0) {
            res.status(200).send({ status: "ok", message: "Matches found", data: users });

        }
        else {
            res.status(400).send('Data not found');
        }
    })

});

//Mostrar lista de orientacion sexual
app.get('/orientations', (req, res) => {
    let query = `select * from sexual_orientation`;
    connection.query(query, (err, orientations) => {
        if (err) {
            console.log(err, 'errs');
        }
        if (orientations.length > 0) {
            res.status(200).send({ status: "ok", message: "Sexual orientations", data: orientations });

        }
        else {
            res.status(400).send('Data not found');
        }
    })

});

//Recibe el id del usuario 2 y el nuevo status y actualiza la tabla status
app.put('/changeinteraction/:id', (req, res) => {

    console.log(req.body, 'updatedata');
    let user1 = req.params.id;//14
    let isuser1 = true;
    let user2 = req.body.user2;//12
    let newStatus = req.body.newStatus;
    let auxstat;
    let query = `select idInteraction,idStatus from interaction where (id_user1 = ${user2} and id_user2 = ${user1}) or (id_user1 = ${user1} and id_user2 = ${user2});`;
    if (user1 > user2) {
        let aux = user1;
        user1 = user2;
        user2 = aux;
        isuser1 = false;
    }
    connection.query(query, (error, result) => {

        if (result.length == 0) {

            if (newStatus == 1 && isuser1) {
                auxstat = 1;
            } else if (newStatus == 1 && !isuser1) {
                auxstat = 4;
            } else if (newStatus == 2 && isuser1) {
                auxstat = 2;
            } else {
                auxstat = 5;
            }
            query = `insert into interaction (id_user1,id_user2,idStatus) values ('${user1}', '${user2}','${auxstat}')`;
            connection.query(query, (error, resultt) => {
                console.log(resultt);
                if (error) {
                    res.status(500).send();
                    console.log("error", error);
                } else {
                    res.status(201).send({ message: "ok", data: resultt, status: "ok", match: false });
                }

            })

        } else {
            let interactionn = result[0].idStatus;
            console.log(interactionn, "interactiooon")
            if ((interactionn == 1 || interactionn == 4) && newStatus == 1) {
                query = `REPLACE into interaction (id_user1, id_user2,idStatus) values ('${user1}', '${user2}','7');`;
                let query2 = `insert into mydb.match (idInteraction) value (${result[0].idInteraction});`;
                connection.query(query, (err, ress) => {
                    if (err) {
                        console.log(err);
                        res.status(500).send();
                    } else {
                        query2 = `insert into mydb.match (idInteraction) value (${ress.insertId});`;
                        connection.query(query2, (error, resu) => {
                            if (error) {
                                console.log(err);
                            } else {

                                res.status(200).send({
                                    message: 'data updated',
                                    match: true
                                })
                            }
                        })
                    }
                })


            } else {
                query = `delete from interaction where id_user1 = ${user1} and id_user2=${user2}`
                res.status(200).send({
                    message: 'data updated',
                    match: false
                })
            }
        }
    })
})

//Regresar posible match
app.get('/possible_match/:userId', (req, res) => {

    //TODO aqui hacer el algoritmo de seleccion de match potencial | para pruebas id= 12


    console.log("posible match searchiiing")
    let userId = req.params.userId;
    //info usuario
    let query = `select show_me from user where id = ${userId}`;

    connection.query(query, (err, user) => {
        if (!err) {
            let show_me = user[0]?.show_me ?? 0;
            let users = [];
            if (show_me == 2)
                query = `select id from user where id NOT IN (select id_user1 from interaction where (id_user1 = ${userId} or id_user2 = ${userId} ))  AND id NOT IN (select id_user2 from interaction where id_user1 = ${userId} or id_user2 = ${userId} )  limit 1`;
            else
                query = `select id from user where id NOT IN (select id_user1 from interaction where (id_user1 = ${userId} or id_user2 = ${userId}))  AND id NOT IN (select id_user2 from interaction where (id_user1 = ${userId} or id_user2 = ${userId})) and gender = ${show_me} limit 1 `;

            connection.query(query, (err, oneUser) => {
                if (err)
                    console.log(err)
                else if (oneUser.length > 0) {
                    console.log("one userrrrrr", oneUser[0])
                    query = `select u.id, DATE_FORMAT(birthdate,'%m/%d/%Y') as birthdate, u.created_at, u.description, u.zodiac_sign, u.username, u.email, u.location, u.id_sexual_orientation from user u where u.id = ${oneUser[0].id}`;

                    connection.query(query, (err, user) => {
                        if (err) {
                            console.log(err, 'errs');
                            res.status(500).send({ error: err })
                        }
                        else if (user.length > 0) {
                            console.log(user)
                            query = `select id, name from interest inner join user_interest on interest.id = user_interest.id_interest AND user_interest.id_user =${oneUser[0].id}`;
                            connection.query(query, (err, interest) => {
                                if (!err) {
                                    query = `select * from photo where id_user = ${oneUser[0].id}`
                                    connection.query(query, (err, photos) => {
                                        if (err) {
                                            res.status(500).send({ error: err })
                                        }
                                        else {
                                            user = user[0]
                                            res.status(200).send({ status: "ok", message: "1 User data", user_profile: { user, interest, photos } });
                                        }
                                    })
                                } else {
                                    res.status(500).send({ error: err })
                                }
                            })

                        }
                    });
                } else {
                    //si está vaciooo...
                    let user_kk = null
                    query = `select * from interaction where id_user1 = ${userId} or id_user2 = ${userId}; `
                    connection.query(query, (err, ress) => {
                        if (ress.length > 0) {
                            for (let i = 0; i < ress.length; i++) {
                                if (ress[i].id_user1 != userId && (ress[i].idStatus == 1 || ress[i].idStatus == 2) && ress[i].idStatus != 7) {
                                    user_kk = ress[i].id_user1;
                                } else if (ress[i].id_user2 != userId && (ress[i].idStatus == 4 || ress[i].idStatus == 5) && ress[i].idStatus != 7) {
                                    user_kk = ress[i].id_user2
                                }
                            }
                            console.log("user llll", user_kk)

                            if (user_kk != null) {
                                query = `select u.id, DATE_FORMAT(birthdate,'%m/%d/%Y') as birthdate, u.created_at, u.description, u.zodiac_sign, u.username, u.email, u.location, u.id_sexual_orientation from user u where u.id = ${user_kk}`;

                                connection.query(query, (err, user) => {
                                    if (err) {
                                        console.log(err, 'errs');
                                    }
                                    else if (user.length > 0) {
                                        console.log(user)
                                        query = `select id, name from interest inner join user_interest on interest.id = user_interest.id_interest AND user_interest.id_user =${user_kk}`;
                                        connection.query(query, (err, interest) => {
                                            if (!err) {
                                                query = `select * from photo where id_user = ${user_kk}`
                                                connection.query(query, (err, photos) => {
                                                    if (err) {
                                                        res.status(500).send({ error: err })
                                                    }
                                                    else {
                                                        user = user[0]
                                                        res.status(200).send({ status: "ok", message: "1 User data", user_profile: { user, interest, photos } });
                                                    }
                                                })
                                            } else {
                                                res.status(500).send({ error: err })
                                            }
                                        })

                                    }
                                    else {
                                        res.status(400).send('Data not found');
                                    }
                                });
                            } else {
                                res.status(200).send({ status: "ok", message: "1 User data" });
                            }
                        } else if (err) {
                            res.status(500).send({ status: "error", error: err });
                        } else {
                            res.status(200).send({ status: "ok", message: "1 User data" });
                        }
                    })
                }
            })

        }
    });
});

//Mostrar lista de intereses
app.get('/interests', (req, res) => {
    let query = `select * from interest`;
    connection.query(query, (err, interest) => {
        if (err) {
            console.log(err, 'errs');
        }
        if (interest.length > 0) {
            res.status(200).send({ status: "ok", message: "interests", data: interest });

        }
        else {
            res.status(400).send('Data not found');
        }
    })

});
//obtener lista de matches, y por tanto lista de personas con las que puede chatear
app.get('/chats/:id', (req, res) => {
    let userId = req.params.id
    let query = `select m.id_match, m.idInteraction, i.id_user1, i.id_user2 from mydb.match m inner join interaction i on m.idInteraction = i.idInteraction where (id_user1 = ${userId} or id_user2 = ${userId});`
    connection.query(query, (err, matches) => {
        if (err) {
            console.log(err, 'errs');
        }
        if (matches.length > 0) {
            let matchesArray = new Array()
            let match_information
            for (let i = 0; i < matches.length; i++) {
                console.log(matches.length)
                if (matches[i].id_user1 == userId) {
                    query = `select u.id, u.username, p.path from user u inner join photo p on u.id = p.id_user where u.id = ${matches[i].id_user2} order by p.id_photo desc limit 1;`
                } else {
                    query = `select u.id, u.username, p.path from user u inner join photo p on u.id = p.id_user where u.id = ${matches[i].id_user1} order by p.id_photo desc limit 1;`

                }
                connection.query(query, (err, user_match_info) => {
                    if (err) {
                        console.log(err, 'errs');
                    }
                    else {
                        if (user_match_info.length > 0) {
                            match_information = { match: matches[i], user: user_match_info[0] }
                            matchesArray.push(match_information)
                        }
                        else {
                            matchesArray.push({ match: matches[i], user: {} })
                        }
                    }
                    if (i == matches.length - 1) {
                        console.log(matchesArray)
                        res.status(200).send({ status: "ok", message: "matches", data: matchesArray });
                    }
                }

                )
            }

        }
        else {
            res.status(200).send({ status: "ok", message: "matches", data: [] });
        }
    })
})

//obtener los mensajes de un chat
app.get("/chats/:match_id/messages", (req, res) => {
    let match_id = req.params.match_id
    let query = `select idMessage, id_user, DATE_FORMAT(sent_at,'%m/%d/%Y, %H:%i') as sent_at, status, content, id_match from message where id_match = ${match_id}`
    connection.query(query, (err, messages) => {
        if (err) {
            console.log(err)
            res.status(500).send({ message: "error" })
        } else {
            res.status(200).send({ status: "ok", message: "messages found", data: messages })
        }
    })
})

//insertar un mensaje de un match
app.put("/message", (req, res) => {
    //id del q lo envia
    let id_user = req.body.id_user;
    let status = 0 //default pq no lo manejaremos
    let content = req.body.message;
    let id_match = req.body.id_match

    let query = `insert into message (id_user, status, content, id_match) values ('${id_user}','${status}','${content}','${id_match}')`

    connection.query(query, (err, result) => {
        if (err) {
            console.log(err)
            res.status(500).send({ message: "error" })
        } else {
            res.status(200).send({ status: "ok", message: "messages inserted", data: result })
        }
    })

})



//reporte #1 -> usuarios activos OK
app.get('/reportone', (req, res) => {

    let query = `select count(*) as total_active_users FROM user where deleted != 1 `;
    connection.query(query, (err, result) => {
        if (err) {
            res.status(404).send('Error papito');
        } else {
            res.status(201).send({ status: "ok", message: "reportone", data: result[0] });
        }
    })

});

//reporte #3 -> orientaciones sexuales OK
app.get('/reportthree', (req, res) => {

    let query = `select n.name, u.id_sexual_orientation, (count(u.id_sexual_orientation)/(select count(*) from user)) * 100 as porcentaje from user u inner join mydb.sexual_orientation n on n.id_sexual_orientation = u.id_sexual_orientation GROUP BY id_sexual_orientation ORDER BY PORCENTAJE DESC`
    connection.query(query, (err, result) => {
        if (err) {
            console.log(err)
            res.status(404).send('Error papito');
        } else {
            res.status(201).send({ status: "ok", message: "reportthree", data: result });
        }

    })

});

//reporte #6
app.get('/reportsix', (req, res) => {

    let query = `select gender, (count(gender)/(select count(*) from user)) * 100 as cantidad FROM user GROUP BY gender order by gender desc`;
    connection.query(query, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.status(201).send({ status: "ok", message: "reportsix", data: result });
        }

    })

});

//reporte #7 -> cantidad total de matches hechos en la app OK
app.get('/reportseven', (req, res) => {

    let query = `select count(*) as total_matches from mydb.match `;
    connection.query(query, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.status(201).send({ status: "ok", message: "reportseven", data: result[0] });
        }

    })

});

//reporte #8 lista de usuarios con más interacciones OK kinda
app.get('/reporteight', (req, res) => {

    let query = `select u.id, u.email, u.username, i.id_user1, count(*) as count from user u INNER JOIN interaction i on u.id= i.id_user1 GROUP BY i.id_user1 HAVING COUNT ORDER BY count DESC limit 25 `;
    connection.query(query, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.status(201).send({ status: "ok", message: "reporteight", data: result });
        }

    })

});

//reporte #9 usuarios que más envian mensajes OK
app.get('/reportnine', (req, res) => {

    let query = `SELECT u.id, u.username, count(*) as count FROM user u INNER JOIN message i on u.id= i.id_user GROUP BY (u.id) ORDER BY count  DESC limit 25`
    connection.query(query, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.status(201).send({ status: "ok", message: "reportnine", data: result });
        }

    })

});

//reporte edad OK
app.get('/reportedad', (req, res) => {

    let query = `select avg( Year(now()) - Year(birthdate) ) as edad_promedio from user`;
    connection.query(query, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.status(201).send({ status: "ok", message: "reportedad", data: result });
        }

    })

});

//reporte signo OK
app.get('/reportsigno', (req, res) => {

    let query = `SELECT zodiac_sign, (count(zodiac_sign)/(select count(*) from user)) * 100 as cantidad FROM user GROUP BY zodiac_sign order by cantidad desc`;
    connection.query(query, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.status(201).send({ status: "ok", message: "reportsigno", data: result });
        }

    })

});

//reporte Estados OK
app.get('/reportestados', (req, res) => {

    let query = `SELECT location, (count(location)/(select count(*) from user)) * 100 as cantidad FROM user GROUP BY location having cantidad >0 ORDER BY cantidad DESC limit 25`;
    connection.query(query, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.status(201).send({ status: "ok", message: "reportestados", data: result });
        }

    })

});


//reporte mes de registro OK
app.get('/report_active_month', (req, res) => {

    let query = ` select MONTH(u.created_at) as mounth, count(*) as count FROM user u group by mounth HAVING COUNT(*)>0 ORDER BY mounth DESC;`
    connection.query(query, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.status(201).send({ status: "ok", message: "reportestados", data: result });
        }

    })

});


app.listen(3000, (req, res) => {
    console.log('SERVER RUNNING IN http://localhost:3000');
});
