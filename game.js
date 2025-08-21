let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");

let character = null;
let characterImg = new Image();
let characterLoaded = false;

let background = new Image();
background.src = "img/background/morning.png";
let bgLoaded = false;
background.onload = () => {
  bgLoaded = true;
};

let cactusImg = new Image();
cactusImg.src = "img/obstacles/cactus.png";  // ✅ cactus
let cactusLoaded = false;
cactusImg.onload = () => {
  cactusLoaded = true;
};

let cactusX = 600;
let cactusY = canvas.height - 40 - 22; // ✅ 밑에서 22
let cactusWidth = 35;
let cactusHeight = 40;

let charX = 50;
let charY = 0;
let charWidth = 40;
let charHeight = 40;
let isJumping = false;
let jumpHeight = 0;

function selectCharacter(name) {
  character = name;
  characterImg.src = `img/character/${character}.png`;

  // 이미지 로드 확인
  if (characterImg.complete) {
    characterLoaded = true;
    startGame();
  } else {
    characterImg.onload = () => {
      characterLoaded = true;
      startGame();
    };
  }
}

function startGame() {
  document.getElementById("character-selection").style.display = "none";
  canvas.style.display = "block";
  charY = canvas.height - charHeight - 20; // ✅ 밑에서 20
  update();
}

function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (bgLoaded) ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

  if (characterLoaded) {
    ctx.drawImage(characterImg, charX, charY - jumpHeight, charWidth, charHeight);
  }

  if (cactusLoaded) {
    ctx.drawImage(cactusImg, cactusX, cactusY, cactusWidth, cactusHeight);
    cactusX -= 5;
    if (cactusX + cactusWidth < 0) cactusX = canvas.width;
  }

  requestAnimationFrame(update);
}

function jump() {
  if (!isJumping) {
    isJumping = true;
    let upInterval = setInterval(() => {
      if (jumpHeight >= 80) {
        clearInterval(upInterval);
        let downInterval = setInterval(() => {
          if (jumpHeight <= 0) {
            clearInterval(downInterval);
            isJumping = false;
          } else {
            jumpHeight -= 5;
          }
        }, 20);
      } else {
        jumpHeight += 5;
      }
    }, 20);
  }
}

// 키보드 점프
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") jump();
});

// 모바일 터치 점프
document.addEventListener("touchstart", () => {
  jump();
});
