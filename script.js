// Web version - no Electron dependencies
const CAT_IMAGE = './assets/image.png';

let currentTrack = {
    title: 'Out of Time',
    artist: 'The Weeknd',
    path: './song.mp3',
    artwork: CAT_IMAGE,
    favorite: false
};

// Try multiple audio formats
const audioFormats = [
    './song.mp3',
    './assets/song.mp3',
    './song.wav',
    './assets/song.wav',
    './song.m4a',
    './assets/song.m4a'
];

let isPlaying = false;
let audio = new Audio();

function updatePlayerUI() {
    document.getElementById('song-title').textContent = `${currentTrack.title} - ${currentTrack.artist}`;
    const artworkDiv = document.getElementById('mini-artwork');
    if (currentTrack.artwork) {
        artworkDiv.innerHTML = `<img src="${currentTrack.artwork}" alt="artwork" style="width:100%;height:100%;object-fit:cover;">`;
    } else {
        artworkDiv.innerHTML = '<i class="fas fa-music"></i>';
    }
    // Heart button
    const heartBtn = document.getElementById('favorite-btn');
    if (currentTrack.favorite) {
        heartBtn.classList.add('active');
    } else {
        heartBtn.classList.remove('active');
    }
    // Update heart rating display
    updateHeartRating();
}

async function tryAudioFormats() {
    for (const format of audioFormats) {
        try {
            console.log('Trying format:', format);
            const testAudio = new Audio();
            
            // Test if the file exists and can be loaded
            await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => reject(new Error('Timeout')), 3000);
                
                testAudio.addEventListener('canplay', () => {
                    clearTimeout(timeout);
                    resolve();
                });
                
                testAudio.addEventListener('error', () => {
                    clearTimeout(timeout);
                    reject(new Error('Cannot load'));
                });
                
                testAudio.src = format;
                testAudio.load();
            });
            
            console.log('✅ Found working audio format:', format);
            return format;
        } catch (e) {
            console.log('❌ Format failed:', format, e.message);
        }
    }
    throw new Error('No supported audio format found');
}

function playTrack() {
    // Show loading state
    document.querySelector('#play-btn i').className = 'fas fa-spinner fa-spin';
    
    tryAudioFormats().then(workingPath => {
        console.log('🎵 Using audio path:', workingPath);
        currentTrack.path = workingPath;
        audio.src = workingPath;
        
        return audio.play();
    }).then(() => {
        console.log('🎉 Audio playing successfully');
        isPlaying = true;
        document.querySelector('#play-btn i').className = 'fas fa-pause';
        updatePlayerUI();
    }).catch(e => {
        console.error('💥 Could not play audio:', e);
        // Reset to play button if failed
        isPlaying = false;
        document.querySelector('#play-btn i').className = 'fas fa-play';
        // Show error in title briefly
        const originalTitle = document.getElementById('song-title').textContent;
        document.getElementById('song-title').textContent = '❌ No audio file found';
        setTimeout(() => {
            document.getElementById('song-title').textContent = originalTitle;
        }, 4000);
        updatePlayerUI();
    });
}

function togglePlay() {
    if (!audio.src) {
        playTrack();
        return;
    }
    if (isPlaying) {
        audio.pause();
        isPlaying = false;
        document.querySelector('#play-btn i').className = 'fas fa-play';
    } else {
        audio.play().then(() => {
            isPlaying = true;
            document.querySelector('#play-btn i').className = 'fas fa-pause';
        }).catch(e => {
            console.log('Could not play audio:', e);
            isPlaying = false;
            document.querySelector('#play-btn i').className = 'fas fa-play';
        });
    }
}

function nextTrack() {
    // For single song, just restart
    playTrack();
}

function prevTrack() {
    // For single song, just restart
    playTrack();
}

function toggleFavorite() {
    currentTrack.favorite = !currentTrack.favorite;
    updatePlayerUI();
}

// Progress bar and time display logic
const progressBar = document.getElementById('progress-bar');
const currentTimeEl = document.getElementById('current-time');
const totalTimeEl = document.getElementById('total-time');

function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
        progressBar.value = (audio.currentTime / audio.duration) * 100;
        currentTimeEl.textContent = formatTime(audio.currentTime);
        totalTimeEl.textContent = formatTime(audio.duration);
    }
});

audio.addEventListener('loadedmetadata', () => {
    totalTimeEl.textContent = formatTime(audio.duration);
});

progressBar.addEventListener('input', (e) => {
    if (audio.duration) {
        audio.currentTime = (e.target.value / 100) * audio.duration;
    }
});

audio.addEventListener('ended', nextTrack);

// Event listeners
document.getElementById('play-btn').addEventListener('click', togglePlay);
document.getElementById('next-btn').addEventListener('click', nextTrack);
document.getElementById('prev-btn').addEventListener('click', prevTrack);
document.getElementById('favorite-btn').addEventListener('click', toggleFavorite);

// Additional functionality: Auto-play on page load (optional)
// Uncomment the line below if you want the song to start automatically
// audio.autoplay = true;

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    switch(e.code) {
        case 'Space':
            e.preventDefault();
            togglePlay();
            break;
        case 'ArrowLeft':
            e.preventDefault();
            prevTrack();
            break;
        case 'ArrowRight':
            e.preventDefault();
            nextTrack();
            break;
        case 'KeyF':
            e.preventDefault();
            toggleFavorite();
            break;
    }
});

// Visual feedback for heart rating
function updateHeartRating() {
    const hearts = document.querySelectorAll('.mini-hearts i');
    const rating = currentTrack.favorite ? 5 : 0;
    
    hearts.forEach((heart, index) => {
        if (index < rating) {
            heart.classList.add('active');
        } else {
            heart.classList.remove('active');
        }
    });
}

// Initialize the player
updatePlayerUI();
