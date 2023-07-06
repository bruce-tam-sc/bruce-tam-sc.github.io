// The point and size class used in this program
function Point(x, y) {
    this.x = (x)? parseFloat(x) : 0.0;
    this.y = (y)? parseFloat(y) : 0.0;
}

function Size(w, h) {
    this.w = (w)? parseFloat(w) : 0.0;
    this.h = (h)? parseFloat(h) : 0.0;
}

// Helper function for checking intersection between two rectangles
function intersect(pos1, size1, pos2, size2) {
    return (pos1.x < pos2.x + size2.w && pos1.x + size1.w > pos2.x &&
            pos1.y < pos2.y + size2.h && pos1.y + size1.h > pos2.y);
}


// The player class used in this program
function Player() {
    this.node = svgdoc.getElementById("player");
    this.position = PLAYER_INIT_POS;
    this.motion = motionType.NONE;
    this.verticalSpeed = 0;
}

function Bullet() {
    this.node = svgdoc.getElementById("bullet");
    this.motion = motionType.NONE;
}

function MonsterBullet() {
    this.node = svgdoc.getElementById("monsterBullet");
    this.motion = motionType.NONE;
}

function Monster() {
    this.node = svgdoc.getElementById("monster");
    this.motion = motionType.NONE;
    this.special = false;
}

Player.prototype.isOnPlatform = function() {
    var platforms = svgdoc.getElementById("platforms");
    for (var i = 0; i < platforms.childNodes.length; i++) {
        var node = platforms.childNodes.item(i);
        if (node.nodeName != "rect") continue;

        var x = parseFloat(node.getAttribute("x"));
        var y = parseFloat(node.getAttribute("y"));
        var w = parseFloat(node.getAttribute("width"));
        var h = parseFloat(node.getAttribute("height"));

        if (((this.position.x + PLAYER_SIZE.w > x && this.position.x < x + w) ||
             ((this.position.x + PLAYER_SIZE.w) == x && this.motion == motionType.RIGHT) ||
             (this.position.x == (x + w) && this.motion == motionType.LEFT)) &&
            this.position.y + PLAYER_SIZE.h == y) return true;
    }
    if (this.position.y + PLAYER_SIZE.h == SCREEN_SIZE.h) return true;

    return false;
}

Player.prototype.collidePlatform = function(position) {
    var platforms = svgdoc.getElementById("platforms");
    for (var i = 0; i < platforms.childNodes.length; i++) {
        var node = platforms.childNodes.item(i);
        if (node.nodeName != "rect") continue;

        var x = parseFloat(node.getAttribute("x"));
        var y = parseFloat(node.getAttribute("y"));
        var w = parseFloat(node.getAttribute("width"));
        var h = parseFloat(node.getAttribute("height"));
        var pos = new Point(x, y);
        var size = new Size(w, h);

        if (intersect(position, PLAYER_SIZE, pos, size)) {
            position.x = this.position.x;
            if (intersect(position, PLAYER_SIZE, pos, size)) {
                if (this.position.y >= y + h)
                    position.y = y + h;
                else
                    position.y = y - PLAYER_SIZE.h;
                this.verticalSpeed = 0;
            }
        }
    }
}

Player.prototype.collideScreen = function(position) {
    if (position.x < 0) position.x = 0;
    if (position.x + PLAYER_SIZE.w > SCREEN_SIZE.w) position.x = SCREEN_SIZE.w - PLAYER_SIZE.w;
    if (position.y < 0) {
        position.y = 0;
        this.verticalSpeed = 0;
    }
    if (position.y + PLAYER_SIZE.h > SCREEN_SIZE.h) {
        position.y = SCREEN_SIZE.h - PLAYER_SIZE.h;
        this.verticalSpeed = 0;
    }
}


//
// Below are constants used in the game
//
var PLAYER_SIZE = new Size(40, 40);         // The size of the player
var SCREEN_SIZE = new Size(600, 560);       // The size of the game screen
var PLAYER_INIT_POS  = new Point(0, 440);   // The initial position of the player

var MOVE_DISPLACEMENT = 5;                  // The speed of the player in motion
var MONSTER_MOVE_DISPLACEMENT = 2;                  // The speed of the player in motion
var JUMP_SPEED = 15;                        // The speed of the player jumping
var VERTICAL_DISPLACEMENT = 1;              // The displacement of vertical speed

