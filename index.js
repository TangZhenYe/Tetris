var cxt = document.getElementById('canvas').getContext('2d'),
btn = document.getElementById('btn'),
freshScore = document.getElementById('fresh-score'),
i, j, k, m, n, timer, tetris, nextTetris, randomNumber, perScore, areaState = [];

// 初始化状态 areaState
function initAreaState () {
	for (i = 0; i < 15; i++) {
		areaState[i] = [];
		for (j = 0; j < 10; j++) {
			areaState[i][j] = {value: 0, color: 'white'};
		}
	}
}

//画地图
function drawMap () {
	cxt.beginPath();
	for (i = 0; i <= 10; i++) {
		cxt.moveTo(10 + i * 20, 10);
		cxt.lineTo(10 + i * 20, 310);
	}
	for (i = 0; i <= 15; i++) {
		cxt.moveTo(10, 10 + i * 20);
		cxt.lineTo(210, 10 + i * 20);
	}
	for (i = 0; i < 5; i++) {
		cxt.moveTo(220 + i * 20, 10);
		cxt.lineTo(220 + i * 20, 90);
		cxt.moveTo(220, 10 + i * 20);
		cxt.lineTo(300, 10 + i * 20);
	}
	cxt.stroke();
}

//键盘绑定
document.addEventListener('keydown', function (event) {
	var tempKeyCode = event.keyCode, temp;
	switch (tempKeyCode) {
		case 32:
		do {
			temp = tetris.refreshTetris('move', 40);
		} while (temp !== 'out');
		break;
		case 37:
		tetris.refreshTetris('move', tempKeyCode);
		break;
		case 38:
		tetris.refreshTetris('change');
		break;
		case 39:
		tetris.refreshTetris('move', tempKeyCode);
		break;
		case 40:
		tetris.refreshTetris('move', tempKeyCode);
		break;
	}
}, false);

btn.addEventListener('click', function (event) {
	initAreaState();
	//清除左边
	for (i = 0; i < 10; i++) {
		for (j = 0; j < 15; j++) {
			cxt.clearRect(11 + i * 20, 11 + j * 20, 18, 18);
		}
	}
	//清除右边
	for (i = 0; i < 4; i++) {
		for (j = 0; j < 4; j++) {
			cxt.clearRect(221 + i * 20, 11 + j * 20, 18, 18);
		}
	}
	freshScore.innerHTML = '0';
	createNewTetris('left');
	createNewTetris('right');
}, false);

//画小方块 Ok
function drawRect (x, y, color, position) {
	cxt.fillStyle = color;
	cxt.fillRect(((position === 'left') ? 11 : 221) + x * 20, 11 + y * 20, 18, 18);
}

//产生新的俄罗斯方块
function createNewTetris (pos) {
	randomNumber = Math.floor(Math.random() * 7);
	if (pos === 'left') {
		tetris = new Tetris(3, 0, randomNumber, 0, 'left');
		tetris.drawTetris();
	}
	if (pos === 'right') {
		nextTetris = new Tetris(0, 0, randomNumber, 0, 'right');
		nextTetris.drawTetris();
	}
}

//游戏是否结束
function isOver () {
	for (i = 0; i < 4; i++) {
		if (areaState[tetris.tetrisArray[i].y][tetris.tetrisArray[i].x].value === 1) {
			clearInterval(timer);
			return true;
		}
	}
	return false;
}

//移动是否出界
function isOut (x, y, direct) {
	perScore = 0;
	switch (direct) {
		case 37:
		if (x-1 < 0  || areaState[y][x-1].value === 1) return true;
		break;
		case 39:
		if (x+1 > 9 || areaState[y][x+1].value === 1) return true;
		break;
		case 40:
		if (y+1 > 14 || areaState[y+1][x].value === 1) {
			//固定底部方块
			for (i = 0; i < 4; i++) {
				areaState[tetris.tetrisArray[i].y][tetris.tetrisArray[i].x].value = 1;
				areaState[tetris.tetrisArray[i].y][tetris.tetrisArray[i].x].color = tetris.tetrisColor;
			}
			//判断是否消除一行
			for (i = 0; i < 15; i++) {
				for (j = 0; j < 10; j++) {
					if (areaState[i][j].value !== 1) break;
					if (j === 9) {
						// 消除一行
						for (k = 0; k < 10; k++) {
							cxt.clearRect(11 + k * 20, 11 + i * 20, 18, 18);
						}
						for (k = 0; k < 10; k++) {
							areaState[i][k].value = 0;
						}
						// 上面往下面掉
						for (m = i - 1; m >= 0; m--) {
							for (n = 0; n < 10; n++) {
								if (areaState[m][n].value === 1) {
									cxt.clearRect(11 + n * 20, 11 + m * 20, 18, 18);
									areaState[m][n].value = 0;
									drawRect(n, m+1, areaState[m][n].color, 'left');
									areaState[m+1][n] = {value: 1, color: areaState[m][n].color};
								}
							}
						}
						//总行数 越多行分数越高
						perScore++;
					}
				}
			}
			freshScore.innerHTML = parseInt(freshScore.innerHTML) + Math.pow(perScore,2) * 10;
			//清除右边区域
			nextTetris.clearTetris('right');
			//把右边区域拉过来
			tetris = nextTetris;
			tetris.x = 3;
			tetris.position = 'left';
			tetris.initTetris();
			//判断游戏是否结束
			if (isOver()) return true;
			tetris.drawTetris();
			//重新生成右边方块
			createNewTetris('right');
			return true;
		}  
		break;
	}
	return false;
}

