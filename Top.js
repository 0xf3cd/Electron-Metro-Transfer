// 顶层实现
const Canvas = require('./Canvas.js');
const Metro = require('./Metro.js');
const MyTools = require('./MyTools.js');
const ipcRenderer = require('electron').ipcRenderer;
const LINE_MOST_AMOUNT = 10;
const COLOR = [
	'#0089d3',
	'#897fd1',
	'#006b51',
	'#bfa6cf',
	'#fcd100',
	'#e0001b',
	'#eb6100',
	'#80bb11',
	'#e68eb9',
	'#7b0d1b'
];



// 预处理部分
vex.defaultOptions.className = 'vex-theme-flat-attack';//'vex-theme-plain'; // 设定弹窗风格
const metro = new Metro(); // metro 对象
const canvas = new Canvas(); // canvas 对象



// 初始化按钮所执行的方法
/**
 * initialize 函数: 将预设好的地图导入现有图中
 * 注意: 将清空原有地图 
 */
const initialize = function() {
	// 添加线路
	metro.addLine(1);
	metro.addLine(2);
	metro.addLine(3);
	metro.addLine(4);

	// 记录站点和对应位置
	const stations = new Object();
	stations['曲阜路'] = {row: 8, col: 4};
	stations['中兴路'] = {row: 5, col: 4};
	stations['西藏北路'] = {row: 4, col: 5};
	stations['虹口足球场'] = {row: 4, col: 6};
	stations['曲阳路'] = {row: 4, col: 8};
	stations['四平路'] = {row: 4, col: 10};
	stations['鞍山新村'] = {row: 4, col: 12};
	stations['天潼路'] = {row: 8, col: 6};
	stations['国际客运中心'] = {row: 8, col: 8};
	stations['提篮桥'] = {row: 7, col: 9};
	stations['大连路'] = {row: 6, col: 10};
	stations['上海火车站'] = {row: 6, col: 3};
	stations['宝山路'] = {row: 6, col: 5};
	stations['海伦路'] = {row: 6, col: 6};
	stations['临平路'] = {row: 6, col: 8};
	stations['四川北路'] = {row: 7, col: 6};
	stations['邮电新村'] = {row: 5, col: 8};
	stations['同济大学'] = {row: 3, col: 11};

	// 添加站点
	Object.keys(stations).forEach(function(name) {
		metro.addStation(name);
	});

	// 添加线路连接
	metro.addConnection(1, '曲阜路', '中兴路');
	metro.addConnection(1, '中兴路', '西藏北路');
	metro.addConnection(1, '西藏北路', '虹口足球场');
	metro.addConnection(1, '虹口足球场', '曲阳路');
	metro.addConnection(1, '曲阳路', '四平路');
	metro.addConnection(1, '四平路', '鞍山新村');
	metro.addConnection(2, '曲阜路', '天潼路');
	metro.addConnection(2, '天潼路', '国际客运中心');
	metro.addConnection(2, '国际客运中心', '提篮桥');
	metro.addConnection(2, '提篮桥', '大连路');
	metro.addConnection(3, '上海火车站', '宝山路')
	metro.addConnection(3, '宝山路', '海伦路');
	metro.addConnection(3, '海伦路', '临平路');
	metro.addConnection(3, '临平路', '大连路');
	metro.addConnection(4, '天潼路', '四川北路');
	metro.addConnection(4, '四川北路', '海伦路');
	metro.addConnection(4, '海伦路', '邮电新村');
	metro.addConnection(4, '邮电新村', '四平路');
	metro.addConnection(4, '四平路', '同济大学');

	// 在画布上画出线路连接
	for(let i = 1; i <= 4; i++) {
		const all = metro.getAll(i);
		for(let j = 0; j < all.length - 1; j++) {
			let from = all[j];
			let to = all[j + 1];
			canvas.drawLine(stations[from], stations[to], 1, [COLOR[i - 1]]);
		}
	}

	// 在画布上画出站点
	Object.keys(stations).forEach(function(name) {
		let pos = stations[name];
		canvas.drawStation(pos, name);
	});
};

ipcRenderer.on('initialize', (event) => {
	vex.dialog.confirm({
		message: '初始化地图将清空所有站点和线路哟，确认要这么做吗？',
		callback: function(value) {
			if(value) {
				metro.destroy();
				canvas.clear();
				initialize();
			}
		}
	})
});



