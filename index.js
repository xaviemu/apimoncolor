const express = require('express');
const csv = require('csv-parser');
const axios = require('axios');
const { PassThrough } = require('stream');
const dotenv = require('dotenv');

// Cargar variables de entorno desde el archivo .env
dotenv.config();

const app = express();

// Asigna el puerto basado en el entorno
const PORT = process.env.PORT || 3005;

app.get('/api/ventas', async (req, res) => {
    const url = process.env.URLDATA; // Utilizar la URL desde las variables de entorno

    try {
        const response = await axios({
            method: 'get',
            url: url,
            responseType: 'stream'
        });

        let results = [];
        response.data
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => {
                res.json(results);
            });
    } catch (err) {
        // Manejo de errores para enviar el mensaje de error específico
        res.status(500).send(`Error al descargar o leer el archivo CSV: ${err.message}`);
    }
});

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