//变形是否出界
function isNowOut (x, y) {
	if ( x < 0 || x > 9 || y > 14 || areaState[y][x].value === 1) {
		return true;
	}
	return false;
}

//定义俄罗斯方块类 坐标 方块类型 变化类型 位置
function Tetris (x, y, tetrisType, changeType, position) {
	this.x = x || 0;
	this.y = y || 0;
	this.tetrisType = tetrisType || 0;
	this.changeType = changeType || 0;
	this.position = position || 'left';
	this.tetrisColor = 'black';
	this.tetrisArray = [];
	this.initTetris();
}

//画出当前的俄罗斯方块
Tetris.prototype.drawTetris = function () {
	for (i = 0; i < 4; i++) {
		drawRect(this.tetrisArray[i].x, this.tetrisArray[i].y, this.tetrisColor, this.position);
	}
}

//初始化俄罗斯方块
Tetris.prototype.initTetris = function () {
	this.tetrisArray = [];
	//判断方块类型 共有7种
	switch(this.tetrisType) {
		case 0:
		this.tetrisColor = 'purple';
		this.tetrisArray.push({x: this.x, y: this.y}, {x: this.x, y: this.y+1}, {x: this.x+1, y: this.y+1}, {x: this.x+2, y: this.y+1});
		break;
		case 1:
		this.tetrisColor = 'red';
		this.tetrisArray.push({x: this.x+1, y: this.y}, {x: this.x, y: this.y+1}, {x: this.x+1, y: this.y+1}, {x: this.x+2, y: this.y+1});
		break;
		case 2:
		this.tetrisColor = '#F5DEB3';
		this.tetrisArray.push({x: this.x+2, y: this.y}, {x: this.x, y: this.y+1}, {x: this.x+1, y: this.y+1}, {x: this.x+2, y: this.y+1});
		break;
		case 3:
		this.tetrisColor = '#00ffff';
		this.tetrisArray.push({x: this.x+1, y: this.y}, {x: this.x+1, y: this.y+1}, {x: this.x+2, y: this.y+1}, {x: this.x+2, y: this.y+2});
		break;
		case 4:
		this.tetrisColor = 'orange';
		this.tetrisArray.push({x: this.x+2, y: this.y}, {x: this.x+1, y: this.y+2}, {x: this.x+1, y: this.y+1}, {x: this.x+2, y: this.y+1});
		break;
		case 5:
		this.tetrisColor = 'brown';
		this.tetrisArray.push({x: this.x+1, y: this.y}, {x: this.x+1, y: this.y+1}, {x: this.x+2, y: this.y}, {x: this.x+2, y: this.y+1});
		break;
		case 6:
		this.tetrisColor = 'pink';
		this.tetrisArray.push({x: this.x+1, y: this.y}, {x: this.x+1, y: this.y+1}, {x: this.x+1, y: this.y+2}, {x: this.x+1, y: this.y+3});
		break;
	}
}

//清除(上一次)俄罗斯方块
Tetris.prototype.clearTetris = function (position) {
	for (i = 0; i < 4; i++) {
		cxt.clearRect(((position === 'left') ? 11 : 221) + this.tetrisArray[i].x * 20, 11 + this.tetrisArray[i].y * 20, 18, 18);
	}
}

