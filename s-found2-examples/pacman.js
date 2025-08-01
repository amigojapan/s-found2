//main

var maze, cellSize, walls, pellets, ghosts, direction, desiredDirection, score, lives, collisionDirection, saved_x, saved_y;
var ghostDirection, desiredDirectionGhost1, ghostDirection2, desiredDirectionGhost2;
var alerted

function rotateMatrix(matrix) {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const rotatedMatrix = Array(cols).fill(null).map(() => Array(rows));
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      rotatedMatrix[j][rows - 1 - i] = matrix[i][j];
    }
  }
  return rotatedMatrix;
}

function ON_STARTUP() {
  // Define the maze: 1 = wall, 0 = empty path, 2 = pellet
 //coockie 
 maze = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,2,1,1,1,1,1,1,1,1,1,1,1,2,1,2,1],
    [1,2,1,2,1,1,2,2,2,2,2,2,2,1,1,2,1,2,1],
    [1,2,1,2,1,1,2,1,1,1,1,1,2,1,1,2,1,2,1],
    [1,2,1,2,1,1,2,1,1,1,1,1,2,1,1,2,1,2,1],
    [1,2,1,2,1,1,2,2,2,2,2,2,2,1,1,2,1,2,1],
    [1,2,1,2,1,1,1,1,1,2,1,1,1,1,1,2,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,1,1,1,2,1,1,1,1,1,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
  ];
  maze = rotateMatrix(maze);
  cellSize = 34;

  // Create wall
  for (var row = 0; row < maze.length; row++) {
    for (var col = 0; col < maze[row].length; col++) {
      if (maze[row][col] == 1) {
        set_current_sprite_name('wall');
        clone_sprite();
        set_x_to(row * cellSize);
        set_y_to(col * cellSize);
      }
    }
  }

  // Create pellets
  for (var row = 0; row < maze.length; row++) {
    for (var col = 0; col < maze[row].length; col++) {
      if (maze[row][col] == 2) {
        set_current_sprite_name('pellet');
        clone_sprite();
        set_x_to(row * cellSize);
        set_y_to(col * cellSize);
      }
    }
  }

  // Create Pac-Man
  set_current_sprite_name("pacman");
  set_x_to(cellSize * 1);
  set_y_to(cellSize * 1);
  show_current_sprite();

  // Create ghost1
  set_current_sprite_name("ghost");
  set_x_to(cellSize * 1);
  set_y_to(cellSize * 10);
  show_current_sprite();

  // Create ghost2
  set_current_sprite_name("ghost2");
  set_x_to(cellSize * 1);
  set_y_to(cellSize * 12);
  show_current_sprite();

  // Initialize game state
  direction = 'stop';
  desiredDirection = 'stop';
  ghostDirection = 'stop';
  desiredDirectionGhost1 = 'stop';
  ghostDirection2 = 'stop';
  desiredDirectionGhost2 = 'stop';
  score = 0;
  lives = 3;

  // Start the ghost1 movement timer
  startTimer();
}

