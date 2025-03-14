// API Configuration
const APIS = {
    YOUTUBE: {
        key: 'YOUR_YOUTUBE_API_KEY',
        search: async (query) => {
            const res = await fetch(
                `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&key=${APIS.YOUTUBE.key}&maxResults=5`
            );
            return res.json();
        }
    },
    AUDIOMACK: {
        key: 'YOUR_AUDIOMACK_KEY',
        search: async (query) => {
            const res = await fetch(
                `https://api.audiomack.com/v1/search?q=${query}&client_id=${APIS.AUDIOMACK.key}`
            );
            return res.json();
        }
    },
    SOUNDCLOUD: {
        clientId: 'YOUR_SOUNDCLOUD_CLIENT_ID',
        search: async (query) => {
            const res = await fetch(
                `https://api.soundcloud.com/tracks?q=${query}&client_id=${APIS.SOUNDCLOUD.clientId}`
            );
            return res.json();
        }
    }
};

// Unified Search Function
async function searchMusic(query, platform = 'all') {
    try {
        const results = [];
        
        if (platform === 'all' || platform === 'youtube') {
            const ytData = await APIS.YOUTUBE.search(query);
            results.push(...ytData.items.map(item => ({
                ...item,
                platform: 'youtube'
            }));
        }

        if (platform === 'all' || platform === 'audiomack') {
            const amData = await APIS.AUDIOMACK.search(query);
            results.push(...amData.results.map(item => ({
                ...item,
                platform: 'audiomack'
            }));
        }

        if (platform === 'all' || platform === 'soundcloud') {
            const scData = await APIS.SOUNDCLOUD.search(query);
            results.push(...scData.map(item => ({
                ...item,
                platform: 'soundcloud'
            })));
        }

        return results;
    } catch (error) {
        console.error('Search Error:', error);
        return [];
    }
}

// Updated Display Function
function displayResults(results) {
    resultsContainer.innerHTML = '';
    
    results.forEach(item => {
        const card = document.createElement('div');
        card.className = `music-card ${item.platform}`;
        
        let downloadUrl = '';
        switch(item.platform) {
            case 'youtube':
                downloadUrl = `https://ytdl.vercel.app/api/download?id=${item.id.videoId}`;
                break;
            case 'audiomack':
                downloadUrl = item.download_url || item.stream_url;
                break;
            case 'soundcloud':
                downloadUrl = `https://soundcloud.com/${item.permalink_url}`;
                break;
        }

        card.innerHTML = `
            <h3>${item.snippet?.title || item.title}</h3>
            <p>${item.snippet?.channelTitle || item.user?.username || ''}</p>
            <div class="card-footer">
                <span class="platform-tag">${item.platform}</span>
                <a href="${downloadUrl}" class="download-btn" target="_blank">
                    <i class="fas fa-download"></i> Get Track
                </a>
            </div>
        `;
        resultsContainer.appendChild(card);
    });
}

// Platform Filter Handler
document.querySelectorAll('.platform-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
        document.querySelectorAll('.platform-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const platform = btn.dataset.platform;
        const results = await searchMusic(searchInput.value, platform);
        displayResults(results);
    });
})