//操作方块
Tetris.prototype.refreshTetris = function (type, keyCode) {
	var tempArray = [];
	//方块变形
	if (type === 'change') {
		
		switch (this.tetrisType) {
			case 0:
			if (this.changeType === 0) {
				tempArray = [[1,0], [2,0], [1,1], [1,2]];
			}
			if (this.changeType === 1) {
				tempArray = [[0,1], [1,1], [2,1], [2,2]];
			}
			if (this.changeType === 2) {
				tempArray = [[1,0], [1,1], [1,2], [0,2]];
			}
			if (this.changeType === 3) {
				tempArray = [[0,0], [0,1], [1,1], [2,1]];
			}
			break;
			case 1:
			if (this.changeType === 0) {
				tempArray = [[1,0], [1,1], [1,2], [2,1]];
			}
			if (this.changeType === 1) {
				tempArray = [[0,1], [1,1], [1,2], [2,1]];
			}
			if (this.changeType === 2) {
				tempArray = [[0,1], [1,1], [1,2], [1,0]];
			}
			if (this.changeType === 3) {
				tempArray = [[0,1], [1,1], [1,0], [2,1]];
			}
			break;
			case 2:
			if (this.changeType === 0) {
				tempArray = [[2,2], [1,0], [1,1], [1,2]];
			}
			if (this.changeType === 1) {
				tempArray = [[0,2], [0,1], [1,1], [2,1]];
			}
			if (this.changeType === 2) {
				tempArray = [[0,0], [1,0], [1,1], [1,2]];
			}
			if (this.changeType === 3) {
				tempArray = [[2,0], [0,1], [1,1], [2,1]];
			}
			break;
			case 3:
			if (this.changeType === 0) {
				tempArray = [[0,2], [1,1], [1,2], [2,1]];
			}
			if (this.changeType === 1) {
				tempArray = [[0,0], [1,1], [0,1], [1,2]];
			}
			if (this.changeType === 2) {
				tempArray = [[1,0], [1,1], [0,1], [2,0]];
			}
			if (this.changeType === 3) {
				tempArray = [[2,2], [2,1], [1,1], [1,0]];
			}
			break;
			case 4:
			if (this.changeType === 0) {
				tempArray = [[0,1], [1,1], [1,2], [2,2]];
			}
			if (this.changeType === 1) {
				tempArray = [[1,0], [1,1], [0,1], [0,2]];
			}
			if (this.changeType === 2) {
				tempArray = [[1,0], [1,1], [0,0], [2,1]];
			}
			if (this.changeType === 3) {
				tempArray = [[1,2], [2,1], [1,1], [2,0]];
			}
			break;
			case 5: return;
			break;
			case 6:
			if (this.changeType === 0) {
				tempArray = [[0,1], [1,1], [2,1], [3,1]];
			}
			if (this.changeType === 1) {
				tempArray = [[1,0], [1,1], [1,2], [1,3]];
			}
			if (this.changeType === 2) {
				tempArray = [[0,1], [1,1], [2,1], [3,1]];
			}
			if (this.changeType === 3) {
				tempArray = [[1,0], [1,1], [1,2], [1,3]];
			}
			break;
		}
		for (i = 0; i < 4; i++) {
			if (isNowOut(this.x+tempArray[i][0], this.y+tempArray[i][1])) return;
		}
		this.clearTetris('left');
		
		this.tetrisArray = [];
		for (i = 0; i < 4; i++) {
			this.tetrisArray.push({x: this.x+tempArray[i][0], y: this.y+tempArray[i][1]});
		}

		this.changeType++;
		if (this.changeType === 4) this.changeType = 0;
	}
	//方块移动
	if (type === 'move') {
		for (i = 0; i < 4; i++) {
			if (isOut(this.tetrisArray[i].x, this.tetrisArray[i].y, keyCode)) return 'out';
		}
		this.clearTetris('left');
		switch (keyCode) {
			case 37:
			this.x--;
			for (i = 0; i < 4; i++) {
				this.tetrisArray[i].x--;
			}
			break;
			case 39: 
			this.x++;
			for (i = 0; i < 4; i++) {
				this.tetrisArray[i].x++;
			}
			break;
			case 40:
			this.y++;
			for (i = 0; i < 4; i++) {
				this.tetrisArray[i].y++;
			}
			break;
		}
	}
	this.drawTetris();
	return 'notOut';
}

//初始化区域状态
initAreaState();

//画地图
drawMap();

//创造左右俄罗斯方块
createNewTetris('left');
createNewTetris('right');

timer = setInterval(function () {
	tetris.refreshTetris('move', 40);
}, 1000);