function moveCharater(charaterName) {
  set_current_sprite_name(charaterName);
  var x = get_x_value();
  var y = get_y_value();
  
  // Find the nearest grid cell center
  var nearestRow = Math.round(x / cellSize);
  var nearestCol = Math.round(y / cellSize);
  var centerX = nearestRow * cellSize;
  var centerY = nearestCol * cellSize;
  var tolerance = 5;

  // Check if character is near a grid center for direction changes
  if (Math.abs(x - centerX) < tolerance && Math.abs(y - centerY) < tolerance) {
    if (charaterName == "ghost") {
      if (desiredDirectionGhost1 != ghostDirection) {
        var canTurn = false;
        if (desiredDirectionGhost1 == 'right' && nearestRow + 1 < maze.length && maze[nearestRow + 1][nearestCol] != 1) {
          canTurn = true;
        } else if (desiredDirectionGhost1 == 'left' && nearestRow - 1 >= 0 && maze[nearestRow - 1][nearestCol] != 1) {
          canTurn = true;
        } else if (desiredDirectionGhost1 == 'up' && nearestCol - 1 >= 0 && maze[nearestRow][nearestCol - 1] != 1) {
          canTurn = true;
        } else if (desiredDirectionGhost1 == 'down' && nearestCol + 1 < maze[0].length && maze[nearestRow][nearestCol + 1] != 1) {
          canTurn = true;
        }
        if (canTurn) {
          ghostDirection = desiredDirectionGhost1;
        }
      }
      // Check if current direction is still valid
      var canContinue = true;
      if (ghostDirection == 'right' && (nearestRow + 1 >= maze.length || maze[nearestRow + 1][nearestCol] == 1)) {
        canContinue = false;
      } else if (ghostDirection == 'left' && (nearestRow - 1 < 0 || maze[nearestRow - 1][nearestCol] == 1)) {
        canContinue = false;
      } else if (ghostDirection == 'up' && (nearestCol - 1 < 0 || maze[nearestRow][nearestCol - 1] == 1)) {
        canContinue = false;
      } else if (ghostDirection == 'down' && (nearestCol + 1 >= maze[0].length || maze[nearestRow][nearestCol + 1] == 1)) {
        canContinue = false;
      }
      if (!canContinue) {
        ghostDirection = 'stop';
      }
    } else if (charaterName == "ghost2") {
      // Get Pac-Man's position
      set_current_sprite_name("pacman");
      var pacmanX = get_x_value();
      var pacmanY = get_y_value();
      set_current_sprite_name("ghost2");
      
      // Evaluate possible directions
      var possibleDirections = [];
      var distances = [];
      if (nearestRow + 1 < maze.length && maze[nearestRow + 1][nearestCol] != 1) {
        possibleDirections.push('right');
        var newX = (nearestRow + 1) * cellSize;
        var newY = nearestCol * cellSize;
        distances.push(Math.sqrt((newX - pacmanX) ** 2 + (newY - pacmanY) ** 2));
      }
      if (nearestRow - 1 >= 0 && maze[nearestRow - 1][nearestCol] != 1) {
        possibleDirections.push('left');
        var newX = (nearestRow - 1) * cellSize;
        var newY = nearestCol * cellSize;
        distances.push(Math.sqrt((newX - pacmanX) ** 2 + (newY - pacmanY) ** 2));
      }
      if (nearestCol - 1 >= 0 && maze[nearestRow][nearestCol - 1] != 1) {
        possibleDirections.push('up');
        var newX = nearestRow * cellSize;
        var newY = (nearestCol - 1) * cellSize;
        distances.push(Math.sqrt((newX - pacmanX) ** 2 + (newY - pacmanY) ** 2));
      }
      if (nearestCol + 1 < maze[0].length && maze[nearestRow][nearestCol + 1] != 1) {
        possibleDirections.push('down');
        var newX = nearestRow * cellSize;
        var newY = (nearestCol + 1) * cellSize;
        distances.push(Math.sqrt((newX - pacmanX) ** 2 + (newY - pacmanY) ** 2));
      }
      
      // Choose direction with minimum distance
      if (possibleDirections.length > 0) {
        var minDistance = Math.min(...distances);
        var minIndex = distances.indexOf(minDistance);
        desiredDirectionGhost2 = possibleDirections[minIndex];
        ghostDirection2 = desiredDirectionGhost2;
      } else {
        ghostDirection2 = 'stop';
      }
      
      // Check if current direction is still valid
      var canContinue = true;
      if (ghostDirection2 == 'right' && (nearestRow + 1 >= maze.length || maze[nearestRow + 1][nearestCol] == 1)) {
        canContinue = false;
      } else if (ghostDirection2 == 'left' && (nearestRow - 1 < 0 || maze[nearestRow - 1][nearestCol] == 1)) {
        canContinue = false;
      } else if (ghostDirection2 == 'up' && (nearestCol - 1 < 0 || maze[nearestRow][nearestCol - 1] == 1)) {
        canContinue = false;
      } else if (ghostDirection2 == 'down' && (nearestCol + 1 >= maze[0].length || maze[nearestRow][nearestCol + 1] == 1)) {
        canContinue = false;
      }
      if (!canContinue) {
        ghostDirection2 = 'stop';
      }
    } else { // Pac-Man
      if (desiredDirection != direction) {
        var canTurn = false;
        if (desiredDirection == 'right' && nearestRow + 1 < maze.length && maze[nearestRow + 1][nearestCol] != 1) {
          canTurn = true;
        } else if (desiredDirection == 'left' && nearestRow - 1 >= 0 && maze[nearestRow - 1][nearestCol] != 1) {
          canTurn = true;
        } else if (desiredDirection == 'up' && nearestCol - 1 >= 0 && maze[nearestRow][nearestCol - 1] != 1) {
          canTurn = true;
        } else if (desiredDirection == 'down' && nearestCol + 1 < maze[0].length && maze[nearestRow][nearestCol + 1] != 1) {
          canTurn = true;
        }
        if (canTurn) {
          direction = desiredDirection;
        }
      }
      // Check if current direction is still valid
      var canContinue = true;
      if (direction == 'right' && (nearestRow + 1 >= maze.length || maze[nearestRow + 1][nearestCol] == 1)) {
        canContinue = false;
      } else if (direction == 'left' && (nearestRow - 1 < 0 || maze[nearestRow - 1][nearestCol] == 1)) {
        canContinue = false;
      } else if (direction == 'up' && (nearestCol - 1 < 0 || maze[nearestRow][nearestCol - 1] == 1)) {
        canContinue = false;
      } else if (direction == 'down' && (nearestCol + 1 >= maze[0].length || maze[nearestRow][nearestCol + 1] == 1)) {
        canContinue = false;
      }
      if (!canContinue) {
        direction = 'stop';
      }
    }
  }

  // Move the character every frame
  var speed = 10;
  if (charaterName == "ghost") {
    if (ghostDirection == 'right') {
      set_x_to(get_x_value() + speed);
    } else if (ghostDirection == 'left') {
      set_x_to(get_x_value() - speed);
    } else if (ghostDirection == 'up') {
      set_y_to(get_y_value() - speed);
    } else if (ghostDirection == 'down') {
      set_y_to(get_y_value() + speed);
    }
  } else if (charaterName == "ghost2") {
    speed = 3.5;
    if (ghostDirection2 == 'right') {
      set_x_to(get_x_value() + speed);
    } else if (ghostDirection2 == 'left') {
      set_x_to(get_x_value() - speed);
    } else if (ghostDirection2 == 'up') {
      set_y_to(get_y_value() - speed);
    } else if (ghostDirection2 == 'down') {
      set_y_to(get_y_value() + speed);
    }
  } else { // Pac-Man
    speed = 10;
    if (direction == 'right') {
      set_x_to(get_x_value() + speed);
    } else if (direction == 'left') {
      set_x_to(get_x_value() - speed);
    } else if (direction == 'up') {
      set_y_to(get_y_value() - speed);
    } else if (direction == 'down') {
      set_y_to(get_y_value() + speed);
    }
  }
}

