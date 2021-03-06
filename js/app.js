// Note:
// position of objects in this program is in unit length,
// i.e., if the coodinates of an object is [1, 1],
// it refers to [1*BLOCK_WIDTH, 1*BLOCK_HEIGHT] on the canvas

// size of each block
var BLOCK_WIDTH = 101;
var BLOCK_HEIGHT = 83;

// row & column of the blockMatrix
var ROW = 6;
var COLUMN = 5;

// size of canvas
var WIDTH = BLOCK_WIDTH * COLUMN;
var HEIGHT = BLOCK_HEIGHT * ROW + 100;

// initial position of the player
var PLAYER_X = 2;
var PLAYER_Y = 5;

// enemys' offset on y-axis for them to stay middle vertically with a block
var ENEMY_Y_OFFSET = -0.2;

// flag for game not over
var inGame = 'true';
var win = 'false';

// define an array as flag of being occupied by other elements,
// such as rocks, other players;
// for a block ABC on row:2, col:4, let ABC_index = (2*COLUMN + 4*ROW),
// if it's blocked, then let occupiedBlocks[ABC_index] = 1
var occupiedBlocks = [];

// number of stars, represent for extra life
var starLife = 0;

// Enemies our currentPlayer must avoid
var Enemy = function() {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';

    // initialize position of a Enemy
    // x: set the Enemy to be out of the canvas
    // y: set the Enemy to be in a random row of 3 stone rows
    this.x = -3 + 2 * Math.random();
    this.y = ENEMY_Y_OFFSET + (Math.floor(3 * Math.random()) + 2);

    // set speed for a Enemy within [30, 70)
    this.speed = 2.5 + 3 * (Math.random() - 0.5);
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.

    // if the bug crawls out of canvas, innitialize its position and speed again
    if (this.x > COLUMN) {
        Enemy.call(this);
    }
    else {
        this.x += this.speed * dt;
    }

    // check collipse and game over
    // width of the player is 20px(0.24*BLOCK_WIDTH) shorter than BLOCK_WIDTH
    if (Math.abs(this.x - currentPlayer.x) < 1 - 0.24 &&
        Math.abs((this.y - ENEMY_Y_OFFSET) - currentPlayer.y) < 1) {
        if (starLife + currentPlayer.lives == 1) {
            inGame = 'false';
        }
        if (currentPlayer.lives == 0) {
            starLife--;
        }
        else {
            currentPlayer.lives--;
        }

        currentPlayer.x = PLAYER_X;
        currentPlayer.y = PLAYER_Y;
    }
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite),
                  this.x * BLOCK_WIDTH, this.y * BLOCK_HEIGHT);
};

// Now write your own Player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function(char) {
    // set the player's name
    this.name = char;

    // set sprite for the Player according to its character set
    this.sprite = 'images/char-' + char + '.png';

    // decide if the player should be drawn according to game process
    this.draw = 'false';

    // initialize position of the Player
    this.x = PLAYER_X;
    this.y = PLAYER_Y;

    // move values for updating the position, acquired in .handleInput()
    this.xMove = 0;
    this.yMove = 0;

    // position index of the player in the blockMatrix
    this.posIndex = this.y * COLUMN + this.x;

    // set lives for the player
    this.lives = 2;

    // flag for if the player crossed the river
    this.succeed = 'false';
}

