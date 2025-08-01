var MyState = {
    create: function() {
        // Create the sprite
      	game_objectA=find_sprite_object_by_name('arrow');
        this.sprite=game_objectA.sprite;
      	//this.sprite = this.game.add.sprite(100, 100, 'arrow');
        // Initially, input is disabled
        this.sprite.inputEnabled = false;
    },
    
    update: function() {
        // Example: Enable and add click event after 5 seconds
        if (this.game.time.now > 5000 && !this.sprite.inputEnabled) {
            this.sprite.inputEnabled = true;
            this.sprite.events.onInputDown.add(this.onBoardClick, this);
        }
    },
    
    onBoardClick: function(sprite, pointer) {
        alert(sprite.key);
        let { x, y, width, height } = sprite.getBounds();
        let row = Math.floor((pointer.y - y) * 3 / height);
        let column = Math.floor((pointer.x - x) * 3 / width);
        console.log(`Clicked at row: ${row}, column: ${column}`);
    }
};

// Initialize the game
var game = new Phaser.Game(800, 600, Phaser.AUTO, '', MyState);