// 画布类

/*****************************************************
					默认常量及工具函数
******************************************************/
const textures = require('textures');
const d3 = require('./D3.js');
const Snap = require('snapsvg');
const VALID_RADIUS = 15;
const STATION_RADIUS = 10;
const STATION_FILL_COLOR = "#292B31";
const STATION_STROKE_COLOR = "#CCCCCC";
const LINE_COLOR = ['#C594C5', '#FAC863', '#6699CC'];
const LINE_WIDTH = 4;
const TEXT_COLOR = '#CCCCCC';
const TEXT_SIZE = 11;

/** 
 * getVerticalUnitVector 函数: 一个与传入向量相垂直的单位向量
 * @param {Object} v: 一个向量, 有 x, y 属性
 * @return {Object}
 */
const getVerticalUnitVector = function(v) {
	let a, b;
	// ax + by = 0 则 (a, b) 与 (x, y) 垂直
	// 即 b = -ax / y

	a = 1;
	if(v.y === 0) {
		a = 0;
		b = 1;
	} else {
		b = - v.x / v.y;
	}
	
	const length = Math.sqrt(a ** 2 + b ** 2);
	a = a / length;
	b = b / length;

	return {
		x: a,
		y: b
	};
};



/*****************************************************
						画布类
******************************************************/
/**
 * 画布类, 表示地铁网络
 * @class
 */
class Canvas {
	constructor() {
		/**
		 * 画布对应的 dom 对象
		 * @type {dom}
		 * @private
		 */
		this._dom = document.getElementById('draw-svg');

		/**
		 * 画布对应的锚点网格对象
		 * @type {dom}
		 * @private
		 */
		this._svg = d3.select(this._dom).attr('width', 1200).attr('height', 900);
		let t = textures.circles().size(80).radius(3).fill("#343434").strokeWidth(1).stroke('#454545');
		this._svg.call(t);
		this._svg.append("path").attr("d", "M 0 0 L 0 900 L 1200 900 L 1200 0 Z").style("fill", t.url());

		/**
		 * 可以操纵 svg 的一个 snap 对像
		 * @type {Object}
		 * @private
		 */
		this._snap = Snap(this._dom);

		/**
		 * 记录当前画布上的站点
		 * @type {Set{Object}}
		 * 每一个元素有 row, col, value, circle, text 属性
		 * row, cal 为站点对应的行列值
		 * name 为站点名
		 * circle 为 svg 上的圆对象
		 * text 为 svg 上的文字对象
		 * @private
		 */
		this._stations = new Set();

		/**
		 * 记录当前画布上两个站点的连线
		 * @type {Set{Object}}
		 * 每一个元素有 row1, col1, row2, col2, 表示起始点的位置
		 * amount 为连线数量
		 * colors 为线路对应的颜色
		 * line 为 svg 上直线对象组成的数组
		 * @private
		 */
		this._lines = new Set();
	}
}

/** 
 * getClickedDot 方法: 计算鼠标点击位置所对应的绘图区域锚点
 * @param {event} event: DOM 点击事件
 * @return {Object}: 为 null 说明点击不成功, 否则返回对应的点的行列值
 */
Canvas.prototype.getClickedDot = function(event) {
	const e = event || window.event;
	const pos = {x: e.clientX, y: e.clientY};
	if(pos.x > 1200) {
		// 超出绘图区域
		return null;
	}
	const col = Math.floor((pos.x + 30) / 80);
	const row = Math.floor((pos.y + 30) / 80);

	let dotX, dotY; // 中心点位置
	const possibleDot = new Array(); // 元素为 Object, 有 x, y, r, c 属性, 分别表示点的横纵坐标及所在行列
	if(col >= 1 && col <= 15 && row >= 1 && row <= 11) {
		dotX = 80 * col - 30;
		dotY = 80 * row - 30;
		possibleDot.push({x: dotX, y: dotY, r: row, c: col});
	}
	if(col >= 0 && col <= 14 && row >= 1 && row <= 11) {
		dotX = 80 * col + 50;
		dotY = 80 * row - 30;
		possibleDot.push({x: dotX, y: dotY, r: row, c: col + 1});
	}
	if(col >= 1 && col <= 15 && row >= 0 && row <= 10) {
		dotX = 80 * col - 30;
		dotY = 80 * row + 50;
		possibleDot.push({x: dotX, y: dotY, r: row + 1, c: col});
	}
	if(col >= 0 && col <= 14 && row >= 0 && row <= 10) {
		dotX = 80 * col + 50;
		dotY = 80 * row + 50;
		possibleDot.push({x: dotX, y: dotY, r: row + 1, c: col + 1});
	}

	for(let dot of possibleDot) {
		//console.log(each);
		const distance = (pos.x - dot.x) ** 2 + (pos.y - dot.y) ** 2;
		if(distance <= VALID_RADIUS ** 2) {
			return {
				// x: dot.x,
				// y: dot.y,
				row: dot.r,
				col: dot.c
			};
		}
	}
	return null;
};

