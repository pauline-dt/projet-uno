const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 3000;

app.use(express.static("public"));

const couleurs = [
    { dossier: "bleus", nomFichier: "Bleu" },
    { dossier: "rouges", nomFichier: "Rouge" },
    { dossier: "verts", nomFichier: "Vert" },
    { dossier: "jaunes", nomFichier: "Jaune" }
];

let joueurs = [];
let partie = null;

function creerDeck() {
    const deck = [];

    couleurs.forEach(couleur => {
        for (let i = 0; i <= 9; i++) {
            deck.push({
                type: "number",
                couleur: couleur.dossier,
                valeur: String(i),
                image: `assets/cards/UNO_${couleur.dossier}/${i} ${couleur.nomFichier}.png`
            });
        }

        deck.push({
            type: "draw2",
            couleur: couleur.dossier,
            valeur: "+2",
            image: `assets/cards/UNO_${couleur.dossier}/+2 ${couleur.nomFichier}.png`
        });

        deck.push({
            type: "skip",
            couleur: couleur.dossier,
            valeur: "skip",
            image: `assets/cards/UNO_${couleur.dossier}/Skip ${couleur.nomFichier}.png`
        });

        deck.push({
            type: "reverse",
            couleur: couleur.dossier,
            valeur: "reverse",
            image: `assets/cards/UNO_${couleur.dossier}/Change Tour ${couleur.nomFichier}.png`
        });
    });

    for (let i = 0; i < 4; i++) {
        deck.push({
            type: "wild",
            couleur: null,
            valeur: "wild",
            image: "assets/cards/UNO_others/Change couleur.png"
        });

        deck.push({
            type: "draw4",
            couleur: null,
            valeur: "+4",
            image: "assets/cards/UNO_others/+4.png"
        });
    }

    return deck;
}

