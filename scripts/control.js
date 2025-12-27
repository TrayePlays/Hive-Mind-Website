// Prevent direct access to control panel
if (!sessionStorage.getItem("authenticated")) {
    window.location.href = "index.html";
}

const pl = document.getElementById("connectedPlayer")

pl.textContent = `Connected Client: ${sessionStorage.getItem("connectedUser")}`

// Fade in page
window.onload = () => {
    document.body.classList.add("fade-in");
};

const socket = new WebSocket("ws://traye.ddns.net?from=website");

socket.onopen = () => {
    const sessionId = sessionStorage.getItem("sessionId");

    if (!sessionId) {
        window.location.href = "index.html";
        return;
    }

    socket.send(sessionId); // re-authenticate
};

socket.onmessage = (event) => {
    const msg = event.data;

    if (msg === "INVALID" || msg === "DISCONNECTED") {
        sessionStorage.clear();
        window.location.href = "index.html";
        return;
    }

    // Server requests a frame
    if (msg === "requestFrame") {
        if (stream) captureOneFrame();
    }

    console.log("Server:", msg);
};

socket.onclose = () => {
    if (sessionStorage.getItem("authenticated")) {
        window.location.href = "index.html";
    }
};

let colorMode = document.getElementById("colorModeSelect");

document.getElementById("colorModeSelect").onchange = (e) => {
    colorMode = e.target.value;
};

const themeToggle = document.getElementById("themeToggle");

themeToggle.onclick = () => {
    document.body.classList.toggle("light");
    themeToggle.textContent = document.body.classList.contains("light") ? "🌙" : "☀️";
};

let stream;
let videoTrack;

document.getElementById("shareBtn").onclick = async () => {
    try {
        stream = await navigator.mediaDevices.getDisplayMedia({ video: true });

        document.getElementById("screenVideo").srcObject = stream;
        videoTrack = stream.getVideoTracks()[0];
        videoTrack.onended = stopPixelProcessing;
        socket.send(JSON.stringify({
            type: "screenShare",
            start: true
        }))

    } catch (err) {
        console.error("Screen share error:", err);
    }
};

function stopPixelProcessing() {
    if (videoTrack) {
        videoTrack.stop();
        videoTrack = null;
    }

    document.getElementById("screenVideo").srcObject = null;

    socket.send(JSON.stringify({
        type: "screen-share-stopped"
    }));

    console.log("Screen share stopped.");
}

const colorBlocks = [
    // Reds
    { r: 142, g: 33, b: 33, id: "red_concrete" },
    { r: 207, g: 62, b: 62, id: "red_wool" },
    { r: 161, g: 83, b: 37, id: "orange_terracotta" },
    { r: 224, g: 97, b: 0, id: "orange_concrete" },

    // Yellows
    { r: 240, g: 175, b: 21, id: "yellow_concrete" },
    { r: 249, g: 199, b: 35, id: "yellow_wool" },

    // Greens
    { r: 73, g: 91, b: 36, id: "green_terracotta" },
    { r: 94, g: 124, b: 22, id: "green_concrete" },
    { r: 127, g: 204, b: 25, id: "lime_concrete" },
    { r: 112, g: 185, b: 25, id: "lime_wool" },

    // Cyans / Teals
    { r: 21, g: 119, b: 136, id: "cyan_concrete" },
    { r: 20, g: 133, b: 158, id: "cyan_wool" },
    { r: 76, g: 84, b: 82, id: "cyan_terracotta" },

    // Blues
    { r: 44, g: 46, b: 143, id: "blue_concrete" },
    { r: 53, g: 57, b: 157, id: "blue_wool" },
    { r: 74, g: 59, b: 91, id: "purple_terracotta" },

    // Purples
    { r: 100, g: 31, b: 156, id: "purple_concrete" },
    { r: 121, g: 42, b: 172, id: "purple_wool" },

    // Pinks
    { r: 214, g: 101, b: 143, id: "pink_concrete" },
    { r: 237, g: 141, b: 172, id: "pink_wool" },

    // Browns
    { r: 96, g: 59, b: 31, id: "brown_concrete" },
    { r: 131, g: 84, b: 50, id: "brown_wool" },
    { r: 77, g: 51, b: 35, id: "brown_terracotta" },

    // Grays
    { r: 55, g: 58, b: 62, id: "gray_concrete" },
    { r: 83, g: 89, b: 94, id: "light_gray_concrete" },
    { r: 130, g: 130, b: 130, id: "light_gray_wool" },

    // Whites
    { r: 207, g: 213, b: 214, id: "white_concrete" },
    { r: 233, g: 236, b: 236, id: "white_wool" },
    { r: 255, g: 255, b: 255, id: "snow" },

    // Blacks
    { r: 8, g: 10, b: 15, id: "black_concrete" },
    { r: 21, g: 21, b: 26, id: "black_wool" },

    // Add all concrete powders (clean colors)
    { r: 207, g: 62, b: 62, id: "red_concrete_powder" },
    { r: 224, g: 97, b: 0, id: "orange_concrete_powder" },
    { r: 240, g: 175, b: 21, id: "yellow_concrete_powder" },
    { r: 127, g: 204, b: 25, id: "lime_concrete_powder" },
    { r: 21, g: 119, b: 136, id: "cyan_concrete_powder" },
    { r: 44, g: 46, b: 143, id: "blue_concrete_powder" },
    { r: 100, g: 31, b: 156, id: "purple_concrete_powder" },
    { r: 214, g: 101, b: 143, id: "pink_concrete_powder" },
    { r: 96, g: 59, b: 31, id: "brown_concrete_powder" },
    { r: 55, g: 58, b: 62, id: "gray_concrete_powder" },
    { r: 83, g: 89, b: 94, id: "light_gray_concrete_powder" },
    { r: 207, g: 213, b: 214, id: "white_concrete_powder" },
    { r: 8, g: 10, b: 15, id: "black_concrete_powder" },

    // Terracotta full set (clean muted colors)
    { r: 150, g: 88, b: 62, id: "terracotta" },
    { r: 162, g: 84, b: 38, id: "orange_terracotta" },
    { r: 188, g: 133, b: 36, id: "yellow_terracotta" },
    { r: 103, g: 117, b: 52, id: "lime_terracotta" },
    { r: 57, g: 67, b: 89, id: "blue_terracotta" },
    { r: 118, g: 70, b: 86, id: "magenta_terracotta" },
    { r: 86, g: 51, b: 62, id: "purple_terracotta" },
    { r: 37, g: 23, b: 16, id: "brown_terracotta" },
    { r: 135, g: 106, b: 97, id: "light_gray_terracotta" },
    { r: 83, g: 58, b: 36, id: "brown_terracotta" },

    // --- NEW: BRIGHT REDS ---
    { r: 180, g: 0, b: 0, id: "redstone_block" },
    { r: 171, g: 27, b: 27, id: "nether_wart_block" },

    // --- NEW: BRIGHT GREENS ---
    { r: 0, g: 168, b: 0, id: "emerald_block" },
    { r: 22, g: 126, b: 34, id: "warped_wart_block" },

    // --- NEW: AQUA / TURQUOISE ---
    { r: 0, g: 180, b: 180, id: "prismarine" },
    { r: 0, g: 135, b: 135, id: "dark_prismarine" },
    { r: 43, g: 121, b: 153, id: "warped_planks" },
    { r: 22, g: 126, b: 134, id: "warped_stem" },
    { r: 22, g: 126, b: 134, id: "warped_hyphae" },

    // --- NEW: BRIGHT BLUES ---
    { r: 38, g: 67, b: 137, id: "lapis_block" },
    { r: 125, g: 175, b: 255, id: "blue_ice" },

    // --- NEW: BRIGHT YELLOW ---
    { r: 255, g: 236, b: 79, id: "gold_block" },

    // --- NEW: BRIGHT MAGENTA ---
    { r: 194, g: 73, b: 183, id: "magenta_concrete" }
];

