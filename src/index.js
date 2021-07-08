const express = require('express');
const cors = require('cors');
require('dotenv').config();
//const db = require('../src/database/mssql-config');

// Crear el servidor de express
const app = express();

// middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: false}));

// Routes
app.use('/api/ventas', require('./routes/ventas') );

//app.get('/',(req,res)=> res.send("Hola mundo"));

// Escuchar peticiones
app.listen( process.env.PORT, () => {
	console.log(`Servidor corriendo en puerto ${ process.env.PORT }`);
});