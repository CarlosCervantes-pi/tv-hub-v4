const http = require('http');
const url = require('url');

// Servidor en Node.js puro
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;

    // RUTAS Y CONTROLLERS (API)
    if (path.startsWith('/api/channels/')) {
        const id = path.split('/')[3];
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');

        // TODO 2 & 3: Simulación de consulta a BD y Controller (id: 1 existe, otros dan 404)
        if (id === '1') {
            res.writeHead(200);
            return res.end(JSON.stringify({
                channel: {
                    _id: "1",
                    name: "Mux Test Stream (Japan TV)",
                    country: "Japón",
                    categories: ["Noticias", "En vivo"],
                    streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
                    isActive: true
                }
            }));
        } else {
            res.writeHead(404);
            return res.end(JSON.stringify({
                status: 404,
                code: 'CHANNEL_NOT_FOUND',
                message: 'Channel was not found'
            }));
        }
    }

    // VISTA HTML + JS + SHAKA PLAYER
    if (path === '/watch.html' || path === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(`
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>TV Hub - Watch</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/shaka-player/4.3.6/shaka-player.compiled.js"></script>
  <style>
    body { font-family: sans-serif; background: #121212; color: white; padding: 20px; }
    .container { max-width: 800px; margin: auto; }
    video { width: 100%; height: 400px; background: #000; border-radius: 8px; }
    .state-box { padding: 15px; margin: 10px 0; border-radius: 5px; }
    .loading { background: #332b00; color: #ffeb3b; }
    .error { background: #3e1212; color: #f44336; }
    .playing { display: none; }
    button { padding: 10px 15px; background: #f44336; color: white; border: none; cursor: pointer; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <h1 id="channel-name">Cargando canal...</h1>
    <p>País: <strong id="channel-country">-</strong> | Categorías: <strong id="channel-categories">-</strong></p>

    <div id="player-loading" class="state-box loading" style="display:none;">
      <span>Preparing the live stream...</span>
    </div>
    
    <div id="player-error" class="state-box error" style="display:none;">
      <p id="player-error-message">This live stream cannot be played right now.</p>
      <button onclick="location.reload()">Try again</button>
    </div>

    <video id="video-player" controls autoplay></video>
  </div>

  <script>
    const urlParams = new URLSearchParams(window.location.search);
    const channelId = urlParams.get('id') || '1';
    let player = null;

    function showPlayerState(state, message) {
      document.querySelector('#player-loading').style.display = state === 'loading' ? 'block' : 'none';
      document.querySelector('#player-error').style.display = state === 'error' ? 'block' : 'none';
      if (message) document.querySelector('#player-error-message').textContent = message;
    }

    async function loadChannel() {
      try {
        // TODO 5: Fetch a la API
        const response = await fetch('/api/channels/' + channelId);
        if (!response.ok) throw new Error('Channel not found');
        
        const data = await response.json();
        const channel = data.channel;

        // TODO 6: Actualizar View (DOM)
        document.querySelector('#channel-name').textContent = channel.name;
        document.querySelector('#channel-country').textContent = channel.country;
        document.querySelector('#channel-categories').textContent = channel.categories.join(', ');

        // TODO 7 & 8: Reproducir con Shaka Player y gestionar estados
        const videoElement = document.querySelector('#video-player');
        player = new shaka.Player(videoElement);

        showPlayerState('loading', 'Preparing the live stream...');
        await player.load(channel.streamUrl);
        showPlayerState('playing', '');

      } catch (error) {
        showPlayerState('error', 'This live stream cannot be played right now.');
      }
    }

    document.addEventListener('DOMContentLoaded', loadChannel);
  </script>
</body>
</html>
    `);
    }

    res.writeHead(404);
    res.end('Not Found');
});

server.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000/watch.html?id=1');
});