function EACH_FRAME() {
  moveCharater("pacman");
  moveCharater("ghost");
  moveCharater("ghost2");

  // Check for pellet collection
  current_clone = null;
  set_current_sprite_name("pellet");
  set_target_sprite_name("pacman");
  const myFunction = function() {
    if (is_colliding_with_target()) {
      destory_current_clone();
      score += 10;
    }
  };
  for_each_clone_new(myFunction);

  // Check for ghost collisions (ghost)
  set_current_sprite_name("ghost");
  set_target_sprite_name("pacman");
  if (is_colliding_with_target()) {
    lives--;
    if (lives <= 0) {
      //alert("Game over");
    } else {
      set_current_sprite_name("pacman");
      set_x_to(cellSize * 1);
      set_y_to(cellSize * 1);
      direction = 'stop';
      desiredDirection = 'stop';
    }
  }

  // Check for ghost collisions (ghost2)
  set_current_sprite_name("ghost2");
  set_target_sprite_name("pacman");
  if (is_colliding_with_target()) {
    lives--;
    if (lives <= 0) {
    if (alerted != 'yes') {
    	alert("Game over");
    	alerted ='yes';
    }

      
    } else {
      set_current_sprite_name("pacman");
      set_x_to(cellSize * 1);
      set_y_to(cellSize * 1);
      direction = 'stop';
      desiredDirection = 'stop';
    }
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

let timerVariable;
function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function startTimer() {
  timerVariable = setInterval(function() {
    let randomNumber = getRandomIntInclusive(1, 4);
    switch(randomNumber) {
      case 1:
        desiredDirectionGhost1 = "up";
        break;
      case 2:
        desiredDirectionGhost1 = "down";
        break;
      case 3:
        desiredDirectionGhost1 = "left";
        break;
      case 4:
        desiredDirectionGhost1 = "right";
        break;
    }
  }, 3000);
}

function stopTimer() {
  clearInterval(timerVariable);
}