function melanger(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

function initialiserPartie() {
    const deck = creerDeck();
    melanger(deck);

    joueurs[0].main = deck.splice(0, 7);
    joueurs[1].main = deck.splice(0, 7);

    joueurs.forEach(j => {
        j.saidUno = false;
        j.unoEligible = false;
    });

    let carteCentrale = deck.pop();

    while (carteCentrale.type === "wild" || carteCentrale.type === "draw4") {
        deck.unshift(carteCentrale);
        melanger(deck);
        carteCentrale = deck.pop();
    }

    partie = {
        deck,
        carteCentrale,
        couleurActive: carteCentrale.couleur,
        tour: joueurs[0].id,
        finDePartie: false,
        gagnant: null
    };

    console.log("Partie initialisée");
}

function getOtherPlayer(socketId) {
    return joueurs.find(j => j.id !== socketId);
}

function getPlayer(socketId) {
    return joueurs.find(j => j.id === socketId);
}

function estCarteJouable(carte, carteCentrale, couleurActive) {
    if (carte.type === "wild" || carte.type === "draw4") {
        return true;
    }

    return (
        carte.couleur === couleurActive ||
        carte.valeur === carteCentrale.valeur
    );
}

function piocherCartes(joueur, nb) {
    for (let i = 0; i < nb; i++) {
        if (partie.deck.length === 0) break;
        joueur.main.push(partie.deck.pop());
    }
}

function verifierVictoire() {
    const gagnant = joueurs.find(j => j.main.length === 0);
    if (gagnant) {
        partie.finDePartie = true;
        partie.gagnant = gagnant.id;
        return true;
    }
    return false;
}

function getEtatPourJoueur(socketId) {
    if (!partie) return null;

    const joueur = getPlayer(socketId);
    const adversaire = getOtherPlayer(socketId);

    if (!joueur || !adversaire) return null;

    return {
        pseudo: joueur.pseudo,
        pseudoAdversaire: adversaire.pseudo,
        main: joueur.main,
        nbCartesAdversaire: adversaire.main.length,
        carteCentrale: partie.carteCentrale,
        couleurActive: partie.couleurActive,
        monTour: partie.tour === socketId,
        finDePartie: partie.finDePartie,
        gagnant: partie.gagnant,
        canSayUno: joueur.unoEligible && !joueur.saidUno,
        canChallengeUno: adversaire.unoEligible && !adversaire.saidUno,
        message: partie.finDePartie
            ? (partie.gagnant === socketId ? "Tu as gagné !" : "Tu as perdu.")
            : (partie.tour === socketId
                ? "C'est ton tour."
                : `C'est le tour de ${adversaire.pseudo}.`)
    };
}

function envoyerEtatATous() {
    joueurs.forEach(joueur => {
        const etat = getEtatPourJoueur(joueur.id);
        if (etat) {
            io.to(joueur.id).emit("gameState", etat);
        }
    });
}

io.on("connection", (socket) => {
    console.log("Connexion :", socket.id);

    socket.on("joinGame", (pseudo) => {
        if (joueurs.length >= 2) {
            socket.emit("roomFull");
            return;
        }

        const pseudoFinal = pseudo && pseudo.trim() !== "" ? pseudo.trim() : `Joueur ${joueurs.length + 1}`;

        joueurs.push({
            id: socket.id,
            pseudo: pseudoFinal,
            main: [],
            saidUno: false,
            unoEligible: false
        });

        console.log("Joueur ajouté :", pseudoFinal, "| total =", joueurs.length);

        if (joueurs.length === 1) {
            socket.emit("waitingForPlayer");
        }

        if (joueurs.length === 2) {
            initialiserPartie();
            envoyerEtatATous();
        }
    });

    socket.on("sayUno", () => {
        if (!partie || partie.finDePartie) return;

        const joueur = getPlayer(socket.id);
        if (!joueur) return;

        if (joueur.unoEligible && !joueur.saidUno) {
            joueur.saidUno = true;
            envoyerEtatATous();
        }
    });

    socket.on("challengeUno", () => {
        if (!partie || partie.finDePartie) return;

        const adversaire = getOtherPlayer(socket.id);
        if (!adversaire) return;

        if (adversaire.unoEligible && !adversaire.saidUno) {
            piocherCartes(adversaire, 2);
            adversaire.unoEligible = false;
            adversaire.saidUno = false;
            io.emit("infoMessage", `${adversaire.pseudo} n'a pas dit UNO et pioche 2 cartes.`);
            envoyerEtatATous();
        }
    });

    socket.on("playCard", ({ index, chosenColor }) => {
        if (!partie || partie.finDePartie) return;
        if (partie.tour !== socket.id) return;

        const joueur = getPlayer(socket.id);
        const adversaire = getOtherPlayer(socket.id);
        if (!joueur || !adversaire) return;

        const carteChoisie = joueur.main[index];
        if (!carteChoisie) return;

        if (!estCarteJouable(carteChoisie, partie.carteCentrale, partie.couleurActive)) {
            socket.emit("errorMessage", "Cette carte ne peut pas être jouée.");
            return;
        }

        if ((carteChoisie.type === "wild" || carteChoisie.type === "draw4") && !chosenColor) {
            socket.emit("errorMessage", "Tu dois choisir une couleur.");
            return;
        }

        joueur.main.splice(index, 1);
        partie.carteCentrale = carteChoisie;

        if (carteChoisie.type === "wild" || carteChoisie.type === "draw4") {
            partie.couleurActive = chosenColor;
        } else {
            partie.couleurActive = carteChoisie.couleur;
        }

        joueur.unoEligible = false;
        joueur.saidUno = false;

        if (joueur.main.length === 1) {
            joueur.unoEligible = true;
            joueur.saidUno = false;
        }

        if (verifierVictoire()) {
            envoyerEtatATous();
            return;
        }

        switch (carteChoisie.type) {
            case "draw2":
                piocherCartes(adversaire, 2);
                partie.tour = joueur.id;
                break;

            case "draw4":
                piocherCartes(adversaire, 4);
                partie.tour = joueur.id;
                break;

            case "skip":
                partie.tour = joueur.id;
                break;

            case "reverse":
                partie.tour = joueur.id;
                break;

            default:
                partie.tour = adversaire.id;
                break;
        }

        envoyerEtatATous();
    });

    socket.on("drawCard", () => {
        if (!partie || partie.finDePartie) return;
        if (partie.tour !== socket.id) return;

        const joueur = getPlayer(socket.id);
        const adversaire = getOtherPlayer(socket.id);
        if (!joueur || !adversaire) return;

        if (partie.deck.length === 0) {
            socket.emit("errorMessage", "La pioche est vide.");
            return;
        }

        joueur.main.push(partie.deck.pop());
        partie.tour = adversaire.id;

        envoyerEtatATous();
    });

    socket.on("disconnect", () => {
        console.log("Déconnexion :", socket.id);
        joueurs = joueurs.filter(j => j.id !== socket.id);
        partie = null;
        io.emit("playerDisconnected");
    });
});

server.listen(PORT, () => {
    console.log(`Serveur lancé sur http://localhost:${PORT}`);
});