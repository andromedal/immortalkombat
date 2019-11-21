import Phaser from "phaser";
import marioSprite from './assets/sprites/mario/mario.png';
import luigiSprite from './assets/sprites/luigi/luigi.png';
import marioBackground from './assets/sprites/stages/mario-background.jpg';
import floor from './assets/sprites/stages/floor.png';
import gameOver from './assets/sprites/stages/gameover1.png';
import pipe from './assets/sprites/stages/pipe.png';
import pipeRotated from './assets/sprites/stages/piperotated.png';
import {renderSprites} from './sprite_animation';
import {inputKeyboardHandle, handleMessage} from './inputs';
import {hammerTime, checkHealth} from './attack';
import * as io from 'socket.io-client'

//global variables
let socket;
let debug = true;
let backgroundImage;
let mario;
let luigi;
let platforms;
let width = 900;
let height = 600;
let speed = 100;
let cursors;
let gameState;
let hammers;

const scene = {
  game: {
    width,
    height,
    type: Phaser.AUTO,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 300 },
        debug
      }
    },
    scene: {
      preload: preload,
      init: init,
      create: create,
      update: update
    }
  }
};


//websocket 



function init() {

  socket = io.connect("http://localhost:5000/games");
  gameState = JSON.parse(window.localStorage.getItem('gameRoom'))


  socket.on("welcome", (msg) => console.log("Received: ", msg));
  // connect to the server room
  socket.emit("joinRoom", JSON.stringify({code: gameState.code, username: "game"}));

  socket.on("message", msg => handleMessage.apply(this, [{ mario, luigi, msg }, speed, {swingHammer}]));
  
}

function preload () {
  this.load.image('background', marioBackground);
  this.load.image('pipe', pipe);
  this.load.image('pipeRotated', pipeRotated);
  this.load.image('floor', floor);
  this.load.image('gameover', gameOver);

  this.load.spritesheet('mario', marioSprite, {
     frameWidth: 46,
     frameHeight: 42,
    })

  this.load.spritesheet('luigi', luigiSprite, {
     frameWidth: 46,
     frameHeight: 42,
    })

}

function create() {
  // load background
  backgroundImage = this.add.image(0, 0, 'background').setOrigin(0, 0).setScale(0.45);
  backgroundImage.smoothed = false;


  platforms = this.physics.add.staticGroup();
  platforms.create(70, 500, 'pipe').setScale(0.4).refreshBody();
  platforms.create(850, 430, 'pipeRotated').setScale(0.4).refreshBody();
  platforms.create(400, 600, 'floor').setScale(1).refreshBody();

  //define players init pos
  luigi = this.physics.add.sprite(300, 410, 'luigi');
  mario = this.physics.add.sprite(600, 410, 'mario');

  //default facing
  luigi.setData('facing','right')
  mario.setData('facing','left')

  //define projectile hammer
  hammers = this.physics.add.group({ immovable: true, allowGravity: false})
  hammers.enableBody = true;

  // assign username to player
  luigi.setName(gameState.players[0])
  mario.setName(gameState.players[1])

  //set default hitbox size
  mario.setSize(14,31)
  mario.setOffset(16,12)

  luigi.setSize(14,31)
  luigi.setOffset(16,12)


  // set colision and global phisycs
  this.physics.add.collider(platforms, mario);
  this.physics.add.collider(platforms, luigi);

  this.physics.add.collider(mario, luigi, hammerTime, null, this);
  // overlap does its own built in bind, so no need to do .apply here. 
  // The scope of 'this' is preserved;
  this.physics.add.overlap(mario, luigi, hammerTime, null, this);

  


  [luigi, mario].forEach( player => {
    player.setGravityY(100);
    player.setScale(2);
    player.body.drag.x = 200;
    player.body.drag.y = 0;
    player.body.friction.x = 200;
    player.body.friction.y = 200;
  })


  renderSprites.apply(this, [luigi, mario]);
  // add a keyboard as cursor
    cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
//  inputKeyboardHandle.apply(this, [{ mario, luigi }, speed, cursors, time, delta, {swingHammer, gameState}]);
  checkHealth();
}


function swingHammer (player) {
    let now = this.time.now
    let hammer;

    // player facing left
    if (player.data.values.facing === 'left'){
      hammer = hammers.create( player.x + 40 , player.y + 25 )
      hammer.setSize(20,20)
      setTimeout(() =>{hammer.x = player.x + 42; hammer.y = player.y + 20}, 100)
      setTimeout(() =>{hammer.x = player.x + 30; hammer.y = player.y + 0}, 200)
      setTimeout(() =>{hammer.x = player.x + 0; hammer.y = player.y - 20}, 300)
      setTimeout(() =>{hammer.x = player.x - 25; hammer.y = player.y - 5}, 400)
      setTimeout(() =>{hammer.x = player.x - 22; hammer.y = player.y + 15}, 500)
      // setTimeout(() =>{hammer.x = player.x - 40; hammer.y = player.y }, 600)
      setTimeout(() =>{hammer.destroy()}, 700)
    }else {
      hammer = hammers.create( player.x - 25 , player.y + 30 )
      hammer.setSize(20,20)
      setTimeout(() =>{hammer.x = player.x - 42; hammer.y = player.y + 20}, 100)
      setTimeout(() =>{hammer.x = player.x - 30; hammer.y = player.y + 0}, 200)
      setTimeout(() =>{hammer.x = player.x + 0; hammer.y = player.y - 20}, 300)
      setTimeout(() =>{hammer.x = player.x + 25; hammer.y = player.y - 5}, 400)
      setTimeout(() =>{hammer.x = player.x + 22; hammer.y = player.y + 15}, 500)
      // setTimeout(() =>{hammer.x = player.x - 40; hammer.y = player.y }, 600)
      setTimeout(() =>{hammer.destroy()}, 700)

    }

   
}

export default scene;


