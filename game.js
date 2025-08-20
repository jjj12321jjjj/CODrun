const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let selectedCharacter = null;
let characterImg = new Image();
let characterJumpImg = new Image();
let cactusImg = new Image();
let backgroundMorning = new Image();
let backgroundEvening = new Image();
let backgroundNight = new Image();

cactusImg.src = "img/cactus.png";
backgroundMorning.src = "img/background/morning.png";
backgroundEvening.src = "img/background/evening.png";
backgroundNight.src = "img/background/night.png";

// 캐릭터 선택
document.querySelectorAll(".character-card img").forEach(img => {
  img.addEventListener("click", () => {
    selectedCharacter = img.dataset.character;
    characterImg.src = `img/character/${selectedCharacter}.png`;
    // characterJumpImg.src = `img/character/${selectedCharacter}_jump.png`;
    characterJumpImg.src = `img/character/${selectedCharacter}.png`;

    // 점프 이미지 없으면 fallback
    characterJumpImg.onerror = () => {
      characterJumpImg = characterImg;
    };

    document.getElementById("character-selection").style.display = "none";
    canvas.style.display = "block";

    startGame();
  });
});

let character = {
  x: 50,
  y: 200,
  width: 250,
  height: 250,
  dy: 0,
  gravity: 0.6,
  jumpPower: -12,
  isJumping: false
};

let cactus = {
  x: 800,
  y: 210,
  width: 35,
  height: 40
};

let gameSpeed = 2;
let timer = 0;
let score = 0;
let isGameOver = false;

function drawBackground() {
  let bg;
  if (timer < 5000) bg = backgroundMorning;
  else if (timer < 10000) bg = backgroundEvening;
  else bg = backgroundNight;

  ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
}

function drawCharacter() {
  let img = character.isJumping ? characterJumpImg : characterImg;

  if (img.complete && img.naturalWidth !== 0) {
    ctx.drawImage(img, character.x, character.y, character.width, character.height);
  }
}

function drawCactus() {
  ctx.drawImage(cactusImg, cactus.x, cactus.y, cactus.width, cactus.height);
}

function update() {
  if (isGameOver) return;

  timer++;

  // 배경
  drawBackground();

  // 캐릭터
  character.y += character.dy;
  if (character.y + character.height < 250) {
    character.dy += character.gravity;
  } else {
    character.y = 200;
    character.dy = 0;
    character.isJumping = false;
  }
  drawCharacter();

  // 장애물
  cactus.x -= gameSpeed;
  if (cactus.x + cactus.width < 0) {
    cactus.x = 800 + Math.random() * 200;
    score++;
  }
  drawCactus();

  // 충돌 검사
  if (
    character.x < cactus.x + cactus.width &&
    character.x + character.width > cactus.x &&
    character.y < cactus.y + cactus.height &&
    character.y + character.height > cactus.y
  ) {
    isGameOver = true;
    alert("Game Over! Score: " + score);
    document.location.reload();
  }

  // 속도 증가
  if (timer % 800 === 0) {
    gameSpeed += 0.2;
  }

  requestAnimationFrame(update);
}

function startGame() {
  document.addEventListener("keydown", (e) => {
    if (e.code === "Space" && !character.isJumping) {
      character.dy = character.jumpPower;
      character.isJumping = true;
    }
  });
  update();
}