var GAME_INTERVAL = 25;                     // The time interval of running the game
var TIME_INTERVAL = 1000;

var BULLET_SIZE = new Size(90, 40);         // The speed of a bullet
var MONSTER_BULLET_SIZE = new Size(10, 10); // The size of a bullet
var BULLET_SPEED = 10.0;                    // The speed of a bullet
                                            //  = pixels it moves each game loop
var SHOOT_INTERVAL = 1000.0;                // The period when shooting is disabled
var canShoot = true;                        // A flag indicating whether the player can shoot a bullet
var monsterCanShoot = true;                 // A flag indicating whether the special monster can shoot a bullet

var MONSTER_SIZE = new Size(40, 40);        // The speed of a bullet

var GOODTHING_SIZE = new Size(20, 20);      // The speed of a bullet

var TRANSMISSION_INTERVAL = 1000;

var EXIT_SIZE = new Size(60, 75);
//
// Variables in the game
//
var motionType = {NONE:0, LEFT:1, RIGHT:2}; // Motion enum

var svgdoc = null;                          // SVG root document node
var player = null;                          // The player object
var gameInterval = null;                    // The interval
var timeInterval = null;
var zoom = 1.0;                             // The zoom level of the screen
var playerScore = 0;                              // The score of the game

var mPlatformUp = true;
var mPlatformLeft = true;
var flipValue = 1;

var playerName = "";
var time = 60;
var level = 1;
var monsterCount = 6;
var specialMonster = 1;
var monsterMaxStep = 50;
var remainSlash = 8;
var remainGoodThing = 8;
var cheatMode = false;
var vPlatform1 =  vPlatform2 =  vPlatform3 = true;
var transmiss = true;

var currentMotion = motionType.NONE;

var bgSound = new Audio("./sound/background.mp3");
var attackSound = new Audio("./sound/attack.mp3");
var monsterSound = new Audio("./sound/monsters.wav");
var levelUpSound = new Audio("./sound/levelup.wav");
var loseSound = new Audio("./sound/lose.wav");

//
// The load function for the SVG document
//
function load(evt) {
    // Set the root node to the global variable
    svgdoc = evt.target.ownerDocument;

}

function startGame(){
  var startPage = svgdoc.getElementById("startPage");
  startPage.style.setProperty("visibility", "hidden", null);
  
  if(level==1){
    playerName = prompt("What is your name?", playerName);
    
    if(playerName!=null){
      playerName = playerName.trim();
    }
    
    if(playerName==null || playerName == ""){
	    playerName = "Anonymous";
    }
  }
  
  // Attach keyboard events
  svgdoc.documentElement.addEventListener("keydown", keydown, false);
  svgdoc.documentElement.addEventListener("keyup", keyup, false);

  // Remove text nodes in the 'platforms' group
  cleanUpGroup("platforms", true);

  // Create the player
  player = new Player();
  if(level==1){
    setPlayerName();
  }
    
 
    // Create the monsters
  for(var m = 0; m < monsterCount+(level-1)*4; m++){
	  var monsterX = Math.random() * (SCREEN_SIZE.w - MONSTER_SIZE.w);
	  var monsterY = Math.random() * (SCREEN_SIZE.h - MONSTER_SIZE.h);
	  
	  if(monsterX <= SCREEN_SIZE.w/3 && monsterY >= SCREEN_SIZE.h/4){
	    m--;
	  }else{
	    var monsters = svgdoc.getElementById("monsters");
	    var overlap = false;
	    
  	  for (var i = 0; i < monsters.childNodes.length; i++) {
    		var monster = monsters.childNodes.item(i);
    		var x = parseInt(monster.getAttribute("x"));
    		var y = parseInt(monster.getAttribute("y"));
    		if(Math.abs(monsterX - x) < MONSTER_SIZE.w  && Math.abs(monsterY - y) < MONSTER_SIZE.h){
    		    m--;
    		    overlap = true;
    		    break;
    		}
      }
      
	    if(!overlap){
	        createMonster(monsterX, monsterY);   
	    }
	  }
  }

  //Create the good things
  for(var g = 0; g < 8; g++){
	  var goodThingX = Math.random() * (SCREEN_SIZE.w - GOODTHING_SIZE.w);
	  var goodThingY = Math.random() * (SCREEN_SIZE.h - GOODTHING_SIZE.h);
	  
	  if(goodThingX <= SCREEN_SIZE.w/3 && goodThingY >= SCREEN_SIZE.h/4){
	      g--;
	  }else{
	    var goodThings = svgdoc.getElementById("goodThings");
	    var create = true;
    	for (var i = 0; i < goodThings.childNodes.length; i++) {
  		  var goodThing = goodThings.childNodes.item(i);
  		  var x = parseInt(goodThing.getAttribute("x"));
  		  var y = parseInt(goodThing.getAttribute("y"));
  		  
  		  if(Math.abs(goodThingX - x) < GOODTHING_SIZE.w  && Math.abs(goodThingY - y) < GOODTHING_SIZE.h){
  		    g--;
  		    create = false;
  		    break;
  		  }
		  }
		  
	    var platforms = svgdoc.getElementById("platforms");
 	    for (var i = 0; i < platforms.childNodes.length; i++) {
      	var node = platforms.childNodes.item(i);
   	    if (node.nodeName != "rect"){
   	      continue;
   	    }
        var x = parseFloat(node.getAttribute("x"));
        var y = parseFloat(node.getAttribute("y"));
        var w = parseFloat(node.getAttribute("width"));
        var h = parseFloat(node.getAttribute("height"));
        var pos = new Point(x, y);
        var size = new Size(w, h);
        
        if (intersect(new Point(goodThingX, goodThingY), GOODTHING_SIZE, pos, size)) {
          g--;
          create = false;
          break;
		    }
	    }
	    
	    if(create){
	        createGoodThing(goodThingX, goodThingY);  
	    }
	  }
  }
  
    // Start the game interval
  svgdoc.getElementById("level").firstChild.data = level;
  bgSound.loop = true;
  bgSound.play();
  gameInterval = setInterval("gamePlay()", GAME_INTERVAL);
  timeInterval = setInterval("svgdoc.getElementById('time').firstChild.data = --time;", TIME_INTERVAL);
  
}


