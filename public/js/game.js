const pseudo = localStorage.getItem("pseudo");
const welcomeMessage = document.getElementById("welcomeMessage");
const opponentName = document.getElementById("opponentName");
const activeColor = document.getElementById("activeColor");

if (!pseudo) {
    window.location.href = "login.html";
}

welcomeMessage.textContent = "Bienvenue " + pseudo + " !";

const socket = io();

const playerCardsDiv = document.getElementById("playerCards");
const opponentCardsDiv = document.getElementById("opponentCards");
const discardPileDiv = document.getElementById("discardPile");
const drawPileDiv = document.getElementById("drawPile");
const unoButton = document.getElementById("unoButton");
const challengeUnoButton = document.getElementById("challengeUnoButton");

let etatJeu = null;

socket.emit("joinGame", pseudo);

socket.on("waitingForPlayer", () => {
    afficherMessage("En attente d'un deuxième joueur...");
});

socket.on("roomFull", () => {
    afficherMessage("La partie est déjà complète.");
});

socket.on("playerDisconnected", () => {
    afficherMessage("Un joueur s'est déconnecté. La partie a été réinitialisée.");
    viderJeu();
});

socket.on("errorMessage", (message) => {
    alert(message);
});

socket.on("infoMessage", (message) => {
    alert(message);
});

socket.on("gameState", (etat) => {
    etatJeu = etat;
    afficherJeu();
});

unoButton.addEventListener("click", () => {
    socket.emit("sayUno");
});

challengeUnoButton.addEventListener("click", () => {
    socket.emit("challengeUno");
});

function afficherJeu() {
    if (!etatJeu) return;

    opponentName.textContent = etatJeu.pseudoAdversaire;
    activeColor.textContent = "Couleur active : " + formatCouleur(etatJeu.couleurActive);
    afficherMessage(etatJeu.message);
    afficherMainJoueur();
    afficherAdversaire();
    afficherCarteCentrale();
    afficherPioche();

    unoButton.disabled = !etatJeu.canSayUno;
    challengeUnoButton.disabled = !etatJeu.canChallengeUno;
}

function afficherMainJoueur() {
    playerCardsDiv.innerHTML = "";

    etatJeu.main.forEach((carte, index) => {
        const img = document.createElement("img");
        img.src = carte.image;
        img.alt = "Carte joueur";
        img.classList.add("card-img");

        img.addEventListener("click", () => {
            if (etatJeu.finDePartie) return;

            if (!etatJeu.monTour) {
                alert("Ce n'est pas ton tour.");
                return;
            }

            let chosenColor = null;

            if (carte.type === "wild" || carte.type === "draw4") {
                const choix = prompt("Choisis une couleur : bleu, rouge, vert ou jaune");
                if (!choix) return;

                const valeur = choix.trim().toLowerCase();

                if (valeur === "bleu") chosenColor = "bleus";
                else if (valeur === "rouge") chosenColor = "rouges";
                else if (valeur === "vert") chosenColor = "verts";
                else if (valeur === "jaune") chosenColor = "jaunes";
                else {
                    alert("Couleur invalide.");
                    return;
                }
            }

            socket.emit("playCard", {
                index,
                chosenColor
            });
        });

        playerCardsDiv.appendChild(img);
    });
}

function afficherAdversaire() {
    opponentCardsDiv.innerHTML = "";

    for (let i = 0; i < etatJeu.nbCartesAdversaire; i++) {
        const img = document.createElement("img");
        img.src = "assets/cards/UNO_others/Verso.png";
        img.alt = "Carte adversaire";
        img.classList.add("card-img");
        opponentCardsDiv.appendChild(img);
    }
}

function afficherCarteCentrale() {
    discardPileDiv.innerHTML = "";

    if (!etatJeu.carteCentrale) return;

    const img = document.createElement("img");
    img.src = etatJeu.carteCentrale.image;
    img.alt = "Carte centrale";
    img.classList.add("card-img");
    discardPileDiv.appendChild(img);
}

function afficherPioche() {
    drawPileDiv.innerHTML = "";

    const img = document.createElement("img");
    img.src = "assets/cards/UNO_others/Verso.png";
    img.alt = "Pioche";
    img.classList.add("card-img");

    img.addEventListener("click", () => {
        if (!etatJeu) return;
        if (etatJeu.finDePartie) return;

        if (!etatJeu.monTour) {
            alert("Ce n'est pas ton tour.");
            return;
        }

        socket.emit("drawCard");
    });

    drawPileDiv.appendChild(img);
}

function afficherMessage(message) {
    let zoneMessage = document.getElementById("gameStatus");

    if (!zoneMessage) {
        zoneMessage = document.createElement("p");
        zoneMessage.id = "gameStatus";
        zoneMessage.classList.add("game-status");
        document.querySelector(".game-board").appendChild(zoneMessage);
    }

    zoneMessage.textContent = message;
}

function viderJeu() {
    playerCardsDiv.innerHTML = "";
    opponentCardsDiv.innerHTML = "";
    discardPileDiv.innerHTML = "";
    drawPileDiv.innerHTML = "";
    activeColor.textContent = "";
    unoButton.disabled = true;
    challengeUnoButton.disabled = true;
}

function formatCouleur(couleur) {
    if (couleur === "bleus") return "Bleu";
    if (couleur === "rouges") return "Rouge";
    if (couleur === "verts") return "Vert";
    if (couleur === "jaunes") return "Jaune";
    return "";
}