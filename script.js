const imagePathsToPreload = [
    'images/gini_1.png', 'images/gini_2.png', 'images/rabbit.png',
    'images/game_over_gini_1.png', 'images/game_over_gini_1_water.png',
    'images/game_over_gini_2.png', 'images/game_over_gini_2_water.png',
    'images/game_over_rabbit.png', 'images/game_over_rabbit_water.png',
    'images/poop.png', 'images/poop_rabbit.png', 'images/water.png',
    'images/테마배경.jpg'
];
const preloadedImages = {}; 

imagePathsToPreload.forEach(path => {
    const img = new Image();
    img.src = path;
    preloadedImages[path] = img; 
});

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const scoreElement = document.getElementById('score');
const bestScoreElement = document.getElementById('bestScore');
const initialScreen = document.getElementById('initialScreen');
const gameOverScreen = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');
const finalBestScoreElement = document.getElementById('finalBestScore');
const countdownElement = document.getElementById('countdown');

const gameOverImgElement = document.getElementById('gameOverImg');
const gameOverPlaceholder = document.getElementById('gameOverPlaceholder');

const startBtn = document.getElementById('start-btn');
const langBtn = document.getElementById('lang-btn');
const soundBtn = document.getElementById('sound-btn');
const captureBtn = document.getElementById('capture-btn'); 
const copyBtn = document.getElementById('copy-btn');
const shareXBtn = document.getElementById('share-x-btn');
const restartGameBtn = document.getElementById('restart-game-btn');

const btnLeft = document.getElementById('btn-left');   
const btnRight = document.getElementById('btn-right'); 

const char1Btn = document.getElementById('char1-btn');
const char2Btn = document.getElementById('char2-btn');
const char3Btn = document.getElementById('char3-btn');

const filterBtn = document.getElementById('filter-btn');
const filterImg = document.getElementById('filter-img');
const tFilterText = document.getElementById('t-filterText');

let isSoundOn = true;
let isWaterMode = false; 

let gameStartTime = 0;
let playTime = 0;

const audioCache = { gini: [], rabbit: [] };
try {
    for (let i = 1; i <= 7; i++) {
        audioCache.gini.push(new Audio(`sounds/gini_sound_${i}.mp3`));
    }
    for (let i = 1; i <= 5; i++) {
        audioCache.rabbit.push(new Audio(`sounds/rabbit_sound_${i}.mp3`));
    }
} catch(e) {}

soundBtn.addEventListener('click', () => {
    isSoundOn = !isSoundOn;
    if (isSoundOn) {
        soundBtn.innerText = "SOUND ON";
        soundBtn.classList.remove('sound-off');
    } else {
        soundBtn.innerText = "SOUND OFF";
        soundBtn.classList.add('sound-off');
    }
});

const i18n = {
    en: {
        score: "SCORE", best: "BEST", title: "POOP DODGE",
        desc: "Select Character<br>& Start", startBtn: "START",
        gameover: "GAME OVER", finalScore: "SCORE", finalBest: "BEST",
        finalTime: "TIME", 
        restart: "✨ Change Character ✨", 
        selectChar: "SELECT<br>CHAR",
        captureBtn: "Save Image", copyBtn: "Copy Result", shareXBtn: "Share on X", restartGameBtn: "RESTART",
        filterWater: "CLEAN MODE", 
        filterPoop: "POOP MODE"   
    },
    kr: {
        score: "점수", best: "최고 점수", title: "똥 피하기",
        desc: "캐릭터 선택 후<br>시작하세요", startBtn: "시작",
        gameover: "게임 오버", finalScore: "점수", finalBest: "최고 점수",
        finalTime: "생존 시간", 
        restart: "✨ 캐릭터 변경 가능 ✨", 
        selectChar: "캐릭터<br>선택",
        captureBtn: "이미지 저장", copyBtn: "결과 복사", shareXBtn: "X 공유", restartGameBtn: "다시 시작",
        filterWater: "클린 모드",
        filterPoop: "똥 모드"
    }
};

let currentLang = 'kr'; 