//
// This function removes all/certain nodes under a group
//
function cleanUpGroup(id, textOnly) {
    var node, next;
    var group = svgdoc.getElementById(id);
    node = group.firstChild;
    while (node != null) {
        next = node.nextSibling;
        if (!textOnly || node.nodeType == 3) // A text node
            group.removeChild(node);
        node = next;
    }
}

//
// This function creates the monsters in the game
//
function createMonster(x, y) {
    var monster = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
    monster.setAttribute("x", x);
    monster.setAttribute("y", y);
    monster.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#monster");
    if(x > SCREEN_SIZE.w/2){
	    monster.motion = motionType.LEFT;
    }else{
       monster.motion = motionType.RIGHT;
    }
    
    if(specialMonster>0 && ((y + MONSTER_SIZE.h/2 + MONSTER_BULLET_SIZE.h/2) < PLAYER_INIT_POS.y || ( (y + MONSTER_SIZE.h/2 - MONSTER_BULLET_SIZE.h/2) > (PLAYER_INIT_POS.y + PLAYER_SIZE.h)))){
	    monster.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#specialMonster");
	    monster.special = true;
	    specialMonster--;
    }
    
    svgdoc.getElementById("monsters").appendChild(monster);
}

//create treasure
function createGoodThing(x, y) {
    var goodThing = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
    goodThing.setAttribute("x", x);
    goodThing.setAttribute("y", y);
    goodThing.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#goodThing");
    svgdoc.getElementById("goodThings").appendChild(goodThing);
}


//
// This function shoot a bullet from the player
//
function shootBullet() {
    attackSound.play();
    // Disable shooting for a short period of time
    canShoot = false;
    setTimeout("canShoot = true", SHOOT_INTERVAL);

    // Create the bullet using the use node
    var bullet = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
    bullet.setAttribute("y", player.position.y);
    
    if(currentMotion == motionType.LEFT){
        bullet.setAttribute("x", player.position.x + PLAYER_SIZE.w/2 - BULLET_SIZE.w);
        bullet.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#bulletLeft");
        bullet.motion = motionType.LEFT;
    }else{
      bullet.setAttribute("x", player.position.x + PLAYER_SIZE.w/2);
      bullet.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#bulletRight");
      bullet.motion = motionType.RIGHT;
    }
    svgdoc.getElementById("bullets").appendChild(bullet);
    
    if(!cheatMode) {
    	remainSlash--;
      svgdoc.getElementById("remainSlash").firstChild.data = remainSlash;
    }
    
}

