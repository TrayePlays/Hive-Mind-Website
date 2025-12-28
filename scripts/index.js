const socket = new WebSocket("wss://traye.ddns.net?from=website/ws");

// Fade in on load
window.onload = () => {
    document.body.classList.add("fade-in");
};

const themeToggle = document.getElementById("themeToggle");

themeToggle.onclick = () => {
    document.body.classList.toggle("light");

    if (document.body.classList.contains("light")) {
        themeToggle.textContent = "🌙"; // light mode → show moon
    } else {
        themeToggle.textContent = "☀️"; // dark mode → show sun
    }
};


document.getElementById("loginBtn").textContent = "Login";

document.getElementById("loginBtn").onclick = () => {
    const sessionId = document.getElementById("sessionInput").value.trim();
    const errorMsg = document.getElementById("errorMsg");

    if (!sessionId) {
        errorMsg.textContent = "Please enter a session ID";
        return;
    }

    socket.send(sessionId);

    socket.onmessage = (event) => {
        const msg = event.data;

        if (msg.startsWith("OK")) {
            const name = msg.slice(3).trim();
            sessionStorage.setItem("sessionId", sessionId);
            sessionStorage.setItem("connectedUser", name);
            sessionStorage.setItem("authenticated", "true");

            const overlay = document.getElementById("loadingOverlay");
            const loadingText = document.getElementById("loadingText");

            loadingText.textContent = `Welcome, ${name}...`;
            overlay.classList.add("show");

            setTimeout(() => {
                navigateWithFade("control.html");
            }, 1200);

        } else if (msg === "INVALID") {
            errorMsg.textContent = "Invalid session ID";
        } else if (msg === "ALREADY CONNECTED") {
            errorMsg.textContent = "Client is already connected to another browser.";
        }
    };
};

function navigateWithFade(url) {
    document.body.classList.remove("fade-in");
    document.body.classList.add("fade-out");

    setTimeout(() => {
        window.location.href = url;
    }, 500);
}
