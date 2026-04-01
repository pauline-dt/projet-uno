// ===== PSEUDO =====
const pseudo = localStorage.getItem("pseudo");
const welcomeMessage = document.getElementById("welcomeMessage");

if (pseudo) {
    welcomeMessage.textContent = "Bienvenue " + pseudo + " !";
} else {
    window.location.href = "login.html";
}

// ===== DOM =====
const playerCardsDiv = document.getElementById("playerCards");
const opponentCardsDiv = document.getElementById("opponentCards");
const discardPileDiv = document.getElementById("discardPile");
const drawPileDiv = document.getElementById("drawPile");

// ===== CONFIG COULEURS =====
const couleurs = [
    { dossier: "bleus", nomFichier: "Bleu" },
    { dossier: "rouges", nomFichier: "Rouge" },
    { dossier: "verts", nomFichier: "Vert" },
    { dossier: "jaunes", nomFichier: "Jaune" }
];

// ===== FONCTIONS UNO =====

// créer le deck
function creerDeck() {
    const deck = [];

    couleurs.forEach(couleur => {
        for (let i = 0; i <= 9; i++) {
            deck.push({
                couleur: couleur.dossier,
                valeur: i,
                image: `assets/cards/UNO_${couleur.dossier}/${i} ${couleur.nomFichier}.png`
            });
        }
    });

    return deck;
}

// mélanger
function melanger(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

// distribuer
function distribuer(deck) {
    const joueur = deck.splice(0, 7);
    const adversaire = deck.splice(0, 7);
    const carteCentrale = deck.pop();

    return { joueur, adversaire, carteCentrale, deck };
}

// ===== LANCEMENT =====
const deck = creerDeck();
melanger(deck);

const partie = distribuer(deck);

// ===== AFFICHAGE =====

// joueur
playerCardsDiv.innerHTML = "";

partie.joueur.forEach((carte) => {
    const img = document.createElement("img");
    img.src = carte.image;
    img.classList.add("card-img");
    img.alt = "Carte UNO";
    playerCardsDiv.appendChild(img);
});

// adversaire
opponentCardsDiv.innerHTML = "";

for (let i = 0; i < partie.adversaire.length; i++) {
    const img = document.createElement("img");
    img.src = "assets/cards/UNO_others/Verso.png";
    img.classList.add("card-img");
    img.alt = "Carte adversaire";
    opponentCardsDiv.appendChild(img);
}

// carte centrale
discardPileDiv.innerHTML = "";

const centerCard = document.createElement("img");
centerCard.src = partie.carteCentrale.image;
centerCard.classList.add("card-img");
centerCard.alt = "Carte centrale";
discardPileDiv.appendChild(centerCard);

// pioche
drawPileDiv.innerHTML = "";

const drawCard = document.createElement("img");
drawCard.src = "assets/cards/UNO_others/Verso.png";
drawCard.classList.add("card-img");
drawCard.alt = "Pioche";
drawPileDiv.appendChild(drawCard);