function findClosestBlock(r, g, b) {
    let best = colorBlocks[0];
    let bestDist = Infinity;

    for (const block of colorBlocks) {
        const dr = r - block.r;
        const dg = g - block.g;
        const db = b - block.b;

        const dist = dr * dr + dg * dg + db * db;

        if (dist < bestDist) {
            bestDist = dist;
            best = block;
        }
    }

    return best.id;
}


const multibit = [
    { b: 10, id: "black_concrete" },
    { b: 46, id: "gray_concrete" },
    { b: 68, id: "cyan_terracotta" },
    { b: 86, id: "light_gray_concrete" },
    { b: 92, id: "cobblestone" },
    { b: 112, id: "stone" },
    { b: 125, id: "smooth_stone" },
    { b: 132, id: "clay" },
    { b: 168, id: "white_concrete" },
    { b: 188, id: "smooth_quartz" },
    { b: 200, id: "snow" }
];

function captureOneFrame() {
    if (!stream) return;

    const canvas = document.getElementById("pixelCanvas");
    const ctx = canvas.getContext("2d");

    const resolution = document.getElementById("resolutionSelect").value;
    const [w, h] = resolution.split("x").map(Number);

    canvas.width = w;
    canvas.height = h;

    const video = document.getElementById("screenVideo");

    if (video.readyState < 2) {
        console.warn("Video not ready yet");
        return;
    }

    ctx.drawImage(video, 0, 0, w, h);

    const frame = ctx.getImageData(0, 0, w, h);
    const data = frame.data;

    let pixels = [];

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        let blockId;
        if (colorMode === "bw") {
            const brightness = (r + g + b) / 3;
            if (brightness > 128) blockId = "white_concrete"
            else blockId = "black_concrete"
        } else if (colorMode === "grayscale") {
            const brightness = (r + g + b) / 3;

            let best = multibit[0];
            let bestDiff = Math.abs(brightness - best.b);

            for (let j = 1; j < multibit.length; j++) {
                const diff = Math.abs(brightness - multibit[j].b);
                if (diff < bestDiff) {
                    best = multibit[j];
                    bestDiff = diff;
                }
            }

            blockId = best.id;

        } else {
            let best = colorBlocks[0];
            let bestDist = Infinity;

            for (const block of colorBlocks) {
                const dr = r - block.r;
                const dg = g - block.g;
                const db = b - block.b;
                const dist = dr * dr + dg * dg + db * db;

                if (dist < bestDist) {
                    bestDist = dist;
                    best = block;
                }
            }

            blockId = best.id;
        }

        pixels.push(blockId);
    }

    sendPixelFrame(pixels, w, h);
}

function sendPixelFrame(pixels, width, height) {
    socket.send(JSON.stringify({
        type: "screenShare",
        width,
        height,
        pixels
    }));
}

const settingsBtn = document.getElementById("settingsBtn");
const settingsPopup = document.getElementById("settingsPopup");
const closeSettings = document.getElementById("closeSettings");

settingsBtn.onclick = () => {
    settingsPopup.style.display = "block";
};

closeSettings.onclick = () => {
    settingsPopup.style.display = "none";
};

document.getElementById("cmdSubmit").onclick = () => {
    const cmd = document.getElementById("cmdInput").value.trim();
    if (!cmd) return;

    socket.send(JSON.stringify({
        type: "websiteCMD",
        cmd
    }));

    document.getElementById("cmdInput").value = "";
};
