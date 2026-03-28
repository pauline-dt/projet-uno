const pseudo = localStorage.getItem("pseudo");
const welcomeMessage = document.getElementById("welcomeMessage");

if (pseudo) {
    welcomeMessage.textContent = "Bienvenue " + pseudo + " !";
} else {
    window.location.href = "login.html";
}