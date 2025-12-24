// ----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
// ----------------------------------------------------------------------------

const path = require('path');
const embedToken = require(__dirname + '/embedConfigService.js');
const utils = require(__dirname + "/utils.js");
const express = require("express");
const bodyParser = require("body-parser");
const session = require('express-session');

const app = express();
const port = process.env.PORT || 5300;

// ----------------------------------------------------------------------------
// Middlewares
// ----------------------------------------------------------------------------
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
    session({
        secret: 'clave_super_secreta',
        resave: false,
        saveUninitialized: false
    })
);

// Servir archivos estáticos
app.use('/js', express.static('./node_modules/bootstrap/dist/js/')); // Bootstrap JS
app.use('/js', express.static('./node_modules/jquery/dist/')); // jQuery
app.use('/js', express.static('./node_modules/powerbi-client/dist/')) // PowerBI JS
app.use('/css', express.static('./node_modules/bootstrap/dist/css/')); // Bootstrap CSS
app.use('/public', express.static('./public/')); // Custom JS/CSS

// ----------------------------------------------------------------------------
// Credenciales quemadas
// ----------------------------------------------------------------------------
const USER = 'admin';
const PASS = '1234';
const valorToken=null;

// ----------------------------------------------------------------------------
// Middleware de autenticación
// ----------------------------------------------------------------------------
function auth(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
}

// ----------------------------------------------------------------------------
// Rutas
// ----------------------------------------------------------------------------

// Página de login
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname + '/../views/login.html'));
});

// Procesar login
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (username === USER && password === PASS) {
        req.session.user = username;
        res.redirect('/');
    } else {
        res.send('❌ Usuario o contraseña incorrectos');
    }
});

// Logout
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

// Página principal (index.html)
app.get('/', auth, (req, res) => {
    res.sendFile(path.join(__dirname + '/../views/menu.html'));
});

//Pagina EOS

// Página 1
app.get('/eos', auth, (req, res) => {
    entorno = 'EOS';
    res.sendFile(path.join(__dirname + '/../views/index.html'));
});

//Pagina KIA

// Página 1
app.get('/kia', auth, (req, res) => {
    entorno = 'KIA';
    res.sendFile(path.join(__dirname + '/../views/index.html'));
});

// Obtener embed token de Power BI
app.get('/getEmbedToken', auth, async (req, res) => {
    // Validar configuración
    const configCheckResult = utils.validateConfig();
    if (configCheckResult) {
        return res.status(400).send({ "error": configCheckResult });
    }

    // Obtener detalles (Embed URL, Access Token, Expiry)
    const result = await embedToken.getEmbedInfo();

    res.status(result.status).send(result);
});

// ----------------------------------------------------------------------------
// Iniciar servidor
// ----------------------------------------------------------------------------
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});