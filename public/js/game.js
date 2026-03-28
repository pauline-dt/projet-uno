const pseudo = localStorage.getItem("pseudo");
const welcomeMessage = document.getElementById("welcomeMessage");

if (pseudo) {
    welcomeMessage.textContent = "Bienvenue " + pseudo + " !";
} else {
    window.location.href = "login.html";
}

const playerCardsDiv = document.getElementById("playerCards");
const opponentCardsDiv = document.getElementById("opponentCards");
const discardPileDiv = document.getElementById("discardPile");
const drawPileDiv = document.getElementById("drawPile");

// ===== TEST AVEC TES VRAIES CARTES =====

// ⚠️ adapte les noms EXACTS si besoin
const testPlayerCards = [
    "assets/cards/UNO_bleus/5 Bleu.png",
    "assets/cards/UNO_rouges/+2 Rouge.png",
    "assets/cards/UNO_verts/9 Vert.png",
    "assets/cards/UNO_jaunes/3 Jaune.png"
];

// affichage joueur
testPlayerCards.forEach((cardPath) => {
    const img = document.createElement("img");
    img.src = cardPath;
    img.classList.add("card-img");
    playerCardsDiv.appendChild(img);
});

// adversaire (verso)
for (let i = 0; i < 7; i++) {
    const img = document.createElement("img");
    img.src = "assets/cards/UNO_others/Verso.png";
    img.classList.add("card-img");
    opponentCardsDiv.appendChild(img);
}

// carte centrale
const centerCard = document.createElement("img");
centerCard.src = "assets/cards/UNO_rouges/7 Rouge.png";
centerCard.classList.add("card-img");
discardPileDiv.appendChild(centerCard);

// pioche
const drawCard = document.createElement("img");
drawCard.src = "assets/cards/UNO_others/Verso.png";
drawCard.classList.add("card-img");
drawPileDiv.appendChild(drawCard);