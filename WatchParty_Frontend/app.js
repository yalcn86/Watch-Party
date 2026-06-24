const chatInput = document.getElementById('chatInput');
const chatMessages = document.getElementById('chatMessages');
const urlInput = document.getElementById('urlInput');
const createRoomBtn = document.getElementById('createRoomBtn');
const playerContainer = document.getElementById('player-container');

let player; // YouTube player object
let apiReady = false;
let pendingVideoId = null;

// Dynamic status badge color updates to fit the cyber theme
function updateSystemStatus(status, color) {
    const systemStatus = document.getElementById('systemStatus');
    if (systemStatus) {
        systemStatus.textContent = status;
        systemStatus.style.color = color;
    }
}

// 1. YouTube IFrame API Callback
window.onYouTubeIframeAPIReady = function () {
    apiReady = true;
    console.log("[SYSTEM]: YouTube IFrame API Ready");
    updateSystemStatus("READY", "var(--cyber-cyan)");

    // If a video load request was pending, trigger it now
    if (pendingVideoId) {
        const videoId = pendingVideoId;
        pendingVideoId = null;
        createPlayer(videoId);
    }
};

// Check if YouTube API is already loaded (useful since we added script in HTML)
if (typeof YT !== 'undefined' && typeof YT.Player !== 'undefined') {
    apiReady = true;
    updateSystemStatus("READY", "var(--cyber-cyan)");
} else {
    // If for some reason index.html script tag didn't load it yet, load it dynamically as a fallback
    updateSystemStatus("CONNECTING", "var(--text-muted)");
    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        if (firstScriptTag) {
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        } else {
            document.head.appendChild(tag);
        }
    }
}

// 2. Comprehensive YouTube Video ID Extractor
// Supports standard URLs, mobile URLs, embed URLs, Shorts, and direct 11-char IDs
function extractYouTubeId(url) {
    if (!url) return null;

    url = url.trim();

    const patterns = [
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&\s]+)/,
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^\/\?\s]+)/,
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([^\/\?\s]+)/,
        /(?:https?:\/\/)?youtu\.be\/([^\/\?\s]+)/,
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([^\/\?\s]+)/,
        /(?:https?:\/\/)?m\.youtube\.com\/watch\?v=([^&\s]+)/
    ];

    for (let pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1] && match[1].length === 11) {
            return match[1];
        }
    }

    // Fallback: Check if the input is directly an 11-character alphanumeric video ID
    if (url.length === 11 && /^[a-zA-Z0-9_-]{11}$/.test(url)) {
        return url;
    }

    return null;
}

// 3. Instantiate the Official YouTube Player
function createPlayer(videoId) {
    // Destroy existing player instance to prevent memory leaks and active event listener issues
    if (player && typeof player.destroy === 'function') {
        try {
            player.destroy();
            player = null;
        } catch (e) {
            console.warn("Failed to destroy existing player instance:", e);
        }
    }

    // Clean player-container and recreate the target div
    playerContainer.innerHTML = `<div id="yt-player"></div>`;

    updateSystemStatus("CONNECTING", "var(--cyber-cyan)");
    appendSystemMessage("[SYSTEM]: Connecting to YouTube Stream Services...");

    // Determine the safe origin for local environment to prevent postMessage sandbox/CORS errors
    let originUrl = '*';
    if (window.location.origin && window.location.origin !== 'null' && !window.location.origin.startsWith('file://')) {
        originUrl = window.location.origin;
    }

    try {
        player = new YT.Player('yt-player', {
            height: '100%',
            width: '100%',
            videoId: videoId,
            playerVars: {
                'autoplay': 1,
                'controls': 1,
                'rel': 0,
                'modestbranding': 1,
                'origin': originUrl,
                'enablejsapi': 1
            },
            events: {
                'onReady': (event) => {
                    updateSystemStatus("STREAMING", "var(--cyber-yellow)");
                    appendSystemMessage("[SYSTEM]: YouTube Stream established successfully.");
                    // Autoplay the video (muted play attempt if browser blocks sound auto-play)
                    event.target.playVideo();
                },
                'onStateChange': (event) => {
                    if (event.data === YT.PlayerState.PLAYING) {
                        updateSystemStatus("STREAMING", "var(--cyber-yellow)");
                    } else if (event.data === YT.PlayerState.PAUSED) {
                        updateSystemStatus("READY", "var(--cyber-cyan)");
                    } else if (event.data === YT.PlayerState.ENDED) {
                        updateSystemStatus("READY", "var(--cyber-cyan)");
                        appendSystemMessage("[SYSTEM]: Stream ended.");
                    }
                },
                'onError': (event) => {
                    updateSystemStatus("ERROR", "var(--cyber-red)");
                    console.error("YouTube Player Error code:", event.data);

                    let errorMsg = "Stream connection failed.";
                    if (event.data === 2) errorMsg = "Invalid video ID parameter.";
                    else if (event.data === 5) errorMsg = "HTML5 player loading error.";
                    else if (event.data === 100) errorMsg = "Video not found.";
                    else if (event.data === 101 || event.data === 150) errorMsg = "Playback in embedded players is restricted by owner.";

                    appendSystemMessage(`[ERROR]: ${errorMsg} (Code: ${event.data})`);
                }
            }
        });
    } catch (error) {
        updateSystemStatus("ERROR", "var(--cyber-red)");
        console.error("Failed to initialize YT.Player constructor:", error);
        appendSystemMessage("[ERROR]: Failed to initialize YouTube Player constructor.");
    }
}

// 4. Main trigger function
function initiateCyberStream(url) {
    const videoId = extractYouTubeId(url);

    if (!videoId) {
        appendSystemMessage("[ERROR]: Invalid YouTube URL. Paste a valid link.");
        return;
    }

    if (!apiReady) {
        pendingVideoId = videoId;
        appendSystemMessage("[SYSTEM]: YouTube API is still loading. Video will start automatically once API is active.");
        return;
    }

    createPlayer(videoId);
}

// 5. Append messages to chat UI
function appendChatMessage(user, text) {
    if (!chatMessages) return;
    const msgDiv = document.createElement('div');
    msgDiv.className = 'chat-line';
    msgDiv.innerHTML = `<span style="color: var(--cyber-cyan); font-weight: bold;">[${user}]:</span> <span style="color: #fff;">${text}</span>`;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function appendSystemMessage(text) {
    if (!chatMessages) return;
    const msgDiv = document.createElement('div');
    msgDiv.className = 'system-msg';
    msgDiv.innerText = text;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 6. User Interactions & Event Listeners
if (chatInput) {
    chatInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter' && chatInput.value.trim() !== '') {
            appendChatMessage("YALCIN", chatInput.value.trim());
            chatInput.value = '';
        }
    });
}

if (createRoomBtn) {
    createRoomBtn.addEventListener('click', function () {
        if (urlInput) initiateCyberStream(urlInput.value.trim());
    });
}