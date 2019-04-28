window.pong = {};

(function (exports) {
  const BALL_COLOR = '#FFF', BALL_RADIUS = 5,
    BALL_SPEED = 3,        BOARD_COLOR = '#000',
    BOARD_HEIGHT = 600,    BOARD_WIDTH = 600,
    MAX_SCORE = 1000,      PADDLE_COLOR = '#FFF',
    PADDLE_HEIGHT = 10,    PADDLE_PADDING = 10,
    PADDLE_SPEED = 8,      PADDLE_WIDTH = 50,
    LEFT_KEY = 37,         RIGHT_KEY = 39,
    PLAYER_INDEX = 0;

  function listenKeyPresses() {
    let keysDown = {};
    window.addEventListener("keydown", (e) => keysDown[e.keyCode] = true);
    window.addEventListener("keyup",   (e) => delete keysDown[e.keyCode]);
    return keysDown;
  }

  function createBall() {
    let ball;
    do {
      ball = {
        x_speed: Math.round(Math.random() * BALL_SPEED) * (Math.round(Math.random()) || -1),
        y_speed: (Math.round(Math.random()) || -1) * BALL_SPEED,
        x: BOARD_WIDTH / 2, y: BOARD_HEIGHT / 2, radius: BALL_RADIUS,
      }
    } while (!ball.x_speed);

    return ball;
  }

  function createPlayers() {
    let players = [null, null];
    for (let i = 0; i < players.length; i++) {
      players[i] = {
        score: 0, paddle: {
          x: (BOARD_WIDTH / 2) - (PADDLE_WIDTH / 2),
          y: i ? PADDLE_PADDING : BOARD_HEIGHT - PADDLE_PADDING - PADDLE_HEIGHT,
          x_speed: 0, y_speed: 0, width: PADDLE_WIDTH, height: PADDLE_HEIGHT,
        }
      };
    }

    return players;
  }

  function getScoreDisplays(ids) {
    return ids.map(document.getElementById.bind(document));
  }

  function createCtx() {
    let canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d');
    canvas.width = BOARD_WIDTH;
    canvas.height = BOARD_HEIGHT;
    document.body.appendChild(canvas);
    return ctx;
  }

  function updatePaddle(paddle, xDiff, yDiff) {
    paddle.x += xDiff;
    paddle.y += yDiff;
    paddle.x_speed = xDiff;
    paddle.y_speed = yDiff;

    if (paddle.x < 0) {
      paddle.x = 0;
      paddle.x_speed = 0;
    } else if (paddle.x + paddle.width > BOARD_WIDTH) {
      paddle.x = BOARD_WIDTH - paddle.width;
      paddle.x_speed = 0;
    } else if (paddle.y - PADDLE_PADDING < 0) {
      paddle.y = PADDLE_PADDING;
      paddle.y_speed = 0;
    } else if (paddle.y + paddle.height + PADDLE_PADDING > BOARD_HEIGHT) {
      paddle.y = BOARD_HEIGHT - (paddle.height + PADDLE_PADDING);
      paddle.y_speed = 0;
    }
  }

  function updatePlayer(p, isComputer, ball, keysDown) {
    let xDiff = 0;
    let yDiff = 0;

    if (isComputer) {
      xDiff = -(p.paddle.x + p.paddle.width / 2 - ball.x);
      if (xDiff < -PADDLE_SPEED) {
        xDiff = -PADDLE_SPEED;
      } else if (xDiff > PADDLE_SPEED) {
        xDiff = PADDLE_SPEED;
      }
    } else {
      let pressedKeys = Object.keys(keysDown);
      for (let j = 0; j < pressedKeys.length; j++) {
        switch (Number(pressedKeys[j])) {
          case LEFT_KEY:  xDiff = -PADDLE_SPEED; break;
          case RIGHT_KEY: xDiff =  PADDLE_SPEED; break;
        }
      }
    }

    updatePaddle(p.paddle, xDiff, yDiff);
  }

  function updatePlayers(players, ball, keysDown) {
    for (let i = 0; i < players.length; i++) {
      updatePlayer(players[i], i != PLAYER_INDEX, ball, keysDown);
    }
  }

  function updateBallAndScore(ball, players) {
    ball.x += ball.x_speed;
    ball.y += ball.y_speed;
    ball.top_x = ball.x - ball.radius;
    ball.top_y = ball.y - ball.radius;
    ball.bottom_x = ball.x + ball.radius;
    ball.bottom_y = ball.y + ball.radius;

    if (ball.top_x < 0) {
      ball.x = ball.radius;
      ball.x_speed = -ball.x_speed;
    } else if (ball.bottom_x > BOARD_WIDTH) {
      ball.x = BOARD_WIDTH - ball.radius;
      ball.x_speed = -ball.x_speed;
    }

    if (ball.y < 0 || ball.y > BOARD_HEIGHT) {
      if (ball.y < 0) {
        players[0].score += 1;
      } else if (ball.y > BOARD_HEIGHT) {
        players[1].score += 1;
      }

      do {
        ball.x_speed = Math.round(Math.random() * BALL_SPEED) * (Math.round(Math.random()) || -1)
      } while (!ball.x_speed);
      ball.y_speed = (Math.round(Math.random()) || -1) * BALL_SPEED;
      ball.x = BOARD_WIDTH / 2;
      ball.y = BOARD_HEIGHT / 2;
    }

    let paddle, dir;
    if (ball.top_y > BOARD_HEIGHT / 2) {
      dir = -1;
      paddle = players[0].paddle;
    } else {
      dir = 1;
      paddle = players[1].paddle;
    }

    if (ball.top_y < (paddle.y + paddle.height) && ball.bottom_y > paddle.y &&
      ball.top_x < (paddle.x + paddle.width) && ball.bottom_x > paddle.x) {
      ball.y_speed = dir * BALL_SPEED;
      ball.x_speed += paddle.x_speed / 2;
      ball.y += ball.y_speed;
    }
  }

  function renderBoard(ctx) {
    ctx.fillStyle = BOARD_COLOR;
    ctx.fillRect(0, 0, BOARD_WIDTH, BOARD_HEIGHT);
    ctx.fillStyle = PADDLE_COLOR;
    ctx.fillRect(0, BOARD_HEIGHT / 2 - 1, BOARD_WIDTH, 2);
  }

  function renderBall(ctx, ball) {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 2 * Math.PI, false);
    ctx.fillStyle = BALL_COLOR;
    ctx.fill();
  }

  function renderPlayers(ctx, players, scores) {
    for (let i = 0; i < players.length; i++) {
      let p = players[i];
      ctx.fillStyle = PADDLE_COLOR;
      ctx.fillRect(p.paddle.x, p.paddle.y, p.paddle.width, p.paddle.height);
      scores[i].innerText = p.score;
      if (p.score >= MAX_SCORE) {
        if (i == PLAYER_INDEX) alert("You Won!");
        else alert("You Lost...");
        location.href = location.href;
      }
    }
  }

  function render(ctx, ball, players, scores) {
    renderBoard(ctx);
    renderBall(ctx, ball);
    renderPlayers(ctx, players, scores);
  }

  // Exports
  exports.createBall = createBall;
  exports.createPlayers= createPlayers;
  exports.getScoreDisplays = getScoreDisplays;
  exports.createCtx = createCtx;
  exports.listenKeyPresses = listenKeyPresses;
  exports.updateBallAndScore = updateBallAndScore;
  exports.updatePlayers = updatePlayers;
  exports.render = render;
})(pong);

(function () {
  let ball = pong.createBall();
  let players = pong.createPlayers();
  let scores = pong.getScoreDisplays(['your_score', 'opponent_score']);
  let ctx = pong.createCtx();
  let keysDown = pong.listenKeyPresses();
  let animate = window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    function(callback) { window.setTimeout(callback, 1000/60) };

  animate(function step() {
    pong.updatePlayers(players, ball, keysDown);
    pong.updateBallAndScore(ball, players);
    pong.render(ctx, ball, players, scores);
    animate(step);
  });
})();
