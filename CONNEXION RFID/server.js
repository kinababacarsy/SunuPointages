const express = require("express");
const cors = require("cors");
const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");
const app = express();
const portPath = "COM6"; // Modifiez ce chemin si nécessaire
const port = new SerialPort({
  path: portPath,
  baudRate: 9600,
});

const parser = port.pipe(new ReadlineParser({ delimiter: "\n" }));

let cardID = null;

parser.on("data", (data) => {
  console.log("Données reçues de l'Arduino:", data);

  try {
    const jsonData = JSON.parse(data);

    if (jsonData.type === "cardRead") {
      console.log(`Carte lue avec ID: ${jsonData.cardId}`);
      cardID = jsonData.cardId;
    }
  } catch (e) {
    console.warn("Erreur de parsing JSON ignorée:", e.message);
  }
});

port.on("error", (err) => {
  console.error("Erreur du port série:", err);
});

app.use(cors()); // Activer CORS

app.get("/api/cardID", (req, res) => {
  if (cardID) {
    res.json({ cardID });
    cardID = null; // Réinitialiser l'ID de la carte après l'avoir envoyé
  } else {
    res.status(404).json({ error: "Aucune carte scannée" });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});
