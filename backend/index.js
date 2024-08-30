const express = require('express');
// const Redis = require('redis');

const app = express();
const PORT = 3000;

// Create Redis clients for publishing and subscribing
// const redisPublisher = Redis.createClient();
// const redisSubscriber = Redis.createClient();

// Map to store SSE client connections
const clients = new Map();

// Subscribe to a Redis channel
// redisSubscriber.subscribe('sse-channel');

// When a message is received from the Redis channel, broadcast it to all connected clients
// redisSubscriber.on('message', (channel, message) => {
//     clients.forEach((client, clientId) => {
//         client.write(`data: ${message}\n\n`);
//     });
// });


app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'null'); // Replace * with your allowed origin
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// SSE endpoint
app.get('/sse', (req, res) => {
    // Set the necessary headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Generate a unique ID for the client
    const clientId = Date.now();

    // Store the response object in the Map
    clients.set(clientId, res);

    // Send an initial message to confirm the connection
    res.write(`data: ${clientId} Connected\n\n`);

    // Cleanup when the client disconnects
    req.on('close', () => {
        console.log(`Client disconnected ${clientId}`);
        clients.delete(clientId);
        res.end();
    });
});

// Endpoint to publish messages to the Redis channel
app.post('/publish', express.json(), (req, res) => {
    const message = req.body.message;
    clients.forEach((client, _clientId) => {
        client.write(`data: ${message}\n\n`);
    });
    // redisPublisher.publish('sse-channel', message);
    res.status(200).send('Message sent');
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