//
// This function shoots a bullet from the special monster
//
function shootMonsterBullet() {
    // Disable shooting for a short period of time
    monsterCanShoot = false;

    var monsters = svgdoc.getElementById("monsters");
    for (var i = 0; i < monsters.childNodes.length; i++) {
      var monster = monsters.childNodes.item(i);
      if(monster.special){
	      var x = parseInt(monster.getAttribute("x"));
	      var y = parseInt(monster.getAttribute("y"));
	      
  	    var monsterBullet = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
  	    monsterBullet.setAttribute("x", x + MONSTER_SIZE.w / 2 - MONSTER_BULLET_SIZE.w / 2);
  	    monsterBullet.setAttribute("y", y + MONSTER_SIZE.h / 2 - MONSTER_BULLET_SIZE.h / 2);
  	    monsterBullet.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#monsterBullet");
  	    if(monster.motion == motionType.LEFT){
      	  monsterBullet.motion = motionType.LEFT;
  	    }else{
  	      monsterBullet.motion = motionType.RIGHT; 
  	    }
  	    
  	    svgdoc.getElementById("monsterBullets").appendChild(monsterBullet);
        break;
    	}
    }
}


//
// This is the keydown handling function for the SVG document
//
function keydown(evt) {
    var keyCode = (evt.keyCode)? evt.keyCode : evt.getKeyCode();

    switch (keyCode) {
        case "A".charCodeAt(0):
            if(player.motion!=motionType.LEFT){
              flipValue = -1;
            }
            player.motion = motionType.LEFT;
            currentMotion = motionType.LEFT;
            break;

        case "D".charCodeAt(0):
            if(player.motion!=motionType.RIGHT){
              flipValue = 1;
            }
            player.motion = motionType.RIGHT;
            currentMotion = motionType.RIGHT;
            break;
			
        case "W".charCodeAt(0):
            if (player.isOnPlatform()) {
                player.verticalSpeed = JUMP_SPEED;
            }
            break;
            
        case "C".charCodeAt(0):
            cheatModeOn();
            break;
        
        case "V".charCodeAt(0):
            cheatModeOff();
            break;

        case 32:
            if(remainSlash >0 || cheatMode){
              if (canShoot){
                shootBullet();
              } 
            }
            break;
    }
}


//
// This is the keyup handling function for the SVG document
//
function keyup(evt) {
    // Get the key code
    var keyCode = (evt.keyCode)? evt.keyCode : evt.getKeyCode();

    switch (keyCode) {
        case "A".charCodeAt(0):
            if (player.motion == motionType.LEFT) player.motion = motionType.NONE;
            break;

        case "D".charCodeAt(0):
            if (player.motion == motionType.RIGHT) player.motion = motionType.NONE;
            break;
    }
}


//
// This function checks collision
//
function collisionDetection() {
    // Check whether the player collides with a monster
    var monsters = svgdoc.getElementById("monsters");
    
    if(!cheatMode){
      for (var i = 0; i < monsters.childNodes.length; i++) {
        var monster = monsters.childNodes.item(i);
        var x = parseInt(monster.getAttribute("x"));
        var y = parseInt(monster.getAttribute("y"));

        if (intersect(new Point(x, y), MONSTER_SIZE, player.position, PLAYER_SIZE)) {
            gameover();
            return;
        }
      }
      
    	// Check whether a bullet from monster hits the player
    	var monsterBullets = svgdoc.getElementById("monsterBullets");
    	for (var j = 0; j < monsterBullets.childNodes.length; j++) {
        var monsterBullet = monsterBullets.childNodes.item(j);
        var x = parseInt(monsterBullet.getAttribute("x"));
        var y = parseInt(monsterBullet.getAttribute("y"));

        if (intersect(new Point(x, y), MONSTER_BULLET_SIZE, player.position, PLAYER_SIZE)) {
          gameover();;
          return;
        }
    	 }
    }
    // Check whether a bullet hits a monster
    var bullets = svgdoc.getElementById("bullets");
    for (var i = 0; i < bullets.childNodes.length; i++) {
        var bullet = bullets.childNodes.item(i);
        var x = parseInt(bullet.getAttribute("x"));
        var y = parseInt(bullet.getAttribute("y"));

        for (var j = 0; j < monsters.childNodes.length; j++) {
            var monster = monsters.childNodes.item(j);
            var mx = parseInt(monster.getAttribute("x"));
            var my = parseInt(monster.getAttribute("y"));

            if (intersect(new Point(x, y), BULLET_SIZE, new Point(mx, my), MONSTER_SIZE)) {
                monsterSound.play();
                monsters.removeChild(monster);
                j--;
                bullets.removeChild(bullet);
                i--;
                //write some code to update the score
                
                playerScore += 5;
                svgdoc.getElementById("score").firstChild.data = playerScore;
                
                //one slash only can kill one pirate
                break;
            }
        }
    }
    
    // Check whether player touch the good things
    var goodThings = svgdoc.getElementById("goodThings");
    for (var i = goodThings.childNodes.length -1 ; i >= 0 ; i--) {
      var goodThing = goodThings.childNodes.item(i);
      var x = parseInt(goodThing.getAttribute("x"));
      var y = parseInt(goodThing.getAttribute("y"));

      if (intersect(player.position, PLAYER_SIZE, new Point(x, y), GOODTHING_SIZE)) {
        goodThings.removeChild(goodThing);
        remainGoodThing--;
	      playerScore += 5;
        svgdoc.getElementById("score").firstChild.data = playerScore;
      }
    }
}


