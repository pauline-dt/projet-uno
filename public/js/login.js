const form = document.getElementById("loginForm");

form.addEventListener("submit", function (event) {
    event.preventDefault();

    const pseudo = document.getElementById("pseudo").value.trim();

    if (pseudo !== "") {
        localStorage.setItem("pseudo", pseudo);
        window.location.href = "game.html";
    }
});