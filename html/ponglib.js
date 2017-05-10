var animate = window.requestAnimationFrame ||
              window.webkitRequestAnimationFrame ||
              window.mozRequestAnimationFrame ||
              function(callback) { window.setTimeout(callback, 1000/60) };

function createCanvas(settings) {
  var canvas = document.createElement('canvas');
  canvas.width = settings.boardWidth;
  canvas.height = settings.boardHeight;
  return canvas;
}

function createContext(canvas) {
  return canvas.getContext('2d');
}

function randPosNeg(limit) {
  var x = Math.round(Math.random() * limit);
  var sign = Math.round(Math.random()) || -1;
  return x * sign;
}

function createBall(settings) {
  return {
    x_speed: randPosNeg(settings.ballSpeed),
    y_speed: (randPosNeg(1) || 1) * settings.ballSpeed,
    x: settings.boardWidth / 2,
    y: settings.boardHeight / 2,
    radius: settings.ballRadius,
    settings: settings,
  }
}

function createPaddle(settings, isOpponent) {
  var width = settings.paddleWidth;
  var height = settings.paddleHeight;
  var padding = settings.paddlePadding;

  return {
    x: (settings.boardWidth / 2) - (width / 2),
    y: isOpponent ? padding : settings.boardHeight - padding - height,
    x_speed: 0,
    y_speed: 0,
    width:  width,
    height: height,
    settings: settings,
  }
}

function createPlayer(settings, isOpponent) {
  return {
    paddle: createPaddle(settings, isOpponent),
    score: 0,
    settings: settings,
  }
}

function updatePaddle(paddle, x, y) {
  paddle.x += x;
  paddle.y += y;

  paddle.x_speed = x;
  paddle.y_speed = y;

  if (paddle.x < 0) {
    paddle.x = 0;
    paddle.x_speed = 0;
  } else if (paddle.x + paddle.width > paddle.settings.boardWidth) {
    paddle.x = paddle.settings.boardWidth - paddle.width;
    paddle.x_speed = 0;
  }
}

function resetPaddleInertia(paddle) {
  paddle.x_speed = 0;
  paddle.y_speed = 0;
}

function updatePlayer(player, keysDown) {
  var leftKey = 37;
  var rightKey = 39;
  var keys = Object.keys(keysDown);

  if (keys.length == 0) {
    resetPaddleInertia(player.paddle);
  } else {
    for (var i = 0; i < keys.length; i++) {
      var value = Number(keys[i]);

      if (value == leftKey) {
        updatePaddle(player.paddle, -player.settings.paddleSpeed, 0);
      } else if (value == rightKey) {
        updatePaddle(player.paddle, player.settings.paddleSpeed, 0);
      } else {
        updatePaddle(player.paddle, 0, 0);
      }
    }
  }
}

function updateComputer(player, ball) {
  var diff = -(player.paddle.x + player.paddle.width / 2 - ball.x)

  if (diff < -player.settings.paddleSpeed) {
    diff = -player.settings.paddleSpeed;
  } else if (diff > player.settings.paddleSpeed) {
    diff = player.settings.paddleSpeed;
  }

  updatePaddle(player.paddle, diff, 0);
}

function updateBall(ball, player, opponent) {
  ball.x += ball.x_speed;
  ball.y += ball.y_speed;
  var top_x = ball.x - ball.radius;
  var top_y = ball.y - ball.radius;
  var bottom_x = ball.x + ball.radius;
  var bottom_y = ball.y + ball.radius;

  // bounce the ball off the walls
  if (top_x < 0) {
    ball.x = ball.radius;
    ball.x_speed = -ball.x_speed;
  } else if (bottom_x > ball.settings.boardWidth) {
    ball.x = ball.settings.boardWidth - ball.radius;
    ball.x_speed = -ball.x_speed;
  }

  if (ball.y < 0 || ball.y > ball.settings.boardHeight) { // a point was scored
    if (ball.y < 0) {
      player.score += 1;
    } else if (ball.y > ball.settings.boardHeight) {
      opponent.score += 1;
    }

    ball.x_speed = randPosNeg(ball.settings.ballSpeed);
    ball.y_speed = (randPosNeg(1) || 1) * ball.settings.ballSpeed;
    ball.x = ball.settings.boardWidth / 2;
    ball.y = ball.settings.boardHeight / 2;
  }

  // handle collisions with paddle
  var p, dir;

  if (top_y > ball.settings.boardHeight / 2) { // pick side of court to check
    dir = -1;
    p = player.paddle;
  } else {
    dir = 1;
    p = opponent.paddle;
  }

  if (top_y < (p.y + p.height) && bottom_y > p.y && top_x < (p.x + p.width) && bottom_x > p.x) {
    ball.y_speed = dir * ball.settings.ballSpeed;
    ball.x_speed += p.x_speed / 2;
    ball.y += ball.y_speed;
  }
}

function renderPaddle(paddle, context) {
  context.fillStyle = paddle.settings.paddleColor;
  context.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function renderPlayer(player, context) {
  renderPaddle(player.paddle, context);
}

function renderBoard(settings, context) {
  context.fillStyle = settings.boardColor;
  context.fillRect(0, 0, settings.boardWidth, settings.boardHeight);
  context.fillStyle = settings.paddleColor;
  context.fillRect(0, settings.boardHeight / 2 - 1, settings.boardWidth, 2);
}

function renderBall(ball, context) {
  context.beginPath();
  context.arc(ball.x, ball.y, ball.radius, 2 * Math.PI, false);
  context.fillStyle = ball.settings.ballColor;
  context.fill();
}
