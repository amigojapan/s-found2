var gridSize = 13;
var cellSize = 32; // Assuming each sprite is 32x32 pixels
var wallGrid = [];
var moleGrid = [];
var isMoleGrid = [];
var score = 0;
var misses = 0;
var totalClicks = 0;
var gameTime = 30; // Game duration in seconds
var moleTimer
var gameTimer
// Initialize the game on startup
function ON_STARTUP() {
  // Create the 10x10 grid with wall and mole sprites
  for (var row = 0; row < gridSize; row++) {
    wallGrid[row] = [];
    moleGrid[row] = [];
    isMoleGrid[row] = [];
    for (var col = 0; col < gridSize; col++) {
      // Create and position wall sprite (empty slot)
      set_current_sprite_name('wall');
      clone_sprite();
      var wallClone = find_last_clone();
      set_x_to(col * cellSize);
      set_y_to(row * cellSize);
      show_current_sprite();
      wallGrid[row][col] = wallClone.sprite;

      // Create and position mole sprite (mole), initially hidden
      set_current_sprite_name("ghost");
      clone_sprite();
      var moleClone = find_last_clone();
      set_x_to(col * cellSize);
      set_y_to(row * cellSize);
      hide_current_sprite();
      moleGrid[row][col] = moleClone.sprite;

      isMoleGrid[row][col] = false; // Track mole state
    }
  }
  // Start spawning moles every second
  moleTimer=setInterval(showMoles, 1000);

  // End the game after 60 seconds
  gameTimer=setTimeout(endGame, gameTime * 1000);
}

// Function to randomly spawn moles
function showMoles() {
  var numMoles = Math.floor(Math.random() * 3) + 1; // 1 to 5 moles
  for (var i = 0; i < numMoles; i++) {
    var row = Math.floor(Math.random() * gridSize);
    var col = Math.floor(Math.random() * gridSize);
    if (!isMoleGrid[row][col]) { // Only spawn if no mole is present
      isMoleGrid[row][col] = true;
      var wallSprite = wallGrid[row][col];
      wallSprite.visible = false; // Hide wall to show mole
      var moleSprite = moleGrid[row][col];
      moleSprite.visible = true; // Show mole (mole)

      // Revert back to wall after 2 seconds if not clicked
      setTimeout((function(r, c) {
        return function() {
          if (isMoleGrid[r][c]) {
            isMoleGrid[r][c] = false;
            var moleSprite = moleGrid[r][c];
            moleSprite.visible = false; // Hide mole
            var wallSprite = wallGrid[r][c];
            wallSprite.visible = true; // Show wall
          }
        };
      })(row, col), 2000);
    }
  }
}

// Handle sprite clicks
function onSpriteClick(spriteName,pointer,sprite){
  // Get the position of the clicked sprite using framework functions
  //alert("sprite:"+spriteName)
  if(spriteName=="ghost"){
    //alert("mole clicked");
    sprite.visible = false; // Hide mole
    var x = sprite.x;
    var y = sprite.y;
    var col = Math.floor(x / cellSize);
    var row = Math.floor(y / cellSize);

    // Check if the clicked position has a mole
    score++;
    totalClicks++;
    isMoleGrid[row][col] = false;
    var wallSprite = wallGrid[row][col];
    wallSprite.visible = true; // Show wall
    var moleSprite = moleGrid[row][col];
    moleSprite.visible = false; // Hide mole
  }else if(spriteName=="wall"){
    misses++;
    totalClicks++;
  }
}

// End the game and display the score
function endGame() {
    clearInterval(moleTimer)
    clearInterval(gameTimer)
  
    alert("Game over! Final Score: " + score+" misses: " + misses +" total clicks: " + totalClicks);
}
