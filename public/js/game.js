// pseudo
const pseudo = localStorage.getItem("pseudo");
const welcomeMessage = document.getElementById("welcomeMessage");

if (pseudo) {
    welcomeMessage.textContent = "Bienvenue " + pseudo + " !";
} else {
    window.location.href = "login.html";
}

// dom
const playerCardsDiv = document.getElementById("playerCards");
const opponentCardsDiv = document.getElementById("opponentCards");
const discardPileDiv = document.getElementById("discardPile");
const drawPileDiv = document.getElementById("drawPile");

// couleurs
const couleurs = [
    { dossier: "bleus", nomFichier: "Bleu" },
    { dossier: "rouges", nomFichier: "Rouge" },
    { dossier: "verts", nomFichier: "Vert" },
    { dossier: "jaunes", nomFichier: "Jaune" }
];

// fonctions
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

function melanger(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

function distribuer(deck) {
    const joueur = deck.splice(0, 7);
    const adversaire = deck.splice(0, 7);
    const carteCentrale = deck.pop();

    return { joueur, adversaire, carteCentrale, deck };
}

function estCarteJouable(carte, carteCentrale) {
    return (
        carte.couleur === carteCentrale.couleur ||
        carte.valeur === carteCentrale.valeur
    );
}

// partie
const deck = creerDeck();
melanger(deck);

const partie = distribuer(deck);

// affichage
function afficherJeu() {
    afficherMainJoueur();
    afficherAdversaire();
    afficherCarteCentrale();
    afficherPioche();
}

function afficherMainJoueur() {
    playerCardsDiv.innerHTML = "";

    partie.joueur.forEach((carte, index) => {
        const img = document.createElement("img");
        img.src = carte.image;
        img.classList.add("card-img");
        img.alt = "Carte UNO";

        img.addEventListener("click", () => {
            jouerCarte(index);
        });

        playerCardsDiv.appendChild(img);
    });
}

function afficherAdversaire() {
    opponentCardsDiv.innerHTML = "";

    for (let i = 0; i < partie.adversaire.length; i++) {
        const img = document.createElement("img");
        img.src = "assets/cards/UNO_others/Verso.png";
        img.classList.add("card-img");
        img.alt = "Carte adversaire";
        opponentCardsDiv.appendChild(img);
    }
}

function afficherCarteCentrale() {
    discardPileDiv.innerHTML = "";

    const centerCard = document.createElement("img");
    centerCard.src = partie.carteCentrale.image;
    centerCard.classList.add("card-img");
    centerCard.alt = "Carte centrale";
    discardPileDiv.appendChild(centerCard);
}

function afficherPioche() {
    drawPileDiv.innerHTML = "";

    const drawCard = document.createElement("img");
    drawCard.src = "assets/cards/UNO_others/Verso.png";
    drawCard.classList.add("card-img");
    drawCard.alt = "Pioche";
    drawPileDiv.appendChild(drawCard);
}

// actions
function jouerCarte(index) {
    const carteChoisie = partie.joueur[index];

    if (estCarteJouable(carteChoisie, partie.carteCentrale)) {
        partie.carteCentrale = carteChoisie;
        partie.joueur.splice(index, 1);
        afficherJeu();

        if (partie.joueur.length === 0) {
            alert("Bravo, tu as gagné !");
        }
    } else {
        alert("Cette carte ne peut pas être jouée.");
    }
}

// lancement
afficherJeu();