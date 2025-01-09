#include <SPI.h>
// Inclure la bibliothèque SPI pour la communication série

#include <MFRC522.h>
// Inclure la bibliothèque MFRC522 pour la gestion du module RFID

// Définir les broches utilisées pour le module RC522
#define SS_PIN 10
// Définir la broche SS (Slave Select) sur la broche 10

#define RST_PIN 9
// Définir la broche RST (Reset) sur la broche 9

MFRC522 rfid(SS_PIN, RST_PIN);
// Créer une instance de l'objet RFID en utilisant les broches SS et RST définies

void setup() {
  // Fonction d'initialisation exécutée une fois au démarrage

  Serial.begin(9600);
  // Démarrer la communication série à 9600 bauds

  SPI.begin();
  // Initialiser le bus SPI

  rfid.PCD_Init();
  // Initialiser le module RC522

  Serial.println("Scanner RFID prêt. Approchez une carte...");
  // Afficher un message indiquant que le scanner RFID est prêt
}

void loop() {
  // Fonction principale exécutée en boucle

  // Vérifier si une carte est présente
  if (!rfid.PICC_IsNewCardPresent()) return;
  // Si aucune nouvelle carte n'est présente, quitter la fonction

  if (!rfid.PICC_ReadCardSerial()) return;
  // Si la lecture de l'UID de la carte échoue, quitter la fonction

  // Afficher l'UID de la carte
  Serial.print("Carte détectée avec UID : ");
  // Afficher un message indiquant que la carte a été détectée

  for (byte i = 0; i < rfid.uid.size; i++) {
    // Boucle pour parcourir chaque octet de l'UID
    Serial.print(rfid.uid.uidByte[i], HEX);
    // Afficher chaque octet de l'UID en format hexadécimal
    Serial.print(" ");
    // Ajouter un espace entre les octets
  }
  Serial.println();
  // Ajouter une nouvelle ligne après l'affichage de l'UID

  // Identifier et afficher le type de carte
  MFRC522::PICC_Type piccType = rfid.PICC_GetType(rfid.uid.sak);
  // Obtenir le type de carte en utilisant le SAK (Select Acknowledge)

  Serial.print("Type de carte : ");
  // Afficher un message indiquant le type de carte

  Serial.println(rfid.PICC_GetTypeName(piccType));
  // Afficher le nom du type de carte

  // Envoyer l'UID de la carte à l'application Angular
  String cardId = "";
  // Initialiser une chaîne vide pour stocker l'UID de la carte

  for (byte i = 0; i < rfid.uid.size; i++) {
    // Boucle pour parcourir chaque octet de l'UID
    cardId += String(rfid.uid.uidByte[i], HEX);
    // Ajouter chaque octet de l'UID à la chaîne en format hexadécimal
  }

  Serial.print("{\"type\":\"cardRead\",\"cardId\":\"");
  // Afficher le début du message JSON

  Serial.print(cardId);
  // Ajouter l'UID de la carte au message JSON

  Serial.println("\"}");
  // Terminer le message JSON

  // Arrêter la communication avec la carte
  rfid.PICC_HaltA();
  // Arrêter la communication avec la carte RFID
}