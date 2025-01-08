const express = require('express');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const WebSocket = require('ws');

const app = express();
const port = 3000;

let cardId = '';

// Configuration du port série
const serialPort = new SerialPort({ path: '/dev/ttyUSB0', baudRate: 9600 }); // Remplacez '/dev/ttyUSB0' par le port série de votre Arduino
const parser = serialPort.pipe(new ReadlineParser({ delimiter: '\n' }));

// Configuration du serveur WebSocket
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  console.log('Client connecté');

  parser.on('data', (data) => {
    console.log('Données brutes reçues :', data); // Ajoutez ce log pour voir les données brutes
    try {
      // Vérifier si les données commencent par '{' pour s'assurer qu'elles sont au format JSON
      if (data.startsWith('{')) {
        const jsonData = JSON.parse(data);
        if (jsonData.type === 'cardRead') {
          console.log(`Carte détectée avec UID : ${jsonData.cardId}`);
          cardId = jsonData.cardId; // Mettre à jour la variable cardId
          console.log(`cardId mis à jour : ${cardId}`); // Ajoutez ce log pour vérifier la mise à jour
          ws.send(JSON.stringify({ cardId })); // Envoyer les données au client WebSocket
        }
      }
    } catch (error) {
      console.error('Erreur de parsing JSON :', error);
    }
  });


  ws.on('message', (message) => {
    const data = JSON.parse(message);
    if (data.type === 'assignCard') {
      handleAssignCard(ws, data.data);
    }
  });

  
  ws.on('close', () => {
    console.log('Client déconnecté');
  });
});

// Démarrer le serveur Express
app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});