function applyLanguage() {
    const lang = i18n[currentLang];
    
    document.getElementById('t-score').innerText = lang.score;
    document.getElementById('t-best').innerText = lang.best;
    document.getElementById('t-title').innerText = lang.title;
    document.getElementById('t-desc').innerHTML = lang.desc;
    document.getElementById('start-btn').innerText = lang.startBtn;
    document.getElementById('t-gameover').innerText = lang.gameover;
    document.getElementById('t-finalScore').innerText = lang.finalScore;
    document.getElementById('t-finalBest').innerText = lang.finalBest;
    document.getElementById('t-finalTime').innerText = lang.finalTime; 
    document.getElementById('t-restart').innerText = lang.restart; 
    document.getElementById('t-selectChar').innerHTML = lang.selectChar;
    tFilterText.innerText = isWaterMode ? lang.filterPoop : lang.filterWater; 
    
    if (captureBtn) captureBtn.innerText = lang.captureBtn;
    if (copyBtn) copyBtn.innerText = lang.copyBtn;
    if (shareXBtn) shareXBtn.innerText = lang.shareXBtn;
    if (restartGameBtn) restartGameBtn.innerText = lang.restartGameBtn;
}

langBtn.addEventListener('click', () => {
    currentLang = currentLang === 'kr' ? 'en' : 'kr';
    applyLanguage();
});

filterBtn.addEventListener('click', () => {
    isWaterMode = !isWaterMode;
    const lang = i18n[currentLang];

    if (isWaterMode) {
        poopImg.src = 'images/water.png';
        gameOverImg.src = selectedCharacter.gameOverSrcWater;
        filterImg.src = 'images/poop.png';
        filterImg.classList.add('censored');
        tFilterText.innerText = lang.filterPoop;
    } else {
        poopImg.src = selectedCharacter.poopSrc;
        gameOverImg.src = selectedCharacter.gameOverSrc;      
        filterImg.src = 'images/water.png';
        filterImg.classList.remove('censored');
        tFilterText.innerText = lang.filterWater;
    }
});

const characters = [
    { src: 'images/gini_1.png', width: 40, height: 30, gameOverSrc: 'images/game_over_gini_1.png', gameOverSrcWater: 'images/game_over_gini_1_water.png', poopSrc: 'images/poop.png', soundType: 'gini' },
    { src: 'images/gini_2.png', width: 40, height: 30, gameOverSrc: 'images/game_over_gini_2.png', gameOverSrcWater: 'images/game_over_gini_2_water.png', poopSrc: 'images/poop.png', soundType: 'gini' },
    { src: 'images/rabbit.png', width: 60, height: 50, gameOverSrc: 'images/game_over_rabbit.png', gameOverSrcWater: 'images/game_over_rabbit_water.png', poopSrc: 'images/poop_rabbit.png', soundType: 'rabbit' },
];

let selectedCharacter = characters[0]; 
const playerImg = new Image();
const poopImg = new Image();
const gameOverImg = new Image();

let score = 0;
let bestScore = 0;

try {
    bestScore = parseInt(localStorage.getItem('dodgeGameBestScore')) || 0;
} catch(e) {
    bestScore = 0;
}
bestScoreElement.innerText = bestScore;

let gameLoop;
let isPlaying = false; 
let isGameOver = false; 
let isCountingDown = false;

const FLOOR_Y = 570; 

let player = {
    x: 0,
    y: FLOOR_Y - selectedCharacter.height, 
    width: selectedCharacter.width,
    height: selectedCharacter.height,
    speed: 6.5, 
    dx: 0,
    facingRight: false 
};

let poops = [];

function selectCharacter(index, btn) {
    if (isPlaying) return; 

    selectedCharacter = characters[index];
    char1Btn.classList.remove('selected');
    char2Btn.classList.remove('selected');
    char3Btn.classList.remove('selected');
    btn.classList.add('selected');

    initSelectedCharacter();
    drawInitialScreen(); 

    if (index === 0) playSpecificSound('gini', 0);
    else if (index === 1) playSpecificSound('gini', 1);
    else if (index === 2) playSpecificSound('rabbit', 0);
}

function playSpecificSound(type, index) {
    if (!isSoundOn) return;
    if(!audioCache[type] || !audioCache[type][index]) return;
    const sound = audioCache[type][index];
    sound.currentTime = 0;
    let playPromise = sound.play();
    if (playPromise !== undefined) {
        playPromise.catch(error => {});
    }
}

char1Btn.addEventListener('click', () => selectCharacter(0, char1Btn));
char2Btn.addEventListener('click', () => selectCharacter(1, char2Btn));
char3Btn.addEventListener('click', () => selectCharacter(2, char3Btn));