// Update the currentPlayer's position
Player.prototype.update = function() {
    // check if the currentPlayer got the gem
    if (this.x == theGem.x && this.y == theGem.y) {
        theGem.get = 'true';
        theGem.x += this.xMove;
        theGem.y += this.yMove;
    }

    this.x += this.xMove;
    this.y += this.yMove;
    this.posIndex = this.y * COLUMN + this.x;

    // check if the currentPlayer is now on the other side
    if (this.y == 0 && this.succeed == 'false') {
        if (currentPlayerNum < 4) {
            // add this player's position index into occupiedBlocks
            occupiedBlocks[this.posIndex] = 1;

            // flag: player is now on the other side
            this.succeed = 'true';

            // new star and gem
            // if the star for previous player isn't got, don't create another
            if (typeof theStar != 'undefined' && theStar.get == 'false') {
                funObjIndex.splice(3, 1);
            }
            else {
                if (Math.random() < 0.5) {
                    funObjIndex.splice(2, 2);
                    theStar = new Star(funObjIndex);
                }
            }
            theGem = new Gem(funObjIndex);
            // console.log(funObjIndex);
        }
        else {
            win = 'true';
        }
    }

    // check if the currentPlayer got the star
    if (typeof theStar != 'undefined') {
        if (this.x == theStar.x && this.y == theStar.y && theStar.get == 'false') {
            theStar.get = 'true';
            starLife++;
        }
    }

    // reset move values
    this.xMove = 0;
    this.yMove = 0;
}

// Draw the player(s) on the screen
Player.prototype.render = function() {
    if (this.draw == 'true') {
        ctx.drawImage(Resources.get(this.sprite),
                      this.x * BLOCK_WIDTH, this.y * BLOCK_HEIGHT);
    }
}

// set move values according to user's keyboard input
// check if the input counts for a move according to currentPlayer's position
Player.prototype.handleInput = function(key) {
    if (inGame == 'true' && win == 'false') {
        switch (key) {
            case 'left':
                if (this.x > 0 &&
                occupiedBlocks[this.posIndex - 1] != 1) {
                    this.xMove = -1;
                }
                break;
            case 'up':
                if (this.y > 0 &&
                occupiedBlocks[this.posIndex - COLUMN] != 1) {
                    if (currentPlayer.y == 2 && theGem.get == 'false') {
                        break;
                    }
                    this.yMove = -1;
                }
                break;
            case 'right':
                if (this.x < COLUMN - 1 &&
                occupiedBlocks[this.posIndex + 1] != 1) {
                    this.xMove = 1;
                }
                break;
            case 'down':
                if (this.y < ROW - 1 &&
                occupiedBlocks[this.posIndex + COLUMN] != 1) {
                    this.yMove = 1;
                }
                break;
            default:
                break;
        }
    }
}

// check and display new player
var showNewPlayer = function() {
  for (var i = 0; i < allPlayers.length - 1; i++) {
    if (allPlayers[i].succeed == 'true' && allPlayers[i+1].draw == 'false') {
      currentPlayerNum++;
      currentPlayer = allPlayers[currentPlayerNum];
      currentPlayer.draw = 'true';
    }
  }
}

// super class for fun objects -- rocks, stars, gems
var FunObjs = function(funObjIndex, numOfRow) {
    this.funIndexGenerator(funObjIndex, numOfRow);
    this.y = Math.floor(this.posIndex/COLUMN);
    this.x = this.posIndex - this.y * COLUMN;
}

// generate unique index
FunObjs.prototype.funIndexGenerator = function(funObjIndex, numOfRow) {
    // numOfRow: started from row2, the number of rows that the object could appear
    // fun objects can't appear on the player's initial position
    funObjIndex.unshift(PLAYER_Y * COLUMN + PLAYER_X);
    // fun objects should have non-repeat indices
    do {
        this.posIndex = 2 * COLUMN + Math.floor(numOfRow * COLUMN * Math.random());
        var exist = funObjIndex.indexOf(this.posIndex) !== -1;
    } while (exist);
    funObjIndex.push(this.posIndex);
    // the player's initial index is actually not a funObjIndex, so shift it out
    funObjIndex.shift();
}

// rock class, occupy blocks so that player can't get in
var Rock = function(funObjIndex) {

    // Rock is a subclass of FunObjs
    // rocks appear in row2 ~ row5
    FunObjs.call(this, funObjIndex, 4);

    this.sprite = 'images/Rock.png';
}
// implement delegation
Rock.prototype = Object.create(FunObjs.prototype);
Rock.prototype.constructor = Rock;
Rock.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite),
                  this.x * BLOCK_WIDTH, this.y * BLOCK_HEIGHT);
}

