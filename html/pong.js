var settings = {
  ballColor: '#FFF',
  ballRadius: 5,
  ballSpeed: 3,
  boardColor: '#000',
  boardHeight: 600,
  boardWidth: 400,
  maxScore: 10,
  paddleColor: '#FFF',
  paddleHeight: 10,
  paddlePadding: 10,
  paddleSpeed: 8,
  paddleWidth: 50,
}

var yScore = document.getElementById('your_score');
var oScore = document.getElementById('opponent_score');

var canvas = createCanvas(settings);
var context = createContext(canvas);
var keysDown = {};

var ball = createBall(settings);
var opponent = createPlayer(settings, true);
var you = createPlayer(settings);

function checkScore() {
  yScore.innerText = you.score;
  oScore.innerText = opponent.score;

  if (you.score >= settings.maxScore) {
    alert("You Won!");
    location.href = location.href;
  } else if (opponent.score >= settings.maxScore) {
    alert("You Lost...");
    location.href = location.href;
  }
}

function update() {
  updatePlayer(you, keysDown);
  updateBall(ball, you, opponent);
  updateComputer(opponent, ball);
};

function render() {
  renderBoard(settings, context);
  renderBall(ball, context);
  renderPlayer(you, context);
  renderPlayer(opponent, context);
};

function step() {
  update();
  render();
  checkScore();
  animate(step);
};

window.onload = function() {
  document.body.appendChild(canvas);
  animate(step);
};

window.addEventListener("keydown", function(event) {
  keysDown[event.keyCode] = true;
});

window.addEventListener("keyup", function(event) {
  delete keysDown[event.keyCode];
});
