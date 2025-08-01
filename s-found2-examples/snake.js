var maxRow = 13;
var maxCol = 19;
var cellSize = 32;
var snakePositions = [[5, 5], [5, 4], [5, 3]]; // Initial snake positions: [row, col]
var currentDirection = 'right';
var desiredDirection = 'right';
var foodPosition = [];
var gameOver = false;
var frameCounter = 0;
var foodClone = null;

function ON_STARTUP() {
  // Destroy existing snake segments
  current_clone = null;
  set_current_sprite_name('snake_segment');
  var game_object = find_sprite_object_by_name(current_sprite_name);
  for (var clone in game_object.clones) {
    current_clone = clone;
    hide_current_sprite();
    destroy_current_sprite();
  }

  // Create initial snake segments
  for (var i = 0; i < snakePositions.length; i++) {
    clone_sprite();
    set_x_to(snakePositions[i][1] * cellSize);
    set_y_to(snakePositions[i][0] * cellSize);
    //show_current_sprite();
  }

  // Create food sprite
  set_current_sprite_name('food');
  //clone_sprite();
  place_food();
  console.log("Food initialized at", foodPosition);
}

function place_food() {
  while (true) {
    // Constrain food to rows 1-18, cols 1-20 to avoid edges
    var row = Math.floor(Math.random() * (maxRow - 2)) + 1; // 1 to 18
    var col = Math.floor(Math.random() * (maxCol - 2)) + 1; // 1 to 20
    if (!snakePositions.some(pos => pos[0] === row && pos[1] === col)) {
      foodPosition = [row, col];
      set_current_sprite_name('food');
      current_clone = foodClone; // Reuse food clone
      set_x_to(col * cellSize);
      set_y_to(row * cellSize);
      show_current_sprite();
      console.log("Food placed at", foodPosition);
      break;
    }
  }
}

function EACH_FRAME() {
  if (!gameOver) {
    frameCounter++;
    if (frameCounter % 5 === 0) { // Move every 5 frames
      perform_move();
    }
  }
}
function perform_move() {
  // Update direction if not reversing
  if ((currentDirection === 'right' && desiredDirection !== 'left') ||
      (currentDirection === 'left' && desiredDirection !== 'right') ||
      (currentDirection === 'up' && desiredDirection !== 'down') ||
      (currentDirection === 'down' && desiredDirection !== 'up')) {
    currentDirection = desiredDirection;
  }

  // Calculate new head position
  var head = snakePositions[0];
  var dRow = 0, dCol = 0;
  if (currentDirection === 'right') dCol = 1;
  else if (currentDirection === 'left') dCol = -1;
  else if (currentDirection === 'up') dRow = -1;
  else if (currentDirection === 'down') dRow = 1;
  var newRow = head[0] + dRow;
  var newCol = head[1] + dCol;
  var newHead = [newRow, newCol];

  // Check boundaries
  if (newRow < 0 || newRow >= maxRow || newCol < 0 || newCol >= maxCol) {
    gameOver = true;
    console.log("Game over: Out of bounds at", newHead);
    return;
  }

  // Check collision with self
  if (snakePositions.slice(1).some(pos => pos[0] === newRow && pos[1] === newCol)) {
    gameOver = true;
    console.log("Game over: Self collision at", newHead);
    return;
  }

  // Check food collision
  var growing = false;
  if (newRow === foodPosition[0] && newCol === foodPosition[1]) {
    growing = true;
    place_food();
  }

  // Update snake positions
  if (growing) {
    snakePositions = [newHead].concat(snakePositions);
  } else {
    snakePositions = [newHead].concat(snakePositions.slice(0, -1));
  }

  // Destroy existing snake segments
  const myFunction = function() {
  		destory_current_clone();
  };
  for_each_clone(myFunction);
  
  // Recreate snake segments
  for (var i = 0; i < snakePositions.length; i++) {
    set_current_sprite_name('snake_segment');
    clone_sprite();
    set_x_to(snakePositions[i][1] * cellSize);
    set_y_to(snakePositions[i][0] * cellSize);
    show_current_sprite();
    console.log("Placed segment at", snakePositions[i]);
  }
}


function LEFT_KEY_PRESSED() {
  desiredDirection = 'left';
}

function RIGHT_KEY_PRESSED() {
  desiredDirection = 'right';
}

function UP_KEY_PRESSED() {
  desiredDirection = 'up';
}

function DOWN_KEY_PRESSED() {
  desiredDirection = 'down';
}