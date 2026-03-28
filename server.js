const express = require('express');

const app = express();
const PORT = 3000;

// dire à express d'utiliser le dossier "public"
app.use(express.static('public'));

// lancer le serveur
app.listen(PORT, () => {
    console.log(`Serveur lancé sur http://localhost:${PORT}`);
});