//
// This function updates the position of the bullets
//
function moveBullets() {
    // Go through all bullets
    var bullets = svgdoc.getElementById("bullets");
    for (var i = 0; i < bullets.childNodes.length; i++) {
        var node = bullets.childNodes.item(i);
        
        // Update the position of the bullet
        var x = parseInt(node.getAttribute("x"));
        
        if(node.motion == motionType.LEFT){
          x = parseInt(node.getAttribute("x"));
          node.setAttribute("x", x - BULLET_SPEED);
        }else{
          node.setAttribute("x", x + BULLET_SPEED);
        }

        // If the bullet is not inside the screen delete it from the group
        if (x > SCREEN_SIZE.w || x < 0) {
            bullets.removeChild(node);
            i--;
        }
    }
}

function moveMonsterBullets() {
    // Go through all bullets
    var monsterBullets = svgdoc.getElementById("monsterBullets");
    for (var i = 0; i < monsterBullets.childNodes.length; i++) {
      var bullet = monsterBullets.childNodes.item(i);
      
      // Update the position of the bullet
      var x = parseInt(bullet.getAttribute("x"));
      if(bullet.motion == motionType.LEFT){
        bullet.setAttribute("x", x - BULLET_SPEED);
      }else{
        bullet.setAttribute("x", x + BULLET_SPEED);
      } 
      
      // If the bullet is not inside the screen delete it from the group
      if (x > SCREEN_SIZE.w || x < 0) {
        monsterBullets.removeChild(bullet);
        i--;
        monsterCanShoot = true;
      }
    }
}


//
// This function updates the position and motion of the player in the system
//
function gamePlay() {
  
    if(time==0){
      
      gameover();
      return;
      
    }
  
    // Check collisions
    collisionDetection();

    // Check whether the player is on a platform
    var isOnPlatform = player.isOnPlatform();
    
    mPlatformVert();
    mPlatformHori();
    
    // Update player position
    var displacement = new Point();

    // Move left or right
    if (player.motion == motionType.LEFT)
        displacement.x = -MOVE_DISPLACEMENT;
    if (player.motion == motionType.RIGHT)
        displacement.x = MOVE_DISPLACEMENT;

    // Fall
    if (!isOnPlatform && player.verticalSpeed <= 0) {
        displacement.y = -player.verticalSpeed;
        player.verticalSpeed -= VERTICAL_DISPLACEMENT;
    }

    // Jump
    if (player.verticalSpeed > 0) {
        displacement.y = -player.verticalSpeed;
        player.verticalSpeed -= VERTICAL_DISPLACEMENT;
        if (player.verticalSpeed <= 0)
            player.verticalSpeed = 0;
    }

    // Get the new position of the player
    var position = new Point();
    position.x = player.position.x + displacement.x;
    position.y = player.position.y + displacement.y;

    // Check collision with platforms and screen
    player.collidePlatform(position);
    player.collideScreen(position);

    // Set the location back to the player object (before update the screen)
    player.position = position;

    //Move the monster position        
    moveMonsters(); 
    
    if(monsterCanShoot){
	    shootMonsterBullet();
    }
    
    // Move the bullets
    moveBullets();
    moveMonsterBullets();
    
    disappear();

    transmission();

    levelUp();

    updateScreen();
    
}