// 清除按钮对应方法
ipcRenderer.on('clear', (event) => {
	vex.dialog.confirm({
		message: '站点一去不复回呀，少年你确认要清除它们吗？',
		callback: function(value) {
			if(value) {
				metro.destroy();
				canvas.clear();
			}
		}
	})
});



// 加站按钮对应方法
/**
 * addStation 函数: 根据输入位置和新名字加站
 * @param {Object} pos: 用户点击点的行列值
 * @param {string} name: 站点名
 * @return {void}
 */
const addStation = function(pos, name) {
	if(name === '') {
		vex.dialog.alert({
			message: '站点名字不能为空呀！',
		});
	} else if(name === false) {
		return;
	} else {
		if(metro.hasStation(name)) {
			vex.dialog.alert({message: name + '已经存在啦！'});
			return;
		}

		let canPut = false;
		try {
			canvas.getStationName(pos);
		} catch(e) {
			canPut = true; //说明这个位置没有站点
		}

		if(!canPut) {
			vex.dialog.alert({message: '这个位置明明有其他小朋友！'});
			return;
		}

		metro.addStation(name);
		canvas.drawStation(pos, name);
	}
};

/**
 * getAddStationName 函数: 得到用户点击并获取用户输入站点名
 * 注意其中使用了回调函数 addStation
 * @param {Event} event: HTML 原生事件
 * @return {void}
 */
const getAddStationName = function(event) {
	let pos = canvas.getClickedDot(event);
	if(pos !== null) {
		canvas.unbind('click', getAddStationName); // 移除点击事件
		vex.dialog.prompt({
		    message: '新的站点叫什么名字好呢？',
		    placeholder: 'New Station Name',
		    callback: function(value) {
		        addStation(pos, value);
		    }
		})
	}
};

ipcRenderer.on('add-station', (event) => {
	vex.dialog.alert({
	    message: '请点击要加站的位置呢～',
	    callback: function() {
	        canvas.bind('click', getAddStationName);
	    }
	});
});



// 重命名按钮对应方法
/**
 * renameStation 函数: 重命名站点
 * @param {Object} pos: 用户点击点的行列值
 * @param {string} newName: 新站点名
 * @return {void}
 */
const renameStation = function(pos, newName) {
	if(newName === '') {
		vex.dialog.alert({
			message: '更改失败哟，可不能让站点无名无份呀！',
		});
	} else if(newName === false) {
		return;
	} else {
		if(metro.hasStation(newName)) {
			vex.dialog.alert({message: newName + '已经存在啦！'});
			return;
		}
		let oldName = canvas.getStationName(pos);
		canvas.rename(pos, newName);
		metro.renameStation(oldName, newName);
	}
};

/**
 * getRenameStationName 函数: 得到用户点击并获取新名字
 * 注意其中使用了回调函数 renameStation
 * @param {Event} event: HTML 原生事件
 * @return {void}
 */
const getRenameStationName = function(event) {
	let pos = canvas.getClickedDot(event);
	if(pos !== null) {
		canvas.unbind('click', getRenameStationName);
		if(canvas.isEmpty(pos)) { // 如果点击位置没有站点
    		vex.dialog.alert({message: '这里暂时还空无一物呢。'});
    		return;
    	}
		
		vex.dialog.prompt({ // 提示用户输入新名字
		    message: '站点改成什么名字好呢？',
		    placeholder: 'New Name',
		    callback: function(value) {
		    	renameStation(pos, value);
		    }
		})
	}
};

ipcRenderer.on('rename-station', (event) => {
	vex.dialog.alert({
	    message: '请点击要修改名字的站点。',
	    callback: function() {
	        canvas.bind('click', getRenameStationName);
	    }
	});
});



// 增加线路按钮方法
let fisrtPos = null;
let secondPos = null;

/**
 * addConnection 函数: 实际操纵底层数据结构, 并更新图像
 * @return {void}
 */
