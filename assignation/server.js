const express = require("express");
const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");
const WebSocket = require("ws");
const express = require('express');
// Importation du module Express pour créer un serveur web

const { SerialPort } = require('serialport');
// Importation du module SerialPort pour la communication série

const { ReadlineParser } = require('@serialport/parser-readline');
// Importation du module ReadlineParser pour parser les données série ligne par ligne

const WebSocket = require('ws');
// Importation du module WebSocket pour créer un serveur WebSocket

const app = express();
// Création d'une instance d'application Express

const port = 3000;
// Définition du port sur lequel le serveur Express écoutera

let cardId = "";
let cardId = '';
// Variable pour stocker l'ID de la carte

// Configuration du port série
const serialPort = new SerialPort({ path: '/dev/ttyUSB0', baudRate: 9600 });
// Création d'une instance de SerialPort avec le chemin du port série et le débit en bauds
// Remplacez '/dev/ttyUSB0' par le port série de votre Arduino

const parser = serialPort.pipe(new ReadlineParser({ delimiter: '\n' }));
// Création d'une instance de ReadlineParser pour parser les données série ligne par ligne

// Configuration du serveur WebSocket
const wss = new WebSocket.Server({ port: 8080 });
// Création d'une instance de serveur WebSocket écoutant sur le port 8080

wss.on("connection", (ws) => {
  console.log("Client connecté");
wss.on('connection', (ws) => {
  // Événement déclenché lorsqu'un client se connecte au serveur WebSocket
  console.log('Client connecté');
  // Log de la connexion du client

  parser.on("data", (data) => {
    console.log("Données brutes reçues :", data); // Ajoutez ce log pour voir les données brutes
  parser.on('data', (data) => {
    // Événement déclenché lorsque des données sont reçues du port série
    console.log('Données brutes reçues :', data);
    // Log des données brutes reçues
    try {
      // Vérifier si les données commencent par '{' pour s'assurer qu'elles sont au format JSON
      if (data.startsWith("{")) {
        const jsonData = JSON.parse(data);
        if (jsonData.type === "cardRead") {
        // Parsing des données JSON
        if (jsonData.type === 'cardRead') {
          // Vérification du type de données
          console.log(`Carte détectée avec UID : ${jsonData.cardId}`);
          // Log de l'UID de la carte détectée
          cardId = jsonData.cardId;
          // Mise à jour de la variable cardId
          console.log(`cardId mis à jour : ${cardId}`);
          // Log de la mise à jour de cardId
          ws.send(JSON.stringify({ cardId }));
          // Envoi des données au client WebSocket
        }
      }
    } catch (error) {
      console.error("Erreur de parsing JSON :", error);
      console.error('Erreur de parsing JSON :', error);
      // Gestion des erreurs de parsing JSON
    }
  });

  ws.on('message', (message) => {
    // Événement déclenché lorsque le serveur WebSocket reçoit un message du client
    const data = JSON.parse(message);
    // Parsing du message JSON
    if (data.type === 'assignCard') {
      // Vérification du type de message
      handleAssignCard(ws, data.data);
      // Appel de la fonction handleAssignCard pour traiter l'assignation de la carte
    }
  });

  ws.on("close", () => {
    console.log("Client déconnecté");
  ws.on('close', () => {
    // Événement déclenché lorsque le client se déconnecte du serveur WebSocket
    console.log('Client déconnecté');
    // Log de la déconnexion du client
  });
});

// Démarrer le serveur Express
app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
  // Log du démarrage du serveur Express
});