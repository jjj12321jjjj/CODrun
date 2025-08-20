const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let selectedCharacter = null;
let dinoImg = new Image();
let dinoJumpImg = new Image();
let cactusImg = new Image();
let backgroundMorning = new Image();
let backgroundEvening = new Image();
let backgroundNight = new Image();

cactusImg.src = "img/cactus.png";
backgroundMorning.src = "img/background/morning.png";
backgroundEvening.src = "img/background/evening.png";
backgroundNight.src = "img/background/night.png";

// 캐릭터 선택
document.querySelectorAll(".character-grid img").forEach(img => {
  img.addEventListener("click", () => {
    selectedCharacter = img.dataset.character;
    dinoImg.src = `img/character/${selectedCharacter}.png`;
    dinoJumpImg.src = `img/character/${selectedCharacter}_jump.png`;

    document.getElementById("character-selection").style.display = "none";
    canvas.style.display = "block";

    startGame();
  });
});

let dino = {
  x: 50,
  y: 200,
  width: 50,
  height: 50,
  dy: 0,
  gravity: 0.6,
  jumpPower: -12,
  isJumping: false
};

let cactus = {
  x: 800,
  y: 230,
  width: 40,
  height: 45
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

function drawDino() {
  if (dino.isJumping) {
    ctx.drawImage(dinoJumpImg, dino.x, dino.y, dino.width, dino.height);
  } else {
    ctx.drawImage(dinoImg, dino.x, dino.y, dino.width, dino.height);
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

  // 공룡
  dino.y += dino.dy;
  if (dino.y + dino.height < 250) {
    dino.dy += dino.gravity;
  } else {
    dino.y = 200;
    dino.dy = 0;
    dino.isJumping = false;
  }
  drawDino();

  // 장애물
  cactus.x -= gameSpeed;
  if (cactus.x + cactus.width < 0) {
    cactus.x = 800 + Math.random() * 200;
    score++;
  }
  drawCactus();

  // 충돌 검사
  if (
    dino.x < cactus.x + cactus.width &&
    dino.x + dino.width > cactus.x &&
    dino.y < cactus.y + cactus.height &&
    dino.y + dino.height > cactus.y
  ) {
    isGameOver = true;
    alert("Game Over! Score: " + score);
    document.location.reload();
  }

  // 속도 증가 (점진적)
  if (timer % 800 === 0) {
    gameSpeed += 0.2;
  }

  requestAnimationFrame(update);
}

function startGame() {
  document.addEventListener("keydown", (e) => {
    if (e.code === "Space" && !dino.isJumping) {
      dino.dy = dino.jumpPower;
      dino.isJumping = true;
    }
  });
  update();
}
