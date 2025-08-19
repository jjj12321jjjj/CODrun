document.addEventListener('DOMContentLoaded', () => {

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
    y: canvas.height - 100, // 화면 아래쪽으로
    width: 50,
    height: 50,
    draw() {
        ctx.drawImage(selectedCharImg, this.x, this.y, this.width, this.height);
    }
};

// cactus 클래스
class Cactus {
    constructor() {
        this.x = canvas.width;
        this.y = canvas.height - 95; // character.y 맞춤
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
let animation;
let gameSpeed = 2;

// --- 게임 루프 ---
function init() {
    animation = requestAnimationFrame(init);
    timer++;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

    if (timer % 500 === 0) gameSpeed += 0.2;

    if (timer % 200 === 0) cactuses.push(new Cactus());

    cactuses.forEach((cactus, i, o) => {
        if (cactus.x < -cactus.width) o.splice(i, 1);
        cactus.x -= gameSpeed;
        collisionDetect(character, cactus);
        cactus.draw();
    });

    // 점프 처리 + 이미지 변경
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
    }

    character.draw();
}

// 충돌 감지
function collisionDetect(character, cactus) {
    let xDiff = cactus.x - (character.x + character.width);
    let yDiff = cactus.y - (character.y + character.height);
    if (xDiff < -5 && yDiff < -5) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        cancelAnimationFrame(animation);
        alert("게임 오버!");
    }
}

// PC 키보드 점프
document.addEventListener('keydown', function(e) {
    if (e.code === 'Space' && !isJump && character.y === canvas.height - 100) isJump = true;
});

// 모바일 터치 점프
canvas.addEventListener('touchstart', function(e) {
    e.preventDefault();
    if (!isJump && character.y === canvas.height - 100) isJump = true;
});

// --- 캐릭터 선택 ---
const selectDiv = document.getElementById("characterSelect");
selectDiv.addEventListener("click", (e) => {
    if(e.target.tagName === "IMG") {
        normalImageSrc = e.target.src;
        //jumpImageSrc = normalImageSrc.replace(".png","_jump.png");
        jumpImageSrc = "./img/character/koing.png";
        selectedCharImg.src = normalImageSrc;
        selectDiv.style.display = "none";
        startGame();
    }
});

// --- 이미지 로딩 후 게임 시작 ---
function startGame() {
    let imagesToLoad = [bgImg, selectedCharImg, cactusImg];
    let loadedCount = 0;
    imagesToLoad.forEach(img => {
        if(img.complete) loadedCount++;
        else img.onload = () => {
            loadedCount++;
            if(loadedCount === imagesToLoad.length) init();
        };
    });
    if(loadedCount === imagesToLoad.length) init();
}

}); // DOMContentLoaded 끝
