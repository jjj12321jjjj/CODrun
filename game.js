let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");

let character = null;
let characterImg = new Image();

let cactusImg = new Image();
cactusImg.src = "img/obstacles/cactus.png";
let cactusLoaded = false;
cactusImg.onload = () => {
  cactusLoaded = true;
};

let backgroundImg = new Image();
backgroundImg.src = "img/background/morning.png";

let characterX = 50;
let characterY;
let groundY = canvas.height - 20; // 기준선
let cactusX = canvas.width;
let cactusY;

let isJumping = false;
let jumpVelocity = 0;
let gravity = 0.5;

function selectCharacter(name) {
  character = name;
  characterImg.src = `img/character/${name}.png`;

  document.querySelector(".character-selection").style.display = "none";
  document.querySelector("h2").style.display = "none";
  canvas.style.display = "block";

  characterImg.onload = () => {
    characterY = canvas.height - 20 - getScaledHeight(characterImg, 40); // 밑에서 20px
    cactusY = canvas.height - 22 - 40; // 밑에서 22px, 높이 40
    startGame();
  };
}

function getScaledHeight(img, fixedWidth) {
  let aspectRatio = img.height / img.width;
  return fixedWidth * aspectRatio;
}

function drawCharacter() {
  let scaledHeight = getScaledHeight(characterImg, 40); // 가로 40 고정
  ctx.drawImage(characterImg, characterX, characterY, 40, scaledHeight);
}

function drawCactus() {
  if (cactusLoaded) {
    ctx.drawImage(cactusImg, cactusX, cactusY, 35, 40);
  }
}

function handleJump(e) {
  if (e.code === "Space" && !isJumping) {
    isJumping = true;
    jumpVelocity = -10;
  }
}
document.addEventListener("keydown", handleJump);

// 모바일 터치
canvas.addEventListener("touchstart", (e) => {
  e.preventDefault();
  if (!isJumping) {
    isJumping = true;
    jumpVelocity = -10;
  }
});

function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 배경
  ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);

  // 캐릭터 점프
  if (isJumping) {
    characterY += jumpVelocity;
    jumpVelocity += gravity;

    if (characterY >= canvas.height - 20 - getScaledHeight(characterImg, 40)) {
      characterY = canvas.height - 20 - getScaledHeight(characterImg, 40);
      isJumping = false;
    }
  }

  // 장애물 이동
  cactusX -= 5;
  if (cactusX < -35) {
    cactusX = canvas.width;
  }

  drawCharacter();
  drawCactus();

  requestAnimationFrame(update);
}

function startGame() {
  cactusX = canvas.width;
  update();
}