startBtn.addEventListener('click', () => {
    initialScreen.classList.add('hidden');
    startCountdown();
});

if (restartGameBtn) {
    restartGameBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isGameOver && !isPlaying) {
            startCountdown();
        }
    });
}

function forceDownload(dataUrl, fileName, callback) {
    const link = document.createElement('a');
    link.download = fileName;
    link.href = dataUrl;
    document.body.appendChild(link); 
    link.click();
    document.body.removeChild(link);
    if (callback) callback();
}

function captureGameBox(callback) {
    const gameContainer = document.getElementById('game-container');
    const btnGroup = document.querySelector('.share-btn-group');
    
    btnGroup.style.display = 'none'; 

    const originalScrollY = window.scrollY;
    window.scrollTo(0, 0);

    setTimeout(() => {
        if (typeof html2canvas !== 'undefined') {
            html2canvas(gameContainer, { 
                scale: window.devicePixelRatio > 1 ? 3 : 2, 
                backgroundColor: null,
                useCORS: true,
                scrollY: 0 
            }).then(canvas => {
                btnGroup.style.display = 'flex';
                window.scrollTo(0, originalScrollY); 

                const fileName = `GINI_PIHAGI_SCORE_${score}.png`;
                forceDownload(canvas.toDataURL('image/png'), fileName, callback);

            }).catch(err => {
                btnGroup.style.display = 'flex';
                window.scrollTo(0, originalScrollY);
                if (callback) {
                    callback(); 
                } else {
                    alert(currentLang === 'kr' ? "오류: 로컬 환경에서는 이미지를 저장할 수 없습니다.\n배포된 웹 주소로 접속해 주세요." : "Cannot save image in local environment due to CORS policy.");
                }
            });
        } else {
            btnGroup.style.display = 'flex';
            window.scrollTo(0, originalScrollY);
            if (callback) callback();
        }
    }, 100);
}

if (captureBtn) {
    captureBtn.addEventListener('click', (e) => {
        e.stopPropagation(); 
        captureGameBox();
    });
}

const commonHashtagsText = "#기니똥피하기 #기니피하기 #gini_pihagi #gini_poop_dodge #darim_pigi";

if (copyBtn) {
    copyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const gameUrl = window.location.href;
        let shareText = "";
        
        if (currentLang === 'kr') {
            shareText = `기니 똥피하기에서 ${score}점을 달성했어요!\r\n(⏱ 생존 시간: ${playTime}초)\r\n내 기록을 넘어보세요!\r\n\r\n👉 ${gameUrl}\r\n\r\n${commonHashtagsText}`;
        } else {
            shareText = `I scored ${score} in Poop Dodge! 💩\r\n(⏱ Survived: ${playTime}s)\r\nCan you beat my score?\r\n\r\n👉 ${gameUrl}\r\n\r\n${commonHashtagsText}`;
        }
        
        navigator.clipboard.writeText(shareText).then(() => {
            alert(currentLang === 'kr' ? "클립보드에 결과가 복사되었습니다!\n원하는 곳에 붙여넣기(Ctrl+V) 하세요." : "Result copied to clipboard!\nPaste it anywhere you want.");
        }).catch(() => {
            alert(currentLang === 'kr' ? "복사에 실패했습니다." : "Failed to copy.");
        });
    });
}