// star class, gives player extra life that can be passed to the next
var Star = function(funObjIndex) {

    // Star is a subclass of FunObjs
    // star appear in row2 ~ row4
    FunObjs.call(this, funObjIndex, 3);

    this.sprite = 'images/Star.png';

    // flag for being got by player
    this.get = 'false';

}
// implement delegation
Star.prototype = Object.create(FunObjs.prototype);
Star.prototype.constructor = Star;
Star.prototype.render = function() {
    if (this.get == 'false') {
        ctx.drawImage(Resources.get(this.sprite),
                      this.x * BLOCK_WIDTH, this.y * BLOCK_HEIGHT);
    }
}

// gem class, enables player to cross water
var Gem = function(funObjIndex) {

    // Gem is a subclass of FunObjs
    // Gem appear in row2 ~ row4
    FunObjs.call(this, funObjIndex, 3);

    this.sprite = 'images/Gem.png';

    // flag for being got by player
    this.get = 'false';

}
// implement delegation
Gem.prototype = Object.create(FunObjs.prototype);
Gem.prototype.constructor = Gem;
Gem.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite),
                  this.x * BLOCK_WIDTH, this.y * BLOCK_HEIGHT);
}

// display game information, such as current player, lives left, game over
var renderGameInfo = function() {
    // the current player
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, WIDTH, 40);

    ctx.font = "24px 'Nunito Sans', sans-serif";
    ctx.fillStyle = "black";
    ctx.textAlign = "left";
    ctx.fillText("player: " + currentPlayer.name, 0, 30);

    // lives left
    ctx.textAlign = "right";
    ctx.fillText("lives: " + currentPlayer.lives + "    " +
                  String.fromCharCode(9733) + ": " + starLife, WIDTH, 30);

    // game over
    if (inGame == 'false' || win == 'true') {
        ctx.font = "60px 'Nunito Sans', sans-serif";
        ctx.fillStyle = "white";
        ctx.strokeStyle = "black";
        ctx.textAlign = "center";
        gameProcess = '';
        if (inGame == 'false') {
            gameProcess = 'GAME OVER';
        }
        else {
            gameProcess = 'YOU WIN!';
        }
        ctx.fillText(gameProcess, WIDTH/2, HEIGHT/2);
        ctx.strokeText(gameProcess, WIDTH/2, HEIGHT/2);
    }
}

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// var allEnemies = [new Enemy];
var allEnemies = [new Enemy, new Enemy, new Enemy, new Enemy];

// Place all player object in an array called allPlayers
// Initialize the currentPlayer object to be the first in allPlayers array
var allPlayers = [new Player('boy'), new Player('pink-girl'), new Player('cat-girl'),
                  new Player('horn-girl'), new Player('princess-girl')];

var currentPlayerNum = 0;
var currentPlayer = allPlayers[currentPlayerNum];
currentPlayer.draw = 'true';

// generate index for 2 rocks, 1 star, 1 Gem
var funObjIndex = [];

// Initialize 2 rocks
var allRocks = [new Rock(funObjIndex), new Rock(funObjIndex)];

// add rock's position index into occupiedBlocks
for (var i = 0; i < allRocks.length; i++) {
    occupiedBlocks[allRocks[i].posIndex] = 1;
}

// Initialize 1 Star, 50% possibility to meet star per player
if (Math.random() < 0.5) {
    var theStar = new Star(funObjIndex);
}

// Initialize 1 Gem
var theGem = new Gem(funObjIndex);
// console.log(funObjIndex);

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    currentPlayer.handleInput(allowedKeys[e.keyCode]);
});

// check and display new player
window.setInterval(showNewPlayer, 300);