/** 
 * _drawCircle 方法: 在指定位置绘制圆
 * @param {Object} center: 圆心点所在行列
 * @param {int=} radius: 半径
 * @param {string=} fillColor: 填充颜色
 * @param {string=} strokeColor: 边线颜色
 * @return {Object}: 返回创建的圆对象
 */
Canvas.prototype._drawCircle = function(center, radius = STATION_RADIUS, fillColor = STATION_FILL_COLOR, strokeColor = STATION_STROKE_COLOR) {
	let circle = this._snap.paper.circle(center.col * 80 - 40, center.row * 80 - 40, STATION_RADIUS / 2);
	circle.attr({
	    fill: fillColor,
	    stroke: strokeColor,
	    strokeWidth: 2
	});
	circle.animate({r: STATION_RADIUS}, 1000, mina.elastic);
	
	return circle;
	//this._dom.appendChild(c.node);
};

/** 
 * _drawLine 方法: 在指定位置绘制连线
 * @param {Object} start: 起点所在行列
 * @param {Object} end: 终点所在行列
 * @param {int=} lineAmount: 两点之间连线的数量, 要求 <= 3
 * @param {Array{string}=} color: 颜色
 * @param {int=} width: 宽度
 * @return {Array{Object}}: 返回创建的直线对象数组
 */
Canvas.prototype._drawLine = function(start, end, lineAmount = 1, color = LINE_COLOR, width = LINE_WIDTH) {
	if(lineAmount > 3) {
		throw new Error('两个站点间不可以多于 3 条线路!');
	}

	let line = new Array();
	const x1 = start.col * 80 - 40;
	const y1 = start.row * 80 - 40;
	const x2 = end.col * 80 - 40;
	const y2 = end.row * 80 - 40;
	const unitVector = getVerticalUnitVector({x: x2 - x1, y: y2 - y1});
	let xOffset = unitVector.x;
	let yOffset = unitVector.y;

	// console.log(x1, y1);
	// console.log(x2, y2);
	// console.log(unitVector.x, unitVector.y);
	// console.log(xOffset, yOffset);

	if(lineAmount === 1) {
		line[0] = this._snap.paper.line(x1, y1, x2, y2);
		line[0].attr({
			fill: color[0],
			stroke: color[0],
			strokeWidth: LINE_WIDTH
		});
	} else if(lineAmount === 2) {
		xOffset *= 0.5 * width;
		yOffset *= 0.5 * width;
		line[0] = this._snap.paper.line(x1 + xOffset, y1 + yOffset, x2 + xOffset, y2 + yOffset);
		line[0].attr({
			fill: color[0],
			stroke: color[0],
			strokeWidth: LINE_WIDTH
		});

		line[1] = this._snap.paper.line(x1 - xOffset, y1 - yOffset, x2 - xOffset, y2 - yOffset);
		line[1].attr({
			fill: color[1],
			stroke: color[1],
			strokeWidth: LINE_WIDTH
		});
	} else if(lineAmount === 3) {
		xOffset *= width;
		yOffset *= width;
		line[0] = this._snap.paper.line(x1 + xOffset, y1 + yOffset, x2 + xOffset, y2 + yOffset);
		line[0].attr({
			fill: color[0],
			stroke: color[0],
			strokeWidth: LINE_WIDTH
		});

		line[1] = this._snap.paper.line(x1, y1, x2, y2);
		line[1].attr({
			fill: color[1],
			stroke: color[1],
			strokeWidth: LINE_WIDTH
		});

		line[2] = this._snap.paper.line(x1 - xOffset, y1 - yOffset, x2 - xOffset, y2 - yOffset);
		line[2].attr({
			fill: color[2],
			stroke: color[2],
			strokeWidth: LINE_WIDTH
		});
	}
	
	return line;
};

/** 
 * _drawText 方法: 在指定位置输出文字
 * @param {Object} pos: 文字所对应的点所在行列
 * @param {string} value: 文字内容
 * @param {string=} color: 颜色
 * @param {int=} size: 大小
 * @return {Object}: 返回创建的文字对象
 */
Canvas.prototype._drawText = function(pos, value, color = TEXT_COLOR, size = TEXT_SIZE) {
	const x = pos.col * 80 - 40;
	const y = pos.row * 80 - 40;

	let t = this._snap.text(x, y, value);
	t.attr({
		fill: TEXT_COLOR,
		'font-size': TEXT_SIZE
	});

	const xOffset = - t.node.getComputedTextLength() / 2;
	const yOffset = (TEXT_SIZE + STATION_RADIUS) * 1.1;
	t.attr({
		x: x + xOffset,
		y: y + yOffset, 
	});

	return t;
};

