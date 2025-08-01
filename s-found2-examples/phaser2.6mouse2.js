var MyState = {
    create: function() {
          this.sprites = sprites[obj].sprite;
          sprites[obj].sprite.inputEnabled = false;
    },
    
    update: function() {
        // Example: Enable and add click event after 5 seconds
        for(var obj in sprites){
          		this.sprite = sprites[obj].sprite;
      	
                 if (this.game.time.now > 5000 && !this.sprite.inputEnabled) {
                      this.sprite.inputEnabled = true;
                      this.sprite.events.onInputDown.add(this.onBoardClick, this);
                  }
        }
    },
    
    onBoardClick: function(sprite, pointer) {
        //embed this in code anc call mouse click event, send key
        onSpriteClick(sprite,pointer)
        //let { x, y, width, height } = sprite.getBounds();
        //let row = Math.floor((pointer.y - y) * 3 / height);
        //let column = Math.floor((pointer.x - x) * 3 / width);
        //console.log(`Clicked at row: ${row}, column: ${column}`);
    }
};

// Initialize the game
var game = new Phaser.Game(800, 600, Phaser.AUTO, '', MyState);

function onSpriteClick(sprite,pointer){
    alert("key:"+sprite.key);
}