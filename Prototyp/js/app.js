document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (username && password) {
        localStorage.setItem("is_logged_in", "true");
        alert("Login erfolgreich!");
        window.location.href = "entschuldigung.html";
    } else {
        alert("Bitte alle Felder ausfüllen.");
    }
});

document.getElementById("formEntschuldigung").addEventListener("submit", function(event) {
    event.preventDefault();
    const name = document.getElementById("name").value;
    const reason = document.getElementById("reason").value;

    if (name && reason) {
        alert("Entschuldigung eingereicht!");
        document.getElementById("formEntschuldigung").reset();
    } else {
        alert("Bitte alle Felder ausfüllen.");
    }
});