/** 
 * drawStation 方法: 在指定位置画出站点
 * @param {Object} pos: 对应点所在行列
 * @param {string} name: 站点名字
 * @return {void}
 */
Canvas.prototype.drawStation = function(pos, name) {
	let circle = this._drawCircle(pos);
	let text = this._drawText(pos, name);
	this._stations.add({
		row: pos.row,
		col: pos.col,
		name: name,
		circle: circle,
		text: text
	});
};

/** 
 * drawLine 方法: 在指定位置画出连线
 * @param {Object} start: 开始点所在行列
 * @param {Object} end: 结束点所在行列
 * @param {int} amount: 连线数量
 * @param {Array} colors: 连线颜色
 * @return {void}
 */
Canvas.prototype.drawLine = function(start, end, amount, colors) {
	let line = this._drawLine(start, end, amount, colors); //返回的连线对象数组
	this._lines.add({
		row1: start.row,
		col1: start.col,
		row2: end.row,
		col2: end.col,
		amount: amount,
		line: line,
		colors: colors
	});
};

/** 
 * drawLine 方法: 删除两点之间的连线
 * @param {Object} start: 开始点所在行列
 * @param {Object} end: 结束点所在行列
 * @return {void}
 */
Canvas.prototype.deleteLine = function(start, end) {
	let selectedLine;
	for(let each of this._lines) {
		if(start.row === each.row1 && start.col === each.col1 && end.row === each.row2 && end.col === each.col2) {
			console.log(1)
			selectedLine = each;
			break;
		} else if(start.row === each.row2 && start.col === each.col2 && end.row === each.row1 && end.col === each.col1) {
			console.log(2)
			selectedLine = each;
			break;
		}
	}

	for(let l of selectedLine.line) {
		l.remove();
	}
	this._lines.delete[selectedLine];
};

/** 
 * adjustSVG 方法: 调整站点和连线的上下位置, 使站点图层在上
 * @return {void}
 */
Canvas.prototype.adjustSVG = function() {
	for(let item of this._stations) {
		this._dom.appendChild(item.circle.node);
		this._dom.appendChild(item.text.node);
	}
};

/** 
 * clear 方法: 清空画布
 * @return {void}
 */
Canvas.prototype.clear = function() {
	for(let each of this._lines) {
		for(let l of each.line) {
			l.remove();
		}
	}

	for(let each of this._stations) {
		each.circle.remove();
		each.text.remove();
	}
};

/** 
 * bind 方法: 为 dom 绑定事件
 * @return {void}
 */
Canvas.prototype.bind = function(eventName, callback) {
	this._dom.addEventListener(eventName, callback, false);
};

/** 
 * unbind 方法: 为 dom 绑定事件
 * @return {void}
 */
Canvas.prototype.unbind = function(eventName, callback) {
	this._dom.removeEventListener(eventName, callback, false);
};

/** 
 * isEmpty 方法: 检查 pos 位置是否已经有站点
 * @return {bool}
 */
Canvas.prototype.isEmpty = function(pos) {
	for(let each of this._stations) {
		if(each.row === pos.row && each.col === pos.col) {
			return false;
		}
	}
	return true;
};

/** 
 * getStationName 方法: 检查 pos 位置站点的名字
 * @return {string}
 */
Canvas.prototype.getStationName = function(pos) {
	if(this.isEmpty(pos)) {
		throw new Error(pos.row + '行' + pos.col + '列没有站点!');
	}
	
	let selectedStation;
	for(let each of this._stations) {
		if(each.row === pos.row && each.col === pos.col) {
			selectedStation = each;
		}
	}
	return selectedStation.text.node.innerHTML;
};

/** 
 * rename 方法: 修改 pos 位置站点之名称
 * @return {void}
 */
Canvas.prototype.rename = function(pos, newName) {
	if(this.isEmpty(pos)) {
		throw new Error(pos.row + '行' + pos.col + '列没有站点!');
	}

	let selectedStation;
	for(let each of this._stations) {
		if(each.row === pos.row && each.col === pos.col) {
			selectedStation = each;
		}
	}
	selectedStation.text.remove();
	selectedStation.text = this._drawText(pos, newName);
};

// example
// const MyTools = require('./MyTools.js');
// const canvas = new Canvas();
// let start = null, end = null;
// const whenClick = (event) => {
// 	const result = canvas.getClickedDot(event);
// 	if(result !== null) {
// 		canvas.drawStation(result, '今天儿真好Hey');
// 		if(start === null) {
// 			start = MyTools.deepCopy(result);
// 		} else if(end === null) {
// 			end = MyTools.deepCopy(result);
// 			canvas.drawLine(start, end, 2, ['#EC5F68', '#FAC863']);
// 			canvas.adjustSVG();
// 			document.body.removeEventListener('click', whenClick, false);
// 		}
// 	}
// };
// document.body.addEventListener('click', whenClick, false);

module.exports = Canvas;