//
// This function updates the position of the player's SVG object and
// set the appropriate translation of the game screen relative to the
// the position of the player
//
function updateScreen() {
    // Transform the player
    var flipXPosition = (flipValue==-1)?player.position.x + PLAYER_SIZE.w : player.position.x;
    player.node.setAttribute("transform", "translate(" + flipXPosition + "," + player.position.y + ") scale(" + flipValue + ", 1)" );
    
    var playerName = svgdoc.getElementById("playerName").childNodes.item(0);
    playerName.setAttribute("x", player.position.x + PLAYER_SIZE.w / 2);
    playerName.setAttribute("y", player.position.y);
            
    // Calculate the scaling and translation factors	
    var scale = new Point(zoom, zoom);
    var translate = new Point();
    
    translate.x = SCREEN_SIZE.w / 2.0 - (player.position.x + PLAYER_SIZE.w / 2) * scale.x;
    if (translate.x > 0) 
        translate.x = 0;
    else if (translate.x < SCREEN_SIZE.w - SCREEN_SIZE.w * scale.x)
        translate.x = SCREEN_SIZE.w - SCREEN_SIZE.w * scale.x;

    translate.y = SCREEN_SIZE.h / 2.0 - (player.position.y + PLAYER_SIZE.h / 2) * scale.y;
    if (translate.y > 0) 
        translate.y = 0;
    else if (translate.y < SCREEN_SIZE.h - SCREEN_SIZE.h * scale.y)
        translate.y = SCREEN_SIZE.h - SCREEN_SIZE.h * scale.y;
            
    // Transform the game area
    svgdoc.getElementById("gamearea").setAttribute("transform", "translate(" + translate.x + "," + translate.y + ") scale(" + scale.x + "," + scale.y + ")");	
}

function moveMonsters() {
  monsterMaxStep--;
  var monsters = svgdoc.getElementById("monsters");
  for (var i = 0; i < monsters.childNodes.length; i++){
    var node = monsters.childNodes.item(i);
    var x = parseInt(node.getAttribute("x"));
    
    if(node.motion == motionType.LEFT){
      node.setAttribute("x", x - MONSTER_MOVE_DISPLACEMENT);
      node.setAttribute("transform", "translate(" + (2*(x - MONSTER_MOVE_DISPLACEMENT) + MONSTER_SIZE.w) + ") scale(-1,1)" );
    }else{
      node.setAttribute("x", x + MONSTER_MOVE_DISPLACEMENT);
      node.setAttribute("transform", "scale(1,1)" );
    }
  
    if (monsterMaxStep == 0){
      if(node.motion == motionType.LEFT){
        node.motion = motionType.RIGHT;
      }else{
        node.motion = motionType.LEFT;
      }
    }
  }
  
  if (monsterMaxStep == 0){monsterMaxStep = 50;}
    
}

function mPlatformVert() {
    var mPlatform = svgdoc.getElementById("mPlatform1");
    var y = parseInt(mPlatform.getAttribute("y"));

    if( y <= 180){
        mPlatformUp = false;
    }else if( y >= 360){
        mPlatformUp = true;
    }

    if (mPlatformUp){
        mPlatform.setAttribute("y", y-1);
    }else{
        mPlatform.setAttribute("y", y+1);
    }
}

function mPlatformHori() {
    var mPlatform = svgdoc.getElementById("mPlatform2");
    var x = parseInt(mPlatform.getAttribute("x"));

    if( x <= 160){
        mPlatformLeft = false;
    }else if( x >= 280){
        mPlatformLeft = true;
    }

    if (mPlatformLeft){
        mPlatform.setAttribute("x", x-1);
    }else{
        mPlatform.setAttribute("x", x+1);
    }
}

function setPlayerName() {
    var temp = svgdoc.getElementById("playerNameText");
    if(temp!=null){
      svgdoc.getElementById("playerName").removeChild(temp);
    }
    
    var name = svgdoc.createElementNS("http://www.w3.org/2000/svg", "text");
    name.setAttribute("x", player.position.x + PLAYER_SIZE.w / 2);
    name.setAttribute("y", player.position.y);
    name.setAttribute("text-anchor", "middle");
    name.setAttribute("id", "playerNameText");
    name.textContent = playerName;
    svgdoc.getElementById("playerName").appendChild(name);
}

