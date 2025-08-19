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
    y: 0, // 실제 y값은 게임 루프에서 동적으로 결정
    width: 120, // 기준 너비
    height: 120, // 기준 높이(이미지 비율에 따라 동적으로 변경)
    groundY: 0, // 착지 위치(배경 기준)
    draw() {
    // 이미지 비율에 맞게 크기 조정
    let ratio = selectedCharImg.naturalWidth && selectedCharImg.naturalHeight ? selectedCharImg.naturalWidth / selectedCharImg.naturalHeight : 1;
    let drawWidth = this.width;
    let drawHeight = this.width / ratio;
    ctx.drawImage(selectedCharImg, this.x, this.y, drawWidth, drawHeight);
    }
};

// cactus 클래스
class Cactus {
    constructor() {
        this.x = canvas.width;
        this.y = 0; // 실제 y값은 게임 루프에서 동적으로 결정
        this.width = 17;
        this.height = 19;
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

    // 점수 표시 (배경 기준 왼쪽 상단)
    ctx.save();
    ctx.font = 'bold 32px sans-serif';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'left';
    ctx.fillText(`점수: ${score}`, drawX + 20, drawY + 40);
    ctx.restore();

    // 두 번째 배경 그리기(기존 코드 유지, 변수명에 _score 추가)
    let bgRatio_score = bgImg.width / bgImg.height;
    let canvasRatio_score = canvas.width / canvas.height;
    let drawWidth_score, drawHeight_score;
    if (canvasRatio_score > bgRatio_score) {
        drawHeight_score = canvas.height;
        drawWidth_score = bgImg.width * (canvas.height / bgImg.height);
    } else {
        drawWidth_score = canvas.width;
        drawHeight_score = bgImg.height * (canvas.width / bgImg.width);
    }
    let drawX_score = (canvas.width - drawWidth_score) / 2;
    let drawY_score = (canvas.height - drawHeight_score) / 2;
    ctx.drawImage(bgImg, drawX_score, drawY_score, drawWidth_score, drawHeight_score);

    // 캐릭터와 cactus의 착지 위치를 배경 위에서 2/3 지점에 설정
    let groundY = drawY + drawHeight * 2 / 3;
    character.groundY = groundY;
    character.y = Math.floor(groundY);
    cactuses.forEach(cactus => {
        cactus.y = Math.floor(groundY);
    });

    if (timer % 500 === 0) gameSpeed += 0.1;

    // cactus 등장 간격: 1, 2, 3, 4초 중 랜덤
    if (timer >= nextCactusTime) {
        cactuses.push(new Cactus());
        let intervals = [1, 2, 3, 4];
        let interval;
        while (true) {
            interval = intervals[Math.floor(Math.random() * intervals.length)];
            // 1초 이상 간격
            if (interval > 1.0) {
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
    if (character.y === 0) character.y = character.groundY; // 최초 위치 지정
    if (isJump) {
        selectedCharImg.src = jumpImageSrc;
        character.y -= 10; // 점프 높이 증가
        jumpTimer++;
    } else {
        selectedCharImg.src = normalImageSrc;
        if (character.y < character.groundY) character.y += 5; // 착지
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
    if (xDiff < -20 && yDiff < -20) {
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
        // 캐릭터 선택 후 선택창 위치 초기화
        selectDiv.style.left = '';
        selectDiv.style.top = '';
        selectDiv.style.width = '';
        selectDiv.style.background = '';
        startGame();
    }
});

// 캐릭터 선택창을 배경 영역 안에 위치시키는 함수
function showCharacterSelectBackground() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
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
    // 캐릭터 선택창 위치 조정 (background 영역 안)
    selectDiv.style.position = 'absolute';
    selectDiv.style.left = `${drawX + 40}px`;
    selectDiv.style.top = `${drawY + drawHeight * 0.55}px`;
    selectDiv.style.width = `${drawWidth - 80}px`;
    selectDiv.style.height = 'auto';
    selectDiv.style.background = 'rgba(255,255,255,0.0)';
    selectDiv.style.zIndex = '10';
}

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
    // 캔버스 완전 초기화: 배경만 그림
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // drawX, drawY 등은 init에서만 선언
    // 배경만 그림
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
    showCharacterSelectBackground();
    // 캔버스 완전 초기화: 배경만 그림
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // drawX, drawY 등은 init에서만 선언
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
    // 캐릭터 선택 후 startGame()에서 초기화됨
};
}

}); // DOMContentLoaded 끝
