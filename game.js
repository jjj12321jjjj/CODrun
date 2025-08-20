let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");

let gameInterval;
let gameSpeed = 2;
let gravity = 0.6;
let score = 0;
let obstacles = [];

let dino;
let selectedCharacter = null;

// 배경 이미지들
let backgrounds = {
  morning: new Image(),
  evening: new Image(),
  night: new Image()
};
backgrounds.morning.src = "img/background/morning.png";
backgrounds.evening.src = "img/background/evening.png";
backgrounds.night.src = "img/background/night.png";

function selectCharacter(character) {
  selectedCharacter = new Image();
  selectedCharacter.src = `img/character/${character}.png`;

  dino = {
    x: 50,
    y: canvas.height - 180, // 크기 커지니까 Y값 조정
    width: 120,             // 기존보다 2~3배 크게
    height: 120,
    dy: 0,
    jumpPower: -15,
    isJumping: false,
    img: selectedCharacter
  };

  document.getElementById("characterSelect").style.display = "none";
  canvas.style.display = "block";

  startGame();
}

function startGame() {
  document.addEventListener("keydown", jump);
  gameInterval = setInterval(update, 1000 / 60);
}

function jump(e) {
  if (e.code === "Space" && !dino.isJumping) {
    dino.dy = dino.jumpPower;
    dino.isJumping = true;
  }
}

function getBackgroundByScore() {
  if (score < 1000) {
    return backgrounds.morning;
  } else if (score < 2000) {
    return backgrounds.evening;
  } else {
    return backgrounds.night;
  }
}

function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 배경 (점수 기반 변경)
  let bg = getBackgroundByScore();
  ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

  // Dino 업데이트
  dino.y += dino.dy;
  if (dino.y + dino.height < canvas.height) {
    dino.dy += gravity;
  } else {
    dino.y = canvas.height - dino.height;
    dino.isJumping = false;
  }

  ctx.drawImage(dino.img, dino.x, dino.y, dino.width, dino.height);

  // 장애물 생성
  if (Math.random() < 0.01) {
    obstacles.push({
      x: canvas.width,
      y: canvas.height - 45,
      width: 40,
      height: 45,
      img: document.getElementById("cactusImg")
    });
  }

  // 장애물 이동/충돌 체크
  for (let i = 0; i < obstacles.length; i++) {
    let obs = obstacles[i];
    obs.x -= gameSpeed;
    ctx.drawImage(obs.img, obs.x, obs.y, obs.width, obs.height);

    if (
      dino.x < obs.x + obs.width &&
      dino.x + dino.width > obs.x &&
      dino.y < obs.y + obs.height &&
      dino.y + dino.height > obs.y
    ) {
      clearInterval(gameInterval);
      alert("게임 오버! 점수: " + score);
      document.location.reload();
    }
  }

  // 점수 및 난이도
  score++;
  if (score % 500 === 0) gameSpeed += 0.2;

  ctx.fillStyle = "#000";
  ctx.font = "20px Arial";
  ctx.fillText("점수: " + score, 10, 30);
}
