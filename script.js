const canvas = document.getElementById('game-canvas');
const prevCanvas = document.getElementById('prev-canvas');
const stockCanvas = document.getElementById('stock-canvas');
const ctx = canvas.getContext('2d');
const prevCtx = prevCanvas.getContext('2d');
const stockCtx = stockCanvas.getContext('2d');


const gridSize = 20;
const widthTileCount = canvas.width / gridSize; // 20
const heightTileCount = canvas.height / gridSize; // 30
const widthTileCountPrev = prevCanvas.width / gridSize;
const heightTileCountPrev = prevCanvas.height / gridSize;
const offsetX = (widthTileCount * gridSize / 2) - 20;
const offsetY = 0;
let currentShape;
let previewShape;
let stockedShape;
let landedBlocks = []
let score = 0;
let highscore = 0;
let lines = 0;
let timeout = 400;
let isGameOver = false;
let isGameStarted = false;


const startBtn = document.querySelector('#start-btn');
const scoreSpan = document.querySelector('#score');
const highscoreSpan = document.querySelector('#highscore');
const linesSpan = document.querySelector('.linesSpan');
const notif = document.querySelector('.notification');
const buttons = document.querySelector('.buttons');

const leftBtn = document.querySelector('#leftBtn');
const downBtn = document.querySelector('#downBtn');
const rightBtn = document.querySelector('#rightBtn');
const rotateBtn = document.querySelector('#rotateBtn');
const stockBtn = document.querySelector('#stockBtn');
const myAudio = document.createElement("audio");
myAudio.src = "httpswwwyoutubecomwatchvnmccqxvbfym.mp3";



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

function drawBlock(canvas, x, y, offsetX, offsetY, color) {
  canvas.fillStyle = color;
  canvas.fillRect((x * gridSize) + offsetX, (y * gridSize) + offsetY, gridSize, gridSize);
  canvas.strokeStyle = 'black';
  canvas.strokeRect((x * gridSize) + offsetX, (y * gridSize) + offsetY, gridSize, gridSize);
}

function drawRdmBlock(canvas, offsetX, offsetY){
    const keysArray = Object.keys(tetrisShapes)
    const rdmNb = Math.floor(Math.random() * keysArray.length);
    const rdmKey = keysArray[rdmNb];
    tetrisShapes[rdmKey];
    const shape = tetrisShapes[rdmKey];

    for (const [x, y] of shape.blocks){
        drawBlock(canvas, x,y, offsetX, offsetY, shape.color);
    }

    return structuredClone(shape);
}


startBtn.addEventListener('click', () => {
    startGame();
});