if (shareXBtn) {
    shareXBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        captureGameBox(() => {
            const gameUrl = window.location.href;
            let fullText = "";

            if (currentLang === 'kr') {
                fullText = `기니 똥피하기에서 ${score}점을 달성했어요!\r\n(⏱ 생존 시간: ${playTime}초)\r\n내 기록을 넘어보세요!\r\n\r\n👉 ${gameUrl}\r\n\r\n${commonHashtagsText}`;
            } else {
                fullText = `I scored ${score} in Poop Dodge!\r\n(⏱ Survived: ${playTime}s)\r\nCan you beat my score?\r\n\r\n👉 ${gameUrl}\r\n\r\n${commonHashtagsText}`;
            }

            const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(fullText)}`;
            window.open(twitterUrl, '_blank');
        });
    });
}

function initSelectedCharacter() {
    playerImg.src = selectedCharacter.src;
    player.width = selectedCharacter.width;
    player.height = selectedCharacter.height;
    player.x = (canvas.width - player.width) / 2;
    player.y = FLOOR_Y - player.height; 
    player.facingRight = false; 

    if (isWaterMode) {
        poopImg.src = 'images/water.png';
        gameOverImg.src = selectedCharacter.gameOverSrcWater;
    } else {
        poopImg.src = selectedCharacter.poopSrc;
        gameOverImg.src = selectedCharacter.gameOverSrc;
    }
}

function playMoveSound() {
    if (!isSoundOn) return;
    if(!audioCache[selectedCharacter.soundType] || audioCache[selectedCharacter.soundType].length === 0) return;
    
    const sounds = audioCache[selectedCharacter.soundType];
    const randomIndex = Math.floor(Math.random() * sounds.length);
    const sound = sounds[randomIndex];
    
    sound.currentTime = 0; 
    let playPromise = sound.play();
    if (playPromise !== undefined) {
        playPromise.catch(error => {});
    }
}

document.addEventListener('keydown', (e) => {
    if (!isPlaying || isCountingDown || isGameOver) return; 

    if (e.key === 'ArrowLeft') {
        if (player.dx !== -player.speed) playMoveSound();
        player.dx = -player.speed;
        player.facingRight = false; 
    }
    if (e.key === 'ArrowRight') {
        if (player.dx !== player.speed) playMoveSound();
        player.dx = player.speed;
        player.facingRight = true;  
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') player.dx = 0;
});

const handleMoveLeftStart = (e) => {
    e.preventDefault();
    if (!isPlaying || isCountingDown || isGameOver) return; 
    if (player.dx !== -player.speed) playMoveSound();
    player.dx = -player.speed;
    player.facingRight = false;
};

const handleMoveRightStart = (e) => {
    e.preventDefault();
    if (!isPlaying || isCountingDown || isGameOver) return;
    if (player.dx !== player.speed) playMoveSound();
    player.dx = player.speed;
    player.facingRight = true;
};

const handleMoveEnd = (e) => {
    e.preventDefault();
    player.dx = 0;
};

btnLeft.addEventListener('touchstart', handleMoveLeftStart, { passive: false });
btnLeft.addEventListener('touchend', handleMoveEnd, { passive: false });
btnLeft.addEventListener('mousedown', handleMoveLeftStart);
btnLeft.addEventListener('mouseup', handleMoveEnd);

btnRight.addEventListener('touchstart', handleMoveRightStart, { passive: false });
btnRight.addEventListener('touchend', handleMoveEnd, { passive: false });
btnRight.addEventListener('mousedown', handleMoveRightStart);
btnRight.addEventListener('mouseup', handleMoveEnd);

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault(); 
    if (!isPlaying || isCountingDown || isGameOver) return;
    
    const rect = canvas.getBoundingClientRect();
    const touchX = e.touches[0].clientX - rect.left;
    const canvasHalfWidth = rect.width / 2; 
    
    if (touchX < canvasHalfWidth) {
        if (player.dx !== -player.speed) playMoveSound();
        player.dx = -player.speed;
        player.facingRight = false;
    } else {
        if (player.dx !== player.speed) playMoveSound();
        player.dx = player.speed;
        player.facingRight = true;
    }
}, { passive: false });

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    player.dx = 0;
}, { passive: false });

function createPoop() {
    const size = Math.random() * 10 + 15; 
    const speedBonus = Math.min(4.0, score * 0.02);
    
    poops.push({
        x: Math.random() * (canvas.width - size),
        y: -size,
        width: size,
        height: size,
        speed: (Math.random() * 4 + 4) + speedBonus, 
        flipX: Math.random() < 0.5, 
        angle: 0,                   
        rotationSpeed: (Math.random() - 0.5) * 0.2 
    });
}

// 💡 충돌 판정(Hitbox) 최적화: 억울한 죽음 방지
function checkCollision(rect1, rect2) {
    // 캐릭터의 폭/높이를 양옆으로 약 15% 정도 깎아서 진짜 몸통에 닿았을 때만 죽게 만듭니다.
    const marginX = rect1.width * 0.15; 
    const marginY = rect1.height * 0.15; 

    return (rect1.x + marginX) < rect2.x + rect2.width &&
           (rect1.x + rect1.width - marginX) > rect2.x &&
           (rect1.y + marginY) < rect2.y + rect2.height &&
           (rect1.y + rect1.height - marginY) > rect2.y;
}

function drawPlayer(x, y, w, h) {
    if (playerImg.complete && playerImg.naturalWidth !== 0) {
        if (player.facingRight) {
            ctx.save();
            ctx.translate(x + w / 2, y + h / 2); 
            ctx.scale(-1, 1); 
            ctx.drawImage(playerImg, -w / 2, -h / 2, w, h); 
            ctx.restore(); 
        } else {
            ctx.drawImage(playerImg, x, y, w, h);
        }
    } else {
        ctx.fillStyle = '#4a7c59'; 
        ctx.fillRect(x, y, w, h);
    }
}

function drawPoopObj(p) {
    if (poopImg.complete && poopImg.naturalWidth !== 0) {
        ctx.save();
        ctx.translate(p.x + p.width / 2, p.y + p.height / 2); 
        
        if (p.flipX) {
            ctx.scale(-1, 1); 
        }
        ctx.rotate(p.angle);  
        
        ctx.drawImage(poopImg, -p.width / 2, -p.height / 2, p.width, p.height); 
        ctx.restore();
    } else {
        ctx.fillStyle = '#8b7355';
        ctx.fillRect(p.x, p.y, p.width, p.height);
    }
}

function drawInitialScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = false;
    drawPlayer(player.x, player.y, player.width, player.height);
}

function update() {
    if (isGameOver || isCountingDown) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = false;

    player.x += player.dx;
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

    drawPlayer(player.x, player.y, player.width, player.height);

    for (let i = 0; i < poops.length; i++) {
        let p = poops[i];
        p.y += p.speed;
        p.angle += p.rotationSpeed; 

        drawPoopObj(p);

        if (checkCollision(player, p)) {
            endGame();
            return; 
        }

        if (p.y > canvas.height) {
            poops.splice(i, 1);
            score += 1; 
            scoreElement.innerText = score;
            i--;
        }
    }

    const spawnRate = Math.min(0.12, 0.05 + (score * 0.0003));
    
    if (Math.random() < spawnRate) {
        createPoop();
    }

    gameLoop = requestAnimationFrame(update);
}

function endGame() {
    isGameOver = true;
    isPlaying = false;
    cancelAnimationFrame(gameLoop);

    playTime = ((Date.now() - gameStartTime) / 1000).toFixed(1);

    char1Btn.classList.remove('disabled');
    char2Btn.classList.remove('disabled');
    char3Btn.classList.remove('disabled');
    
    if (score > bestScore) {
        bestScore = score;
        try { localStorage.setItem('dodgeGameBestScore', bestScore); } 
        catch(e) {}
    }
    bestScoreElement.innerText = bestScore;

    if (gameOverImg.complete && gameOverImg.naturalWidth !== 0) {
        gameOverImgElement.src = gameOverImg.src;
        gameOverImgElement.style.display = 'block';
        gameOverPlaceholder.style.display = 'none';
    } else {
        gameOverImgElement.style.display = 'none';
        gameOverPlaceholder.style.display = 'block';
    }

    finalScoreElement.innerText = score;
    finalBestScoreElement.innerText = bestScore;
    document.getElementById('finalTime').innerText = playTime + "s"; 
    
    gameOverScreen.classList.remove('hidden');
}

function startCountdown() {
    isPlaying = true; 
    isGameOver = false;
    isCountingDown = true;
    
    char1Btn.classList.add('disabled');
    char2Btn.classList.add('disabled');
    char3Btn.classList.add('disabled');

    score = 0;
    poops = [];
    player.x = (canvas.width - player.width) / 2;
    player.dx = 0;
    player.facingRight = false; 
    
    scoreElement.innerText = score;
    bestScoreElement.innerText = bestScore;
    
    gameOverScreen.classList.add('hidden');
    countdownElement.classList.remove('hidden');
    drawInitialScreen();

    let count = 3;
    countdownElement.innerText = count;

    let countdownInterval = setInterval(() => {
        count--;
        if (count > 0) {
            countdownElement.innerText = count;
        } else if (count === 0) {
            countdownElement.innerText = currentLang === 'kr' ? "시작!" : "START!";
        } else {
            clearInterval(countdownInterval);
            countdownElement.classList.add('hidden');
            isCountingDown = false;
            
            gameStartTime = Date.now(); 
            update();
        }
    }, 1000);
}

applyLanguage(); 
initSelectedCharacter();
playerImg.onload = () => {
    if (!isPlaying) drawInitialScreen(); 
};
setTimeout(() => { if (!isPlaying) drawInitialScreen(); }, 100);