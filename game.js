const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const rows=10, cols=10, cellSize=canvas.width/cols;

let maze=[], player={x:0,y:0}, exit={x:cols-1,y:rows-1}, timeLeft=120, level=1;
let animBlocks=[];

const timerDisplay = document.getElementById('timerDisplay');

const bgMusic=new Audio('bgMusic.mp3');
bgMusic.loop=true; bgMusic.volume=0.3;
bgMusic.play().catch(()=>{});

const levelUpSound=new Audio('levelUp.mp3');
const wrongSound=new Audio('wrong.mp3');

function generateMaze(){
maze=Array.from({length:rows},()=>Array.from({length:cols},()=>Math.random()>0.7?1:0));
maze[player.y][player.x]=0; maze[exit.y][exit.x]=0;

animBlocks=[];
for(let i=0;i<10;i++){
let bx=Math.floor(Math.random()*cols);
let by=Math.floor(Math.random()*rows);
if(maze[by][bx]===0 && !(bx===0&&by===0) && !(bx===exit.x&&by===exit.y)){
maze[by][bx]=2;
animBlocks.push({x:bx,y:by,drawX:bx,drawY:by});
}}
player={x:0,y:0}; timeLeft=120;
}

function draw(){
ctx.clearRect(0,0,canvas.width,canvas.height);
for(let y=0;y<rows;y++){
maze[y]=maze[y]||Array(cols).fill(0);
for(let x=0;x<cols;x++){
ctx.fillStyle=(maze[y][x]===1)?'#333':'#eee';
ctx.fillRect(x*cellSize,y*cellSize,cellSize-2,cellSize-2);
}}
ctx.fillStyle='#555';
animBlocks.forEach(b=>{
b.drawX += (b.x - b.drawX)*0.2;
b.drawY += (b.y - b.drawY)*0.2;
ctx.fillRect(b.drawX*cellSize,b.drawY*cellSize,cellSize-2,cellSize-2);
});
ctx.fillStyle='gold';
ctx.beginPath();
ctx.arc(player.x*cellSize+cellSize/2,player.y*cellSize+cellSize/2,cellSize/3,0,Math.PI*2);
ctx.fill();
ctx.fillStyle='lime';
ctx.fillRect(exit.x*cellSize,exit.y*cellSize,cellSize-2,cellSize-2);

timerDisplay.innerText=`Time Left: ${timeLeft}s  |  Level: ${level}`;
}

function tryPushBlock(px,py,dx,dy){
const bx=px+dx,by=py+dy,tx=bx+dx,ty=by+dy;
if(tx<0||tx>=cols||ty<0||ty>=rows) return false;
if(maze[ty][tx]!==0) return false;
maze[ty][tx]=2;
maze[by][bx]=0;
const block=animBlocks.find(b=>b.x===bx&&b.y===by);
if(block){ block.x=tx; block.y=ty; }
return true;
}

function movePlayer(dx,dy){
const nx=player.x+dx, ny=player.y+dy;
if(nx<0||nx>=cols||ny<0||ny>=rows) return;
if(maze[ny][nx]===1) return;
if(maze[ny][nx]===2){
if(tryPushBlock(player.x,player.y,dx,dy)){ player.x=nx; player.y=ny; }
}else player={x:nx,y:ny};
draw(); checkExit();
}

document.addEventListener('keydown',e=>{
if(e.key==='ArrowUp') movePlayer(0,-1);
if(e.key==='ArrowDown') movePlayer(0,1);
if(e.key==='ArrowLeft') movePlayer(-1,0);
if(e.key==='ArrowRight') movePlayer(1,0);
});

document.querySelectorAll('.mobile-controls button').forEach(btn=>{
btn.addEventListener('click',()=>{
const dir=btn.dataset.dir;
if(dir==='up') movePlayer(0,-1);
if(dir==='down') movePlayer(0,1);
if(dir==='left') movePlayer(-1,0);
if(dir==='right') movePlayer(1,0);
});
});

// Auto shift blocks every 5s
setInterval(()=>{
animBlocks.forEach(b=>{
let dir=Math.floor(Math.random()*4);
let dx=0,dy=0;
if(dir===0) dy=-1;
if(dir===1) dy=1;
if(dir===2) dx=-1;
if(dir===3) dx=1;
const nx=b.x+dx, ny=b.y+dy;
if(nx>=0&&nx<cols&&ny>=0&&ny<rows&&maze[ny][nx]===0){ maze[b.y][b.x]=0; b.x=nx; b.y=ny; maze[ny][nx]=2; }
});
},5000);

function checkExit(){
if(player.x===exit.x&&player.y===exit.y){
levelUpSound.play();
alert('Levelled Up');
level++;
// PLACE AD CODE HERE
generateMaze();
}
}

setInterval(()=>{
timeLeft--;
if(timeLeft<=0){ wrongSound.play(); alert('Time Up'); generateMaze(); }
draw();
},1000);

function gameLoop(){ draw(); requestAnimationFrame(gameLoop); }
gameLoop();
generateMaze();