function disappear() {
    var platforms = svgdoc.getElementById("platforms");
    
    if(vPlatform1){
    	var vPlatform = svgdoc.getElementById("vPlatform1");
    	var px1 = parseFloat(vPlatform.getAttribute("x"));
    	var py1 = parseFloat(vPlatform.getAttribute("y"));
    	var pw1 = parseFloat(vPlatform.getAttribute("width"));
    	var ph1 = parseFloat(vPlatform.getAttribute("height"));
    	
    	var platformOpacity;
    	if((player.position.x + PLAYER_SIZE.w >= px1) && (player.position.x < px1 + pw1) && (player.position.y + PLAYER_SIZE.h == py1)){
  	    platformOpacity = parseFloat(vPlatform.style.getPropertyValue("opacity"));
  	    platformOpacity -= 0.05;
  	    vPlatform.style.setProperty("opacity", platformOpacity, null);
    	}
    	
    	if(platformOpacity <= 0) {
  	    vPlatform1 = false;
  	    platforms.removeChild(vPlatform);
      }
    }
    
    if(vPlatform2){
    	var vPlatform = svgdoc.getElementById("vPlatform2");
    	var px2 = parseFloat(vPlatform.getAttribute("x"));
    	var py2 = parseFloat(vPlatform.getAttribute("y"));
    	var pw2 = parseFloat(vPlatform.getAttribute("width"));
    	var ph2 = parseFloat(vPlatform.getAttribute("height"));
    	
    	var platformOpacity2;
    	if((player.position.x + PLAYER_SIZE.w >= px2) && (player.position.x < px2 + pw2) && (player.position.y + PLAYER_SIZE.h == py2)){
  	    platformOpacity2 = parseFloat(vPlatform.style.getPropertyValue("opacity"));
  	    platformOpacity2 -= 0.05;
  	    vPlatform.style.setProperty("opacity", platformOpacity2, null);
    	}
    	if(platformOpacity2 <= 0) {
  	    vPlatform2 = false;
  	    platforms.removeChild(vPlatform);
      }
      
    }
    if(vPlatform3){
    	var vPlatform = svgdoc.getElementById("vPlatform3");
    	var px3 = parseFloat(vPlatform.getAttribute("x"));
    	var py3 = parseFloat(vPlatform.getAttribute("y"));
    	var pw3 = parseFloat(vPlatform.getAttribute("width"));
    	var ph3 = parseFloat(vPlatform.getAttribute("height"));
    	
    	var platformOpacity3;
    	if((player.position.x + PLAYER_SIZE.w >= px3) && (player.position.x < px3 + pw3) && (player.position.y + PLAYER_SIZE.h == py3)){
  	    platformOpacity3 = parseFloat(vPlatform.style.getPropertyValue("opacity"));
  	    platformOpacity3 -= 0.05;
  	    vPlatform.style.setProperty("opacity", platformOpacity3, null);
    	}
    	if(platformOpacity3 <= 0) {
  	    vPlatform3 = false;
  	    platforms.removeChild(vPlatform);
      }
    }
}

function transmission(){
    if((player.position.x == 560) && (player.position.y == 500) && (transmiss== true)){
    	player.position.x = 560;
    	player.position.y = 0;
    	transmiss = false;
    	setTimeout("transmiss = true", TRANSMISSION_INTERVAL);
    }
    
    if((player.position.x == 560) && (player.position.y == 0) && (transmiss == true)){
    	player.position.x = 560;
    	player.position.y = 500;
    	transmiss = false;
    	setTimeout("transmiss = true", TRANSMISSION_INTERVAL);
    }
}

function levelUp(){
  
  if((remainGoodThing <= 0) && intersect(player.position, PLAYER_SIZE, new Point(20, 145), EXIT_SIZE)){
    levelUpSound.play();
    level++;
    
    clearInterval(gameInterval);
    clearInterval(timeInterval);
    
    var timescore = time * 2;
    var levelscore = level *100;
    playerScore = playerScore + levelscore + timescore;
    svgdoc.getElementById("score").firstChild.data = playerScore;
    
    resetGame();
    startGame();
  }
}

