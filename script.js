const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');


const gridSize = 20;
const widthTileCount = canvas.width / gridSize; // 20
const heightTileCount = canvas.height / gridSize; // 30
const offsetX = (widthTileCount * gridSize / 2) - 20;
const offsetY = 0;
let currentShape;
let landedBlocks = []
let score = 0;
let highscore = 0;
let timeout = 400;
let isGameOver = false;


const startBtn = document.querySelector('#start-btn');
const scoreSpan = document.querySelector('#score');
const highscoreSpan = document.querySelector('#highscore');
const notif = document.querySelector('.notification');



scoreSpan.innerText = `${score}`;

scoreSpan.addEventListener('change', () => {
    scoreSpan.innerText = score;
    if (score > highscore){
        highscore = score;
        highscoreSpan.innerText = `${highscore}`;
    }
})



const tetrisShapes = {
    I: { color: 'cyan',
        blocks: [[1,0],[1,1],[1,2],[1,3]]
    },
    O: { color: 'yellow',
        blocks: [[0,0], [0,1],[1,0],[1,1]]
    },
    T: { color: 'purple',
        blocks: [[1,0],[0,1],[1,1],[2,1]]
    },
    S: { color: 'green',
        blocks: [[1,0],[2,0],[0,1],[1,1]]
    },
    Z: { color: 'red',
        blocks: [[0,0],[1,0],[1,1],[2,1]]
    },
    J: { color: 'blue',
        blocks: [[0,0],[0,1],[1,1],[2,1]]
    },
    L: { color: 'orange',
        blocks: [[2,0],[0,1],[1,1],[2,1]]
    }
}


//init


function speeding(){
    if (score >= 100)
        timeout = 350;
    if (score > 200)
        timeout = 300;
    if (score > 300)
        timeout = 200;
    if (score > 400)
        timeout = 150;
    if (score > 500)
        timeout = 100;
    if (score > 1000)
        timeout = 50;
}

function drawBlock(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect((x * gridSize) + offsetX, (y * gridSize) + offsetY, gridSize, gridSize);
  ctx.strokeStyle = 'black';
  ctx.strokeRect((x * gridSize) + offsetX, (y * gridSize) + offsetY, gridSize, gridSize);
}

function drawRdmBlock(){
    const keysArray = Object.keys(tetrisShapes)
    const rdmNb = Math.floor(Math.random() * keysArray.length);
    const rdmKey = keysArray[rdmNb];
    tetrisShapes[rdmKey];
    const shape = tetrisShapes[rdmKey];

    for (const [x, y] of shape.blocks){
        drawBlock(x,y, shape.color);
    }

    currentShape = structuredClone(shape);
}


startBtn.addEventListener('click', () => {
    startGame();
});


// //Keypress events
document.addEventListener('keydown', (e) => {
    if (!isGameOver) {
        if (e.key === "ArrowLeft" || e.key === "q"){
            const canMoveLeft = currentShape.blocks.every(block => {
                if (block[0] < -8 )
                    return false;
                return !landedBlocks.find(bloc => bloc[0] === block[0]-1 && bloc[1] === block[1])
            })
            if (canMoveLeft) {
                currentShape.blocks.forEach(block => {
                        block[0]-= 1;
                        draw();
                });
            }
        }
        if (e.key === "ArrowRight" || e.key === "d"){
            const canMoveRight = currentShape.blocks.every(block => {
                if (block[0] > 9 )
                    return false;
                return !landedBlocks.find(bloc => bloc[0] === block[0]+1 && bloc[1] === block[1])
            })
            if (canMoveRight) {
                currentShape.blocks.forEach(block => {
                        block[0]+= 1;
                        draw();
                });
            }
        }
        if (e.key === "ArrowDown" || e.key === "s"){
            currentShape.blocks.forEach(block => {
                block[1]+= 1;
                checkColision();
                checkIfLanded();
                draw();
            }); 
        }
        if (e.key === "ArrowUp" || e.key === "z")
            rotateShape();
    }
});


function gameLoop(){
    if (isGameOver) return;
    CheckIfGameOver();
    speeding();
    currentShape.blocks.forEach(block => {
        block[1]+= 1;
        draw();
    });
    checkColision();
    checkIfLanded();
    checkAndEraseLine();
    setTimeout(gameLoop, timeout);
    draw();
}

function rotateShape(){
    
    const averageX = currentShape.blocks.reduce((sum, block) => sum + block[0], 0) / currentShape.blocks.length;
    const averageY = currentShape.blocks.reduce((sum, block) => sum + block[1], 0) / currentShape.blocks.length;

    currentShape.blocks = currentShape.blocks.map(([x, y]) => {
    const dx = x - averageX;
    const dy = y - averageY;

    const rotatedX = -dy;
    const rotatedY = dx;

    return [Math.round(rotatedX + averageX), Math.round(rotatedY + averageY)]
    })
}


function checkIfLanded(){
    if (currentShape.blocks.find((block => block[1] === heightTileCount - 1))){
        currentShape.blocks.forEach(block => landedBlocks.push(block));
        drawRdmBlock();
    }
    
}

function checkColision(){
    for (let i =0; i < currentShape.blocks.length; i++){
        if (landedBlocks.find(bloc => (bloc[0] === currentShape.blocks[i][0]) && (bloc[1] === currentShape.blocks[i][1] + 1))){
            currentShape.blocks.forEach(block => landedBlocks.push(block));
            drawRdmBlock();
            break;
        }
    }
}

function checkAndEraseLine() {
    let inARow = 0;
  for (let i = 1; i <= heightTileCount; i++) {
    if (landedBlocks.filter(block => block[1] === i).length >= widthTileCount) {
        score += 20;
        inARow++;
      landedBlocks = landedBlocks.filter(block => block[1] !== i);
      landedBlocks = landedBlocks.map(block => {
        if (block[1] < i) {
          return [block[0], block[1] + 1];
        }   
        return block;
      });
    }
  }
  inARow === 4 ? score += 40 : score += 0;
  inARow === 3 ? score += 20 : score += 0;
  inARow === 2 ? score += 5 : score += 0;
}

function startGame(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    timeout = 400;
    drawRdmBlock()
    landedBlocks = [];
    score = 0;
    gameLoop();
    isGameOver = false;
}

function CheckIfGameOver(){
    if (landedBlocks.find(block => block[1] === 0))
        isGameOver = true;
}

function draw(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    currentShape.blocks.forEach(block => {
        drawBlock(block[0], block[1], currentShape.color)
    })

    landedBlocks.forEach(block => {
        drawBlock(block[0], block[1], "grey")
    })

    scoreSpan.innerText = `${score}`;

    if (score > highscore){
        highscore = score;
        notif.classList.remove('is-hidden');
        highscoreSpan.innerText = `${highscore}`;
    }
}