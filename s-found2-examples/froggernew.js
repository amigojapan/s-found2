

//main

var offsetx, number_of_lilipads, lili_count, on_log;

/**
 * Describe this function...
 */
function send_frog_to_home() {
  set_current_sprite_name("frog");
  var go=find_sprite_object_by_name_new(current_sprite_name);
  go.sprite.bringToTop();
  point_in_direction_degrees(90);
  set_y_to(370);
  set_x_to(300);
  show_current_sprite();
}


function ON_STARTUP(){
  lili_count = 7;
  set_current_sprite_name("car");
  point_in_direction_degrees(0);
  set_y_to(270);
  set_x_to(580);
  set_current_sprite_name("truck");
  point_in_direction_degrees(0);
  set_x_to(580);
  set_y_to(322);
  set_current_sprite_name("racer2");
  point_in_direction_degrees(0);
  set_x_to(580);
  set_y_to(217);
  set_current_sprite_name("racer1");
  point_in_direction_degrees(0);
  set_x_to(0);
  set_y_to(295);
  set_current_sprite_name("dozer");
  point_in_direction_degrees(0);
  set_x_to(0);
  set_y_to(245);
  set_current_sprite_name("longlog1");
  set_x_to(0);
  set_y_to(167);
  set_current_sprite_name("shortlog1");
  set_x_to(580);
  set_y_to(140);
  set_current_sprite_name("shortlog2");
  set_x_to(0);
  set_y_to(113);
  set_current_sprite_name("longlog2");
  set_x_to(580);
  set_y_to(80);
  set_current_sprite_name("lilipad");
  //hide_current_sprite();
  number_of_lilipads = 7;
  offsetx = 44;
  for (var count = 0; count < number_of_lilipads; count++) {
    clone_sprite();
    show_current_sprite();
  }
  const alignLily = function() {
    set_current_clone_x_to(offsetx);
    set_current_clone_y_to(43);
    offsetx = offsetx + 84;
  };
  for_each_clone(alignLily);
  send_frog_to_home();
  set_current_sprite_name("lilipad");
  hide_current_sprite();
}
function UP_KEY_PRESSED(){
  set_current_sprite_name("frog");
  point_in_direction_degrees(90);
  set_y_to(parseInt(get_y_value()) - 15);

}
function LEFT_KEY_PRESSED(){
  set_current_sprite_name("frog");
  point_in_direction_degrees(180);
  set_x_to(parseInt(get_x_value()) - 15);

}
function DOWN_KEY_PRESSED(){
  set_current_sprite_name("frog");
  point_in_direction_degrees(270);
  set_y_to(parseInt(get_y_value()) + 15);

}
function RIGHT_KEY_PRESSED(){
  set_current_sprite_name("frog");
  point_in_direction_degrees(0);
  set_x_to(parseInt(get_x_value()) + 15);

}
timersObj['car_spawn'] = function() {
  set_current_sprite_name("car");
  clone_sprite();
  set_current_sprite_name("truck");
  clone_sprite();
  set_current_sprite_name("racer2");
  clone_sprite();
  set_current_sprite_name("racer1");
  clone_sprite();
  set_current_sprite_name("dozer");
  clone_sprite();
  set_current_sprite_name("longlog1");
  clone_sprite();
  set_current_sprite_name("longlog2");
  clone_sprite();
  set_current_sprite_name("shortlog1");
  clone_sprite();
  set_current_sprite_name("shortlog2");
  clone_sprite();

}
var ID = setInterval(timersObj['car_spawn'], 5000);
timerIDs.push(ID);

function EACH_FRAME(){
  set_target_sprite_name("frog");
  var speed
  const checkForCollisionwithCar = function() {
    set_current_clone_x_to(get_x_value() - speed);
    if (is_colliding_with_target()) {
      send_frog_to_home();
    }
  };
  set_current_sprite_name("car");
  speed=3
  for_each_clone(checkForCollisionwithCar);
  set_current_sprite_name("truck");
  speed=2.5
  for_each_clone(checkForCollisionwithCar);
  set_current_sprite_name("racer2");
  speed=5
  for_each_clone(checkForCollisionwithCar);
  set_current_sprite_name("racer1");
  speed=-5
  for_each_clone(checkForCollisionwithCar);
  set_current_sprite_name("dozer");
  speed=-2
  for_each_clone(checkForCollisionwithCar);
  const checkForFrogOnLog = function() {
    set_current_clone_x_to(get_x_value() - speed);
    if (is_colliding_with_target()) {
      on_log = 'yes';
    }
  };
  set_current_sprite_name("longlog1");
  speed=-3
  for_each_clone(checkForFrogOnLog);
  set_current_sprite_name("longlog2");
  speed=3
  for_each_clone(checkForFrogOnLog);
  set_current_sprite_name("shortlog1");
  speed=2
  for_each_clone(checkForFrogOnLog);
  set_current_sprite_name("shortlog2");
  speed=-2
  for_each_clone(checkForFrogOnLog);
  set_current_sprite_name("frog");
  if (on_log == 'no' && parseInt(get_y_value()) <= 170) {
    send_frog_to_home();
  }
  on_log = 'no';
  set_target_sprite_name("frog");
  set_current_sprite_name("lilipad");  
  const liliCount = function() {
    if (is_colliding_with_target()) {
      set_current_sprite_name("frog");
      send_frog_to_home();
      destroy_current_clone();
      lili_count = lili_count - 1;
    }
  };
  for_each_clone(liliCount);
  if (lili_count == 0) {
    if(evalRun){echo('GAME OVER - YOU WIN');}
  }
  set_current_sprite_name("frog");
  var go=find_sprite_object_by_name(current_sprite_name);
  go.sprite.bringToTop();
}