const addConnection = function() {
	const from = canvas.getStationName(fisrtPos);
	const to = canvas.getStationName(secondPos);
	let toShow = '';
	const nowAmount = metro.getLineAmount();
	let inputMost  = 1;
	if(nowAmount >= LINE_MOST_AMOUNT) {
		toShow = '线路已经够多啦，只能在现有线路中选择啦。请输入地铁线路编号（1 - ' + LINE_MOST_AMOUNT + '间的某个整数）。';
		inputMost = LINE_MOST_AMOUNT;
	} else {
		if(nowAmount === 0) {
			toShow = '请输入线路编号 1 以开启第一条线路。';
		} else {
			toShow = '请输入线路编号（1 - ' + nowAmount + '）以现有线路连接，或输入 ' + (nowAmount + 1) + ' 以增加新线路。';
		}
		inputMost = nowAmount + 1;
	}

	vex.dialog.prompt({
		message: toShow,
		placeholder: 'Add Connection',
		callback: function(value) {
			value = parseInt(value);
			if(!MyTools.isInteger(value) || value < 1 || value > inputMost) {
				vex.dialog.alert({message: '呀，好像输入不正确呢！'});
				return;
			}

			if(metro.getLineAmount() + 1 === value) { //加新线
				let hasConnected = metro.getConnection(from, to); // 为 from to 已有的连线
				if(hasConnected.size >= 3) {
					vex.dialog.alert({message: '站点间已经有 3 条连线啦，不能再增加啦！'});
					return;
				}

				if(hasConnected.size !== 0) {
					canvas.deleteLine(fisrtPos, secondPos);
				}
				metro.addLine(value);
				metro.addConnection(value, from, to);
				hasConnected = metro.getConnection(from, to); // 更新连接情况

				let colors = new Array();
				for(let line of hasConnected) {
					colors.push(COLOR[line - 1]);
				}
				canvas.drawLine(fisrtPos, secondPos, hasConnected.size, colors);
				canvas.adjustSVG();
				return;
			}

			if(metro.getLineAmount() !== 0 && metro.isAccessible(value, from, to)) {
				vex.dialog.alert({message: '呀，这两个站点已经在线路 ' + value + ' 上了呢！'});
				return;
			}

			// 此时两个站点不都在 value 线路上, 可能都不在其上
			const stations = metro.getAll(value); // 改线路上的所有站点
			if(stations.includes(from)) { // 前面已经排除两个站点都在线路上的情况, 这代表仅有 from 在线路上
				if(stations.indexOf(from) === 0) {
					metro.insertConnection(value, from, stations[1], to); //先将 to 插入 from 之后
					// 之后再交 from to 交换位置
					const temp = from + to;
					metro.renameStation(from, temp);
					metro.renameStation(to, from);
					metro.renameStation(temp, to);

					let hasConnected = metro.getConnection(from, to); // 连接情况
					let colors = new Array();
					for(let line of hasConnected) {
						colors.push(COLOR[line - 1]);
					}
					canvas.drawLine(fisrtPos, secondPos, hasConnected.size, colors); //画出图像
					canvas.adjustSVG();
				} else if(stations.indexOf(from) === stations.length - 1) {
					metro.addConnection(value, from, to);
					let hasConnected = metro.getConnection(from, to); // 连接情况
					let colors = new Array();
					for(let line of hasConnected) {
						colors.push(COLOR[line - 1]);
					}
					canvas.drawLine(fisrtPos, secondPos, hasConnected.size, colors);
					canvas.adjustSVG();
				} else {
					vex.dialog.alert({message: (from + ' 左右手都是' + value + '号线呢，不能让 ' + to + ' 插足！')});
				}
			} else if(stations.includes(to)) { // 仅有 to 在线路上
				if(stations.indexOf(to) === 0) {
					metro.insertConnection(value, to, stations[1], from); //先将 to 插入 from 之后
					// 之后再交 from to 交换位置
					const temp = from + to;
					metro.renameStation(from, temp);
					metro.renameStation(to, from);
					metro.renameStation(temp, to);

					let hasConnected = metro.getConnection(from, to); // 连接情况
					let colors = new Array();
					for(let line of hasConnected) {
						colors.push(COLOR[line - 1]);
					}
					canvas.drawLine(fisrtPos, secondPos, hasConnected.size, colors); // 画出图像
					canvas.adjustSVG();
				} else if(stations.indexOf(to) === stations.length - 1) {
					metro.addConnection(value, to, from);
					let hasConnected = metro.getConnection(to, from); // 连接情况
					let colors = new Array();
					for(let line of hasConnected) {
						colors.push(COLOR[line - 1]);
					}
					canvas.drawLine(fisrtPos, secondPos, hasConnected.size, colors);
					canvas.adjustSVG();
				} else {
					vex.dialog.alert({message: (to + ' 左右手都是' + value + '号线呢，不能让 ' + from + ' 插足！')});
				}
			} else { //都不在 value 上
				// 如果 value 线路不空, 而且要加入的站点都不在其上, 则出错
				vex.dialog.alert({message: '这两个站点好像放不到 ' + value + ' 上去呀！再检查一下吧～'});
			}
		}
	});
};