// //Keypress events
function leftEvent(){
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

function rightEvent(){
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

document.addEventListener('keydown', (e) => {
    if (!isGameOver) {
        if (e.key === "ArrowLeft" || e.key === "q"){
            leftEvent();
        }
        if (e.key === "ArrowRight" || e.key === "d"){
            rightEvent();
        }
        if (e.key === "ArrowDown" || e.key === "s"){
            checkColision();
            checkIfLanded();
            currentShape.blocks.forEach(block => {
                block[1]+= 1;
            }); 
            draw();
        }
        if (e.key === "ArrowUp" || e.key === "z")
            rotateShape();
        if (e.key === "e")
            stockingShape();
    }
});


// click mobile events
leftBtn.addEventListener('click', () => !isGameOver ? leftEvent() : console.log("game is over !"));
rightBtn.addEventListener('click', () => !isGameOver ? rightEvent() : console.log("game is over !"));
downBtn.addEventListener('click', () => {
    if (!isGameOver){
            checkColision();
            checkIfLanded();
            currentShape.blocks.forEach(block => {
                block[1]+= 1;
            }); 
            draw();
    }
});
rotateBtn.addEventListener('click', () => !isGameOver ? rotateShape() : console.log("game is over !"));
stockBtn.addEventListener('click', () => !isGameOver ? stockingShape() : console.log("game is over !"));



function gameLoop(){
    if (isGameOver) return;
    CheckIfGameOver();
    speeding();
    checkColision();
    checkIfLanded();
    checkAndEraseLine();
    currentShape.blocks.forEach(block => {
        block[1]+= 1;
        
    });
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
        generateNewPreviewBlockAndCurrent();
    }
    
}

function checkColision(){
    for (let i =0; i < currentShape.blocks.length; i++){
        if (landedBlocks.find(bloc => (bloc[0] === currentShape.blocks[i][0]) && (bloc[1] === currentShape.blocks[i][1] + 1))){
            currentShape.blocks.forEach(block => landedBlocks.push(block));
            generateNewPreviewBlockAndCurrent();
            break;
        }
    }
}

function generateNewPreviewBlockAndCurrent(){
    currentShape = structuredClone(previewShape);
    prevCtx.clearRect(0, 0, prevCanvas.width, prevCanvas.height);
    previewShape = drawRdmBlock(prevCtx, 15, 15);
}

function stockingShape(){
    if (stockedShape){
        let temp = structuredClone(stockedShape);
        stockedShape = structuredClone(currentShape);
        const originalShapeBlocks = (Object.values(tetrisShapes).find(name => name.color === currentShape.color)).blocks
        stockedShape.blocks = [...originalShapeBlocks]
        currentShape = structuredClone(temp);
    } else {
        stockedShape = structuredClone(currentShape);
        const originalShapeBlocks = (Object.values(tetrisShapes).find(name => name.color === currentShape.color)).blocks
        stockedShape.blocks = [...originalShapeBlocks]
        generateNewPreviewBlockAndCurrent();
    }
    stockCtx.clearRect(0, 0, stockCanvas.width, stockCanvas.height);
    stockedShape.blocks.forEach(block => {
        drawBlock(stockCtx, block[0], block[1], 15, 15, stockedShape.color)
    })
}

function EraseLine(i){
    landedBlocks = landedBlocks.filter(block => block[1] !== i);
    landedBlocks = landedBlocks.map(block => {
            if (block[1] < i) {
            return [block[0], block[1] + 1];
            }   
            return block;
        });
}

function checkAndEraseLine() {
    let inARow = 0;
  for (let i = 1; i <= heightTileCount; i++) {
    if (landedBlocks.filter(block => block[1] === i).length >= widthTileCount) {
        const showCompletedLine = setInterval(() => {
            landedBlocks.filter(block => block[1] === i).forEach(block => drawBlock(ctx, block[0], block[1], offsetX, offsetY, "yellow"))
        }, 50)
        setTimeout(() => {
            clearInterval(showCompletedLine)
        }, 200);
        score += 20;
        lines++;
        inARow++;
        setTimeout(() => EraseLine(i), 200 );
    }
  }
  inARow === 4 ? score += 40 : score += 0;
  inARow === 3 ? score += 20 : score += 0;
  inARow === 2 ? score += 5 : score += 0;
}

function startGame(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    timeout = 400;
    currentShape = drawRdmBlock(ctx, offsetX, offsetY);
    prevCtx.clearRect(0, 0, prevCanvas.width, prevCanvas.height);
    previewShape = drawRdmBlock(prevCtx, 15, 15);
    stockCtx.clearRect(0, 0, stockCanvas.width, stockCanvas.height);
    landedBlocks = [];
    score = 0;
    lines = 0;
    isGameOver = false;
    canvas.classList.remove("game-over");
    buttons.classList.remove('buttons-when-game-over');
    myAudio.play();
    if (!isGameStarted){
        gameLoop();
    }
    isGameStarted = true;

}

function CheckIfGameOver(){
    if (landedBlocks.find(block => block[1] === 1)){
        isGameOver = true;
        myAudio.pause();
        myAudio.currentTime = 0;
        isGameStarted = false;
        canvas.classList.add("game-over");
        buttons.classList.add('buttons-when-game-over');
    }
        
    
}

function draw(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    currentShape.blocks.forEach(block => {
        drawBlock(ctx, block[0], block[1], offsetX, offsetY, currentShape.color)
    })

    landedBlocks.forEach(block => {
        drawBlock(ctx, block[0], block[1], offsetX, offsetY, "grey")
    })

    scoreSpan.innerText = `${score}`;

    if (score > highscore){
        highscore = score;
        notif.classList.remove('is-hidden');
        setTimeout(() => {
            notif.classList.add('is-hidden');
        }, 5000);
        highscoreSpan.innerText = `${highscore}`;
    }

    linesSpan.innerText = `${lines}`
}
