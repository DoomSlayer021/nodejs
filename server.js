const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const conexion = require("./db");

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));



app.use(session({
    secret: "secreto123",
    resave: false,
    saveUninitialized: false
}));

function verificarSesion(req, res, next) {
    if (req.session.usuario) {
        next();
    } else {
        res.send("Debes iniciar sesión primero");
    }
}


app.get("/", (req, res) => {
    console.log("SESSION:", req.session);

    if (!req.session.usuario || req.session.usuario === undefined) {
        console.log("NO LOGUEADO");
        return res.sendFile(__dirname + "/public/login.html");
    }

    console.log("LOGUEADO");
    res.sendFile(__dirname + "/public/index.html");
});


app.post("/login", (req, res) => {
    const { nombre, contrasena } = req.body;

    const sql = "SELECT * FROM usuario WHERE nombre = ?";

    conexion.query(sql, [nombre], async (err, resultados) => {
        if (err) throw err;

        if (resultados.length === 0) {
            return res.send("Usuario no existe");
        }

        const usuario = resultados[0];
        const coincide = await bcrypt.compare(contrasena, usuario.contrasena);

        if (coincide) {
            req.session.usuario = usuario.nombre;
            res.redirect("/");
        } else {
            res.send("Contraseña incorrecta");
        }
    });
});


app.post("/registro", async (req, res) => {
    const { nombre, contrasena } = req.body;

    if (!nombre || !contrasena) {
        return res.send("Datos inválidos");
    }

    const hash = await bcrypt.hash(contrasena, 10);

    const sql = "INSERT INTO usuario (nombre, contrasena) VALUES (?, ?)";

    conexion.query(sql, [nombre, hash], (err) => {
        if (err) return res.send("Error al registrar");

        res.send("Usuario registrado <br><a href='/'>Ir al login</a>");
    });
});


app.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/");
    });
});


app.post("/guardar", verificarSesion, (req, res) => {
    const { nombre, tipo, precio } = req.body;
    const precioNum = parseInt(precio);

    if (!nombre || !tipo || isNaN(precioNum) || precioNum < 0) {
        return res.send("Error: datos inválidos");
    }

    const sql = "INSERT INTO instrumento (nombre, tipo, precio) VALUES (?, ?, ?)";

    conexion.query(sql, [nombre, tipo, precioNum], (err) => {
        if (err) return res.send("Error al guardar");

        res.redirect("/listar");
    });
});

app.get("/usuarios", verificarSesion, (req, res) => {
    conexion.query("SELECT id, nombre FROM usuario", (err, filas) => {
        if (err) throw err;

        let contenido = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Usuarios</title>
            <link rel="stylesheet" href="style.css">
        </head>
        <body>
        <div class="contenedor-lista">
            <h2>Lista de Usuarios</h2>
            <table>
                <tr>
                    <th>ID</th>
                    <th>Usuario</th>
                </tr>
        `;

        filas.forEach(u => {
            contenido += `
                <tr>
                    <td>${u.id}</td>
                    <td>${u.nombre}</td>
                </tr>
            `;
        });

        contenido += `
            </table>
            <br>
            <a href="/">Volver</a>
            <a href="/logout">Cerrar sesión</a>
        </div>
        </body>
        </html>
        `;

        res.send(contenido);
    });
});

app.get("/listar", verificarSesion, (req, res) => {
    conexion.query("SELECT * FROM instrumento", (err, filas) => {
        if (err) throw err;

        let contenido = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Listado</title>
            <link rel="stylesheet" href="style.css">
        </head>
        <body>
        <div class="contenedor-lista">
        <h2>Listado de instrumentos</h2>
        <table>
        <tr><th>ID</th><th>Nombre</th><th>Tipo</th><th>Precio</th></tr>
        `;

        filas.forEach(f => {
            contenido += `
            <tr>
                <td>${f.id}</td>
                <td>${f.nombre}</td>
                <td>${f.tipo}</td>
                <td>${f.precio}</td>
            </tr>`;
        });

        contenido += `
        </table>
        <br><a href="/">Volver</a>
        <a href="/logout">Cerrar sesión</a>
        </div>
        </body>
        </html>
        `;

        res.send(contenido);
    });
});
app.use(express.static("public"));
app.listen(PORT, () => console.log(`🚀 http://localhost:${PORT}`));