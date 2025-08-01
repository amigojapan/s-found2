
var down, direction, number_of_aliens, origin_x, offset_x, offset_y, alive, ship_x;


function ON_STARTUP(){
  alive = true;
  set_current_sprite_name("ship");
  set_x_to(300);
  set_y_to(375);
  show_current_sprite();
  set_current_sprite_name("bullet");
  show_current_sprite();
  set_y_to(-100);
  set_current_sprite_name("alien");
  hide_current_sprite();
  for (var count = 0; count < 15; count++) {
    clone_sprite();
  }
  number_of_aliens = 1;
  origin_x=0;
  offset_y = 30;
  origin_x = 30;
  offset_x = origin_x;
  const alignAliens = function() {
    set_current_clone_x_to(offset_x);
    set_current_clone_y_to(offset_y);
    offset_x = offset_x + 70;
    if (number_of_aliens % 5 == 0) {
      offset_y = offset_y + 70;
      offset_x = origin_x;
    }
    number_of_aliens = number_of_aliens + 1;
  };
  for_each_clone(alignAliens); 
  direction = 'r';
  down = false;

}
function EACH_FRAME(){
  if (alive) {
    set_current_sprite_name("alien");
    var game_object;
    game_object=find_sprite_object_by_name(current_sprite_name);
    const setLeftRight = function() {
      if (parseInt(get_x_value()) >= 550) {
        direction = 'l';
        down = true;
      }
      if (parseInt(get_x_value()) <= 20) {
        direction = 'r';
        down = true;
      }
    };
    for_each_clone(setLeftRight); 

    const moveLeftAndRight = function() {
      if (direction == 'r') {
        set_current_clone_x_to(get_x_value() + 5);
      }
      if (direction == 'l') {
        set_current_clone_x_to(get_x_value() - 5);
      }
    };
    for_each_clone(moveLeftAndRight); 

    const moveDown = function() {
      if (down == true) {
        set_current_clone_y_to(get_y_value() + 20);
      }
    };
    for_each_clone(moveDown); 
    current_clone=null;
    down = false;

    set_current_sprite_name("alien");
    set_target_sprite_name("bullet");
    const checkBulletCollision = function() {
      if (is_colliding_with_target()) {
        destory_current_clone();
        set_current_sprite_name("bullet");
        set_y_to(-100);
        set_current_sprite_name("alien");
      }
    };
    for_each_clone(checkBulletCollision); 

    set_target_sprite_name("ship");
    const checkForShipAndAlienCollision = function() {
      if (is_colliding_with_target()) {
        set_current_sprite_name("alien");
        hide_current_sprite();
        alive = false;
      }
    };
    for_each_clone(checkForShipAndAlienCollision); 
    set_current_sprite_name("bullet");
    set_y_to(get_y_value() - 10);
  }
}
function LEFT_KEY_PRESSED(){
  set_current_sprite_name("ship");
  set_x_to(parseInt(get_x_value()) - 10);

}
function RIGHT_KEY_PRESSED(){
  set_current_sprite_name("ship");
  set_x_to(parseInt(get_x_value()) + 10);

}
function UP_KEY_PRESSED(){
  if (alive) {
    set_current_sprite_name("ship");
    ship_x = parseInt(get_x_value());
    set_current_sprite_name("bullet");
    set_x_to(ship_x);
    set_y_to(400);
    show_current_sprite();
  }

}var pollEvent = function() {
	if (typeof EACH_FRAME !== 'undefined' && evalRun) {
		EACH_FRAME();
	}
	if (cursors.left.isDown||onScreenKeyboard.btnLeftPressed) {
		if (typeof LEFT_KEY_PRESSED !== 'undefined') {
			LEFT_KEY_PRESSED();
		}
	}
	if (cursors.right.isDown||onScreenKeyboard.btnRightPressed) {
		if (typeof RIGHT_KEY_PRESSED !== 'undefined') {
			RIGHT_KEY_PRESSED();
		}
	}
	if (cursors.up.isDown||onScreenKeyboard.btnUpPressed) {
		if (typeof UP_KEY_PRESSED !== 'undefined') {
			UP_KEY_PRESSED();
		}
	}
	if (cursors.down.isDown||onScreenKeyboard.btnDownPressed) {
		if (typeof DOWN_KEY_PRESSED !== 'undefined') {
			DOWN_KEY_PRESSED();
		}
	}
	if (aKey.isDown||onScreenKeyboard.btnAPressed) {
		if (typeof A_KEY_PRESSED !== 'undefined') {
			A_KEY_PRESSED();
		}
	}
	if (bKey.isDown||onScreenKeyboard.btnBPressed) {
		if (typeof B_KEY_PRESSED !== 'undefined') {
			B_KEY_PRESSED();
		}
	}
}