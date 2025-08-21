const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let characterImg, characterRunImg, characterJumpImg;
let character = {
  x: 50,
  y: 300,
  width: 40,  // ✅ 가로 40 고정
  height: 40, // 비율에 맞춰 drawImage에서 자동 조정
  dy: 0,
  jumpPower: -10,
  gravity: 0.5,
  isJumping: false
};

let cactusImg = new Image();
cactusImg.src = "img/obstacles/catus.png"; // ✅ 경로 변경

let cactus = {
  x: 800,
  y: 310,
  width: 35,  // ✅ 가로 35
  height: 40, // ✅ 세로 40
};

let backgroundImg = new Image();
backgroundImg.src = "img/background/morning.png"; // 기본 배경

let score = 0;
let gameSpeed = 2;
let animationFrameId;

// 캐릭터 선택 이벤트
document.querySelectorAll(".character-card img").forEach(img => {
  img.addEventListener("click", () => {
    const selected = img.dataset.character;

    // 캐릭터 이미지 로드
    characterImg = new Image();
    characterImg.src = `img/character/${selected}.png`;

    characterRunImg = new Image();
    characterRunImg.src = `img/character/${selected}_run.png`;

    characterJumpImg = new Image();
    characterJumpImg.src = `img/character/${selected}_jump.png`;

    document.getElementById("character-selection").style.display = "none";
    canvas.style.display = "block";
    startGame();
  });
});

// 게임 시작
function startGame() {
  character.y = 300;
  cactus.x = 800;
  score = 0;
  gameSpeed = 2;
  update();
}

// 캐릭터 그리기
function drawCharacter() {
  let imgToDraw = characterImg;

  if (character.isJumping) {
    imgToDraw = characterJumpImg;
  } else {
    imgToDraw = characterRunImg;
  }

  if (imgToDraw && imgToDraw.complete) {
    // 가로 40 고정, 세로는 원본 비율 유지
    const aspectRatio = imgToDraw.height / imgToDraw.width;
    const drawWidth = character.width;
    const drawHeight = drawWidth * aspectRatio;

    ctx.drawImage(imgToDraw, character.x, character.y - (drawHeight - character.height), drawWidth, drawHeight);
  }
}

// 장애물 그리기
function drawCactus() {
  if (cactusImg.complete) {
    ctx.drawImage(cactusImg, cactus.x, cactus.y, cactus.width, cactus.height);
  }
}

// 게임 루프
function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 배경
  ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);

  // 캐릭터
  drawCharacter();

  // 장애물
  drawCactus();

  // 점프 물리
  character.y += character.dy;
  if (character.y + character.height < 350) {
    character.dy += character.gravity;
  } else {
    character.dy = 0;
    character.isJumping = false;
    character.y = 300;
  }

  // 장애물 이동
  cactus.x -= gameSpeed;
  if (cactus.x + cactus.width < 0) {
    cactus.x = 800;
    score++;
    if (gameSpeed < 10) gameSpeed += 0.5;
  }

  // 충돌 검사
  if (
    character.x < cactus.x + cactus.width &&
    character.x + character.width > cactus.x &&
    character.y < cactus.y + cactus.height &&
    character.y + character.height > cactus.y
  ) {
    cancelAnimationFrame(animationFrameId);
    alert("Game Over! Score: " + score);
    document.location.reload();
    return;
  }

  // 점수
  ctx.fillStyle = "black";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, 10, 30);

  animationFrameId = requestAnimationFrame(update);
}

// 점프 이벤트
document.addEventListener("keydown", e => {
  if (e.code === "Space" && !character.isJumping) {
    character.isJumping = true;
    character.dy = character.jumpPower;
  }
});