function resetGame(){
  time = 60;
  svgdoc.getElementById('time').firstChild.data = time;
  remainSlash = 8;
  svgdoc.getElementById('remainSlash').firstChild.data = remainSlash;
  remainGoodThing = 8;
  specialMonster = 1;
  monsterMaxStep = 50;
  canShoot = monsterCanShoot = true;
  
  var monsters = svgdoc.getElementById("monsters");
  for(var i = monsters.childNodes.length -1 ; i >= 0; i--){
    monsters.removeChild(monsters.childNodes.item(i));
  }
  
  var goodThings = svgdoc.getElementById("goodThings");
  for(var j = goodThings.childNodes.length -1 ; j >=0 ; j--){
	  goodThings.removeChild(goodThings.childNodes.item(j));
  }
  
  var bullets = svgdoc.getElementById("bullets");
  for(var k = bullets.childNodes.length -1 ; k >=0 ; k--){
	  bullets.removeChild(bullets.childNodes.item(k));
  }
  
  var monsterBullets = svgdoc.getElementById("monsterBullets");
  for(var s = monsterBullets.childNodes.length -1 ; s >=0 ; s--){
	  monsterBullets.removeChild(monsterBullets.childNodes.item(s));
  }
  
  if(!vPlatform1){
    createVPlatform("vPlatform1");
    vPlatform1 = true;
  }else{
    var vPlatform = svgdoc.getElementById("vPlatform1");
    vPlatform.style.setProperty("opacity", 1, null);
  }
  
  if(!vPlatform2){
    createVPlatform("vPlatform2");
    vPlatform2 = true;
  }else{
    var vPlatform = svgdoc.getElementById("vPlatform2");
    vPlatform.style.setProperty("opacity", 1, null);
  }
  
  if(!vPlatform3){
    createVPlatform("vPlatform3");
    vPlatform3 = true;
  }else{
    var vPlatform = svgdoc.getElementById("vPlatform3");
    vPlatform.style.setProperty("opacity", 1, null);
  }
}

function createVPlatform(id){
    var platforms = svgdoc.getElementById("platforms");

    var newPlatform = svgdoc.createElementNS("http://www.w3.org/2000/svg", "rect");
    
    if(id == "vPlatform1"){
    	newPlatform.setAttribute("x", 160);
    	newPlatform.setAttribute("y", 100);
    	newPlatform.setAttribute("width", 340);
      newPlatform.setAttribute("height", 20);
      newPlatform.setAttribute("id", id);
    }
    
    if(id == "vPlatform2"){
    	newPlatform.setAttribute("x", 120);
    	newPlatform.setAttribute("y", 300);
    	newPlatform.setAttribute("width", 100);
      newPlatform.setAttribute("height", 20);
      newPlatform.setAttribute("id", id);
    }
    
    if(id == "vPlatform3"){
    	newPlatform.setAttribute("x", 460);
    	newPlatform.setAttribute("y", 440);
    	newPlatform.setAttribute("width", 60);
      newPlatform.setAttribute("height", 20);
      newPlatform.setAttribute("id", id);
    }
    
    newPlatform.style.setProperty("opacity", 1, null);
    newPlatform.style.setProperty("fill", "rgb(150,22,11)", null);

    platforms.appendChild(newPlatform);
}

function cheatModeOn(){
  cheatMode = true;
  var cheat = svgdoc.getElementById("cheatMode");
  cheat.setAttribute("fill", "green");
}

function cheatModeOff(){
  cheatMode = false;
  var cheat = svgdoc.getElementById("cheatMode");
  cheat.setAttribute("fill", "red");
}

function startAgain(){
  playerScore = 0;
  svgdoc.getElementById("highscoretable").style.setProperty("visibility", "hidden", null);
  svgdoc.getElementById("highscoretext").textContent = "";
  svgdoc.getElementById("score").firstChild.data = playerScore;
  resetGame();
  startGame();
  
}

function gameover(){
  
  bgSound.pause();
  loseSound.play();
  
  // Clear the game interval
  clearInterval(gameInterval);
  clearInterval(timeInterval);

  // Get the high score table from cookies
  table = getHighScoreTable();

  // Create the new score record
  var record = new ScoreRecord(playerName, playerScore);

  // Insert the new score record
  var pos = table.length;
  for (var i = 0; i < table.length; i++) {
      if (record.score > table[i].score) {
          pos = i;
          break;
      }
  }
  
  table.splice(pos, 0, record);

  // Store the new high score table
  setHighScoreTable(table);

  // Show the high score table
  showHighScoreTable(table);
  
  //disable the canShoot flag
  canShoot = false;
}