const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ===== 캐릭터 =====
const characterWidth = 40;
let characterHeight;
let characterX = 50;
let characterY;
let characterImg;

// ===== 점프 =====
let isJumping = false;
let jumpVelocity = 0;
const gravity = 0.5;

// ===== Cactus =====
let cactusImg = new Image();
cactusImg.src = "img/obstacles/catus.png";

const cactusWidth = 35;
const cactusHeight = 40;
let cactusX = canvas.width;
let cactusY = canvas.height - cactusHeight - 22;

// ===== 게임 루프 =====
let gameInterval;

function startGame() {
  document.addEventListener("keydown", handleJump);
  gameInterval = setInterval(update, 20);
}

function handleJump(e) {
  if (e.code === "Space" && !isJumping) {
    isJumping = true;
    jumpVelocity = -10;
  }
}

function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 캐릭터
  if (isJumping) {
    characterY += jumpVelocity;
    jumpVelocity += gravity;

    if (characterY >= canvas.height - characterHeight - 20) {
      characterY = canvas.height - characterHeight - 20;
      isJumping = false;
    }
  }
  drawCharacter();

  // cactus 이동
  cactusX -= 5;
  if (cactusX + cactusWidth < 0) {
    cactusX = canvas.width;
  }
  drawCactus();
}

function drawCharacter() {
  ctx.drawImage(characterImg, characterX, characterY, characterWidth, characterHeight);
}

function drawCactus() {
  ctx.drawImage(cactusImg, cactusX, cactusY, cactusWidth, cactusHeight);
}

// ===== 캐릭터 선택 =====
document.querySelectorAll(".character-card img").forEach(img => {
  img.addEventListener("click", () => {
    const selected = img.dataset.character;

    characterImg = new Image();
    characterImg.onload = () => {
      characterHeight = characterImg.height * (characterWidth / characterImg.width);
      characterY = canvas.height - characterHeight - 20; // 밑에서 20px
      document.getElementById("character-selection").style.display = "none";
      canvas.style.display = "block";
      startGame();
    };
    characterImg.src = `img/character/${selected}.png`;
  });
});
