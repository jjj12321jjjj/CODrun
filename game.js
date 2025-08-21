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

// 캐릭터 기본 정보
let character = {
  x: 50,
  y: 200,
  width: 0,
  height: 0,
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

// 캐릭터 선택
document.querySelectorAll(".character-card img").forEach(img => {
  img.addEventListener("click", () => {
    selectedCharacter = img.dataset.character;
    characterImg.src = `img/character/${selectedCharacter}.png`;
    characterJumpImg.src = `img/character/${selectedCharacter}_jump.png`;

    // 점프 이미지 없으면 fallback
    characterJumpImg.onerror = () => {
      characterJumpImg = characterImg;
    };

    // 캐릭터 크기를 원본 비율 유지 + 가로 70 고정
    characterImg.onload = () => {
      character.width = 70;
      character.height = characterImg.naturalHeight * (70 / characterImg.naturalWidth);

      // 캐릭터 위치 보정 (땅 위에 서 있도록)
      character.y = canvas.height - character.height - 40;
    };

    document.getElementById("character-selection").style.display = "none";
    canvas.style.display = "block";

    startGame();
  });
});

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
  if (character.y + character.height < canvas.height - 40) {
    character.dy += character.gravity;
  } else {
    character.y = canvas.height - character.height - 40;
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
