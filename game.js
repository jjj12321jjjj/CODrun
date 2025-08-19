document.addEventListener('DOMContentLoaded', () => {
// --- 재시작/점수 UI 생성 ---
let restartDiv = document.createElement('div');
restartDiv.id = 'restartDiv';
restartDiv.style.position = 'fixed';
restartDiv.style.top = '0';
restartDiv.style.left = '0';
restartDiv.style.width = '100vw';
restartDiv.style.height = '100vh';
restartDiv.style.background = 'rgba(0,0,0,0.5)';
restartDiv.style.display = 'none'; // 항상 none으로 시작
restartDiv.style.justifyContent = 'center';
restartDiv.style.alignItems = 'center';
restartDiv.style.flexDirection = 'column';
restartDiv.style.zIndex = '1000';
restartDiv.style.fontSize = '2em';
restartDiv.style.color = '#fff';
restartDiv.style.textAlign = 'center';
restartDiv.style.fontFamily = 'sans-serif';
restartDiv.style.gap = '20px';
restartDiv.innerHTML = `<div id="scoreText"></div><button id="restartBtn" style="font-size:1em;padding:10px 30px;">다시 시작</button>`;
document.body.appendChild(restartDiv);

let score = 0;

let canvas = document.getElementById("canvas");
let ctx = canvas.getContext('2d');

canvas.width = window.innerWidth - 100;
canvas.height = window.innerHeight - 100;

// 이미지
img_dir = "./img"
background_dir = img_dir + "/background"
characters_dir = img_dir + "/characters"

cactus_img = img_dir + "/cactus.png"

let bgImg = new Image();
bgImg.src = background_dir+"/morning.png"; // 배경 이미지

let selectedCharImg = new Image(); // 게임에서 사용되는 캐릭터
let cactusImg = new Image();
cactusImg.src = cactus_img

// 캐릭터 상태
let normalImageSrc, jumpImageSrc;

// character
let character = {
    x: 10,
    y: canvas.height - 10, // 화면 아래쪽으로
    width: 150,
    height: 150,
    draw() {
        ctx.drawImage(selectedCharImg, this.x, this.y, this.width, this.height);
    }
};

// cactus 클래스
class Cactus {
    constructor() {
        this.x = canvas.width;
        this.y = canvas.height - 5; // character.y 맞춤
        this.width = 40;
        this.height = 45;
    }
    draw() {
        ctx.drawImage(cactusImg, this.x, this.y, this.width, this.height);
    }
}

let timer = 0;
let cactuses = [];
let isJump = false;
let jumpTimer = 0;
let jumpCount = 0;
let animation;
let gameSpeed = 2;
let nextCactusTime = 0;
let lastCactusInterval = 0;
let lastWasZero = false;
let bgPhase = 'morning';

// --- 게임 루프 ---
function init() {
    animation = requestAnimationFrame(init);
    timer++;
    score = Math.floor(timer / 60); // 60프레임=1초 기준 점수

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // 점수 표시
    ctx.save();
    ctx.font = 'bold 32px sans-serif';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'right';
    ctx.fillText(`점수: ${score}`, canvas.width - 30, 50);
    ctx.restore();
    // 배경 이미지를 원본 비율로 캔버스 중앙에 그리기
    let bgRatio = bgImg.width / bgImg.height;
    let canvasRatio = canvas.width / canvas.height;
    let drawWidth, drawHeight;
    if (canvasRatio > bgRatio) {
        drawHeight = canvas.height;
        drawWidth = bgImg.width * (canvas.height / bgImg.height);
    } else {
        drawWidth = canvas.width;
        drawHeight = bgImg.height * (canvas.width / bgImg.width);
    }
    let drawX = (canvas.width - drawWidth) / 2;
    let drawY = (canvas.height - drawHeight) / 2;
    ctx.drawImage(bgImg, drawX, drawY, drawWidth, drawHeight);

    if (timer % 500 === 0) gameSpeed += 0.2;

    // cactus 등장 간격: 0, 0.5, 1.0, 1.5, 2.0초 중 랜덤
    if (timer >= nextCactusTime) {
        cactuses.push(new Cactus());
        let intervals = [0, 0.5, 1.0, 1.5, 2.0];
        let interval;
        while (true) {
            interval = intervals[Math.floor(Math.random() * intervals.length)];
            // 0.5초 이후(1.0, 1.5, ...) 또는 0이 두 번 연속일 때 최소 1.0초 간격
            if (interval > 0.5) {
                if (lastCactusInterval < 1.0) {
                    interval = 1.0;
                }
                break;
            } else if (interval === 0) {
                if (lastWasZero) {
                    interval = 0.9;
                    lastWasZero = false;
                    break;
                } else {
                    lastWasZero = true;
                    break;
                }
            } else {
                lastWasZero = false;
                break;
            }
        }
        lastCactusInterval = interval;
        nextCactusTime = timer + Math.round(interval * 60); // 60프레임=1초
    }

    // 시간에 따라 배경 변경
    if (timer < 2000) {
        if (bgPhase !== 'morning') {
            bgImg.src = background_dir + '/morning.png';
            bgPhase = 'morning';
        }
    } else if (timer < 4000) {
        if (bgPhase !== 'evening') {
            bgImg.src = background_dir + '/evening.png';
            bgPhase = 'evening';
        }
    } else {
        if (bgPhase !== 'night') {
            bgImg.src = background_dir + '/night.png';
            bgPhase = 'night';
        }
    }

    cactuses.forEach((cactus, i, o) => {
        if (cactus.x < -cactus.width) {
            o.splice(i, 1);
            score += 5; // 장애물 피할 때마다 5점 추가
        } else {
            cactus.x -= gameSpeed;
            collisionDetect(character, cactus);
            cactus.draw();
        }
    });

    // 점프 처리 + 이미지 변경 (이중 점프)
    if (isJump) {
        selectedCharImg.src = jumpImageSrc;
        character.y -= 5; // 점프 속도 조정
        jumpTimer++;
    } else {
        selectedCharImg.src = normalImageSrc;
        if (character.y < canvas.height - 100) character.y += 5;
    }

    if (jumpTimer > 50) {
        isJump = false;
        jumpTimer = 0;
        jumpCount = 0;
    }

    character.draw();
}

// 충돌 감지
function collisionDetect(character, cactus) {
    let xDiff = cactus.x - (character.x + character.width);
    let yDiff = cactus.y - (character.y + character.height);
    if (xDiff < -5 && yDiff < -15) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        cancelAnimationFrame(animation);
        // 게임 오버 UI 표시
        document.getElementById('scoreText').innerText = `게임 오버!\n점수: ${score}`;
        restartDiv.style.display = 'flex';
    }
}

// PC 키보드 점프
document.addEventListener('keydown', function(e) {
    if (e.code === 'Space') {
        // 이중 점프: jumpCount < 2
        if (jumpCount < 2) {
            isJump = true;
            jumpCount++;
        }
    }
});

// 모바일 터치 점프
canvas.addEventListener('touchstart', function(e) {
    e.preventDefault();
    if (jumpCount < 2) {
        isJump = true;
        jumpCount++;
    }
});

// --- 캐릭터 선택 ---
const selectDiv = document.getElementById("characterSelect");
// 캐릭터 선택 화면을 2~3줄로 정렬하는 CSS 적용
selectDiv.style.display = 'grid';
selectDiv.style.gridTemplateColumns = 'repeat(3, 1fr)';
selectDiv.style.gap = '20px';
selectDiv.style.justifyItems = 'center';
selectDiv.style.alignItems = 'center';
selectDiv.addEventListener("click", (e) => {
    if(e.target.tagName === "IMG") {
        normalImageSrc = e.target.src;
        // jump 이미지가 실제로 존재하면 경로 지정, 없으면 그냥 normalImageSrc 사용
        let jumpSrc = normalImageSrc.replace(".png", "_jump.png");
        let img = new Image();
        img.src = jumpSrc;
        img.onload = function() {
            jumpImageSrc = jumpSrc;
        };
        img.onerror = function() {
            jumpImageSrc = normalImageSrc;
        };
        selectedCharImg.src = normalImageSrc;
        selectDiv.style.display = "none";
        startGame();
    }
});

// --- 이미지 로딩 후 게임 시작 ---
function startGame() {
    let imagesToLoad = [bgImg, selectedCharImg, cactusImg];
    let loadedCount = 0;
    timer = 0;
    score = 0;
    cactuses = [];
    isJump = false;
    jumpTimer = 0;
    gameSpeed = 2;
    nextCactusTime = 0;
    bgPhase = 'morning';
    imagesToLoad.forEach(img => {
        if(img.complete) loadedCount++;
        else img.onload = () => {
            loadedCount++;
            if(loadedCount === imagesToLoad.length) init();
        };
    });
    if(loadedCount === imagesToLoad.length) init();
// --- 재시작 버튼 이벤트 ---
document.getElementById('restartBtn').onclick = function() {
    restartDiv.style.display = 'none';
    selectDiv.style.display = 'flex';
    // 캐릭터 선택 후 startGame()에서 초기화됨
};
}

}); // DOMContentLoaded 끝
