(() => {
  const trigger = document.getElementById('snake-trigger');
  const dialog = document.getElementById('snake-dialog');
  const closeButton = document.getElementById('snake-close');
  const startButton = document.getElementById('snake-start');
  const board = document.getElementById('snake-board');
  const context = board.getContext('2d');
  const scoreDisplay = document.getElementById('snake-score');
  const bestDisplay = document.getElementById('snake-best');
  const message = document.getElementById('snake-message');

  const cells = 20;
  const cellSize = board.width / cells;

  const vectors = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 }
  };

  let snake;
  let food;
  let direction;
  let nextDirection;
  let timer;
  let score = 0;
  let playing = false;
  let best = 0;

  try {
    best = Number(localStorage.getItem('portfolio-snake-best')) || 0;
  } catch (_) {
    // Browser storage may be disabled.
  }

  bestDisplay.textContent = best;

  function draw() {
    context.fillStyle = '#0a0a0f';
    context.fillRect(0, 0, board.width, board.height);

    if (food) {
      context.fillStyle = '#ff8ab4';
      context.beginPath();
      context.arc(
        (food.x + 0.5) * cellSize,
        (food.y + 0.5) * cellSize,
        cellSize * 0.34,
        0,
        Math.PI * 2
      );
      context.fill();
    }

    snake.forEach((part, index) => {
      context.fillStyle = index === 0 ? '#55e7ff' : '#8e72ff';
      context.fillRect(
        part.x * cellSize + 2,
        part.y * cellSize + 2,
        cellSize - 4,
        cellSize - 4
      );
    });
  }

  function placeFood() {
    const empty = [];

    for (let y = 0; y < cells; y++) {
      for (let x = 0; x < cells; x++) {
        if (!snake.some(part => part.x === x && part.y === y)) {
          empty.push({ x, y });
        }
      }
    }

    if (empty.length === 0) return null;
    return empty[Math.floor(Math.random() * empty.length)];
  }

  function stop(text) {
    clearInterval(timer);
    playing = false;
    message.textContent = text;
    startButton.textContent = 'Play again';
  }

  function tick() {
    direction = nextDirection;

    // Wrap around when the snake crosses an edge.
    const head = {
      x: (snake[0].x + direction.x + cells) % cells,
      y: (snake[0].y + direction.y + cells) % cells
    };

    const eating = head.x === food.x && head.y === food.y;
    const body = eating ? snake : snake.slice(0, -1);

    // Hitting the snake's body still ends the game.
    if (body.some(part => part.x === head.x && part.y === head.y)) {
      stop(`Game over! Score: ${score}.`);
      return;
    }

    snake.unshift(head);

    if (eating) {
      score++;
      scoreDisplay.textContent = score;

      if (score > best) {
        best = score;
        bestDisplay.textContent = best;

        try {
          localStorage.setItem('portfolio-snake-best', best);
        } catch (_) {
          // Browser storage may be disabled.
        }
      }

      food = placeFood();

      if (!food) {
        draw();
        stop('You filled the board. You win!');
        return;
      }
    } else {
      snake.pop();
    }

    draw();
  }

  function start() {
    clearInterval(timer);

    snake = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 }
    ];

    direction = vectors.right;
    nextDirection = direction;
    food = placeFood();
    score = 0;
    scoreDisplay.textContent = 0;
    message.textContent = 'Use arrow keys, WASD, or the buttons below.';
    startButton.textContent = 'Restart';
    playing = true;

    draw();
    timer = setInterval(tick, 125);
  }

  function turn(name) {
    if (!playing) return;

    const proposed = vectors[name];

    // Don't allow a direct 180-degree turn.
    if (
      proposed.x !== -direction.x ||
      proposed.y !== -direction.y
    ) {
      nextDirection = proposed;
    }
  }

  function open() {
    dialog.hidden = false;
    document.body.classList.add('snake-open');
    closeButton.focus();
  }

  function close() {
    clearInterval(timer);
    playing = false;
    dialog.hidden = true;
    document.body.classList.remove('snake-open');
    trigger.focus();
  }

  // Show a preview of the board before the game starts.
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 }
  ];
  food = { x: 15, y: 10 };
  draw();

  trigger.addEventListener('click', open);
  closeButton.addEventListener('click', close);
  startButton.addEventListener('click', start);

  dialog.addEventListener('click', event => {
    if (event.target === dialog) close();
  });

  dialog.querySelectorAll('[data-direction]').forEach(button => {
    button.addEventListener('click', () => {
      turn(button.dataset.direction);
    });
  });

  document.addEventListener('keydown', event => {
    if (dialog.hidden) return;

    if (event.key === 'Escape') {
      close();
      return;
    }

    if (event.key === 'Tab') {
      const focusable = [...dialog.querySelectorAll('button')];

      if (event.shiftKey && document.activeElement === focusable[0]) {
        event.preventDefault();
        focusable.at(-1).focus();
      } else if (
        !event.shiftKey &&
        document.activeElement === focusable.at(-1)
      ) {
        event.preventDefault();
        focusable[0].focus();
      }
    }

    const keys = {
      ArrowUp: 'up',
      ArrowDown: 'down',
      ArrowLeft: 'left',
      ArrowRight: 'right',
      w: 'up',
      s: 'down',
      a: 'left',
      d: 'right'
    };

    const directionName = keys[event.key];

    if (directionName) {
      event.preventDefault();
      turn(directionName);
    }
  });
})();
