const express = require('express');
const csv = require('csv-parser');
const axios = require('axios');
const dotenv = require('dotenv');

// Cargar variables de entorno desde el archivo .env
dotenv.config();

const app = express();

// Asigna el puerto basado en el entorno
const PORT = process.env.PORT || 3005;

// Middleware para configurar CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.get('/api/ventas', async (req, res) => {
    const url = process.env.URLDATA; // Utilizar la URL desde las variables de entorno

    // Obtener los parámetros de consulta para paginación
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

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
                // Implementación de paginación
                const startIndex = (page - 1) * limit;
                const endIndex = startIndex + limit;
                const paginatedResults = results.slice(startIndex, endIndex);

                res.json({
                    page: page,
                    limit: limit,
                    totalResults: results.length,
                    totalPages: Math.ceil(results.length / limit),
                    data: paginatedResults
                });
            })
            .on('error', (err) => {
                // Manejo de errores durante el procesamiento del CSV
                res.status(500).send(`Error al procesar el archivo CSV: ${err.message}`);
            });
    } catch (err) {
        // Manejo de errores para enviar el mensaje de error específico
        res.status(500).send(`Error al descargar o leer el archivo CSV: ${err.message}`);
    }
});

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
