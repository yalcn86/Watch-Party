// Please see documentation at https://learn.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.
// IKARUS // WATCH PARTY - CORE SYSTEM MOTORS
const chatInput = document.getElementById('chatInput');
const chatMessages = document.getElementById('chatMessages');
const urlInput = document.getElementById('urlInput');
const createRoomBtn = document.getElementById('createRoomBtn');
const playerContainer = document.getElementById('player-container');

let player; // YouTube Player nesnesi

// 1. YouTube IFrame API'sini güvenli protokol (HTTPS) ile enjekte et
const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// 2. YouTube URL'sinden 11 haneli benzersiz Video ID'sini ayıklayan akıllı regex
function extractYouTubeId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

// 3. Kestrel Sunucusu üzerinden gelen yayını tetikleyen ana fonksiyon
function initiateCyberStream(url) {
    const videoId = extractYouTubeId(url);

    if (!videoId) {
        appendSystemMessage("[ERROR]: Invalid YouTube URL. Verification failed.");
        return;
    }

    appendSystemMessage("[SYSTEM]: Connecting to YouTube Stream Core Services...");

    // Eski oynatıcı kalıntılarını temizle ve API için hedef div'i oluştur
    playerContainer.innerHTML = `<div id="yt-player" style="width:100%; height:100%;"></div>`;

    // Global YT nesnesinin hazır olduğundan emin olarak oynatıcıyı ayağa kaldır
    player = new YT.Player('yt-player', {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
            'autoplay': 1,
            'controls': 1,
            'rel': 0,
            'modestbranding': 1,
            'origin': window.location.origin // Güvenlik sertifikasını YouTube'a doğrulatıyoruz
        },
        events: {
            'onReady': () => {
                appendSystemMessage("[SYSTEM]: Cyber-link established. Stream active.");
            },
            'onError': (e) => {
                appendSystemMessage(`[ERROR]: Stream interrupted. Code: ${e.data}`);
            }
        }
    });
}

// 4. Sohbet akışını kontrol eden fonksiyon
function appendChatMessage(user, text) {
    if (!chatMessages) return;
    const msgDiv = document.createElement('div');
    msgDiv.className = 'chat-line';
    msgDiv.innerHTML = `<span style="color: #00f0ff; font-weight: bold;">[${user}]:</span> <span style="color: #fff;">${text}</span>`;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight; // Otomatik aşağı kaydırma
}

// 5. Sistem loglarını basan fonksiyon
function appendSystemMessage(text) {
    if (!chatMessages) return;
    const msgDiv = document.createElement('div');
    msgDiv.className = 'system-msg';
    msgDiv.innerText = text;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Komuta Merkezinde Enter ile mesaj gönderme dinleyicisi
if (chatInput) {
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && chatInput.value.trim() !== '') {
            appendChatMessage("YALCIN", chatInput.value.trim());
            chatInput.value = '';
        }
    });
}

// INITIATE butonuna tıklandığında akışı başlat
if (createRoomBtn) {
    createRoomBtn.addEventListener('click', function() {
        if (urlInput) initiateCyberStream(urlInput.value.trim());
    });
}