const getSecondClick = function(event) {
	let pos = canvas.getClickedDot(event);
	if(pos !== null) {
		canvas.unbind('click', getSecondClick);
		if(canvas.isEmpty(pos)) { // 如果点击位置没有站点
    		vex.dialog.alert({message: '这里暂时还空无一物呢。'});
    		return;
    	}
    	// 第二个站点有效
    	secondPos = pos;
    	addConnection();
	}
};

const getFirstClick = function(event) {
	let pos = canvas.getClickedDot(event);
	if(pos !== null) {
		canvas.unbind('click', getFirstClick);
		if(canvas.isEmpty(pos)) { // 如果点击位置没有站点
    		vex.dialog.alert({message: '这里暂时还空无一物呢。'});
    		return;
    	}
		// 第一个站点有效
		fisrtPos = pos;
		vex.dialog.alert({
		    message: '请点击要连接的第二个站点。',
		    callback: function(value) {
		        canvas.bind('click', getSecondClick);
		    }
		});
	}
};

ipcRenderer.on('adjust-line', (event) => {
	fisrtPos = null;
	secondPos = null;
	vex.dialog.alert({
	    message: '请点击要连接的第一个站点。',
	    callback: function() {
	        canvas.bind('click', getFirstClick);
	    }
	});
});



// 搜索路线的方法
let fromPos = null;
let toPos = null;
/**
 * addConnection 函数: 实际操纵底层数据结构, 并更新图像
 * @param {string} from: 出发站点
 * @param {string} to: 结束站点
 * @return {Array}: 可以直观读取的字符串数组
 */
const getTransferPlan = function(from, to) {
	// 由于可能不存在通路, 所以需要使用 try catch 机制
	// 在 search 方法中如果出错将抛出一个异常
	let result;
	try {
		result = metro.search(from, to);
	} catch(e) {
		vex.dialog.alert({message: e.message});
		return null;
	}

	const combineRoutePlan = function(r, p) {
		let s = '';
		for(let i = 0; i < r.length - 1; i++) {
			s += r[i];
			s += ' --';
			s += p[i];
			s += '-> ';
		}
		s += r[r.length - 1];
		s += '\n共换乘' + p[p.length - 1] + '次\n';
		return s;
	};

	// 解释 result
	const amount = result.routes.length;
	let finalPlans = new Array();
	for(let i = 0; i < amount; i++) {
		for(let p of result.plans[i]) {
			finalPlans.push(combineRoutePlan(result.routes[i], p));
		}
	}

	ipcRenderer.send('search-finished', finalPlans);
};

const getToPos = function(event) {
	let pos = canvas.getClickedDot(event);
	if(pos !== null) {
		canvas.unbind('click', getToPos);
		if(canvas.isEmpty(pos)) { // 如果点击位置没有站点
    		vex.dialog.alert({message: '这里暂时还空无一物呢。'});
    		return;
    	}
    	// 第二个站点有效
    	toPos = pos;
    	let from = canvas.getStationName(fromPos);
    	let to = canvas.getStationName(toPos);
    	getTransferPlan(from, to);
	}
};

const getFromPos = function(event) {
	let pos = canvas.getClickedDot(event);
	if(pos !== null) {
		canvas.unbind('click', getFromPos);
		if(canvas.isEmpty(pos)) { // 如果点击位置没有站点
    		vex.dialog.alert({message: '这里暂时还空无一物呢。'});
    		return;
    	}
		// 第一个站点有效
		fromPos = pos;
		vex.dialog.alert({
		    message: '请点击到达站点。',
		    callback: function(value) {
		        canvas.bind('click', getToPos);
		    }
		});
	}
};

ipcRenderer.on('search-route', (event) => {
	fromPos = null;
	toPos = null;
	vex.dialog.alert({
	    message: '请点击出发站点。',
	    callback: function() {
	        canvas.bind('click', getFromPos);
	    }
	});
});