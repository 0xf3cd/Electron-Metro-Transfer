// 地铁图的底层算法实现

/*****************************************************
					默认常量及工具函数
******************************************************/
const MyTools = require('./MyTools.js');
const INF = 9999999



/*****************************************************
						地铁线路类
******************************************************/
/**
 * 地铁线路类, 表示某一条地铁线路
 * @class
 */
class Line {
	constructor() {
		/**
		 * 线路的编号
		 * @type {int}
		 * @private
		 */
		this._number = null;

		/**
		 * 线路的站点集合
		 * @type {Array}
		 * @private
		 */
		this._stations = new Array();
	}
}

/**
 * setNumber 方法: 为线路设定编号
 * @param {int} number
 * @return {Array}
 */
Line.prototype.setNumber = function(number) {
	if(!MyTools.isInteger(number)) {
		throw new Error(number + '不是整数!');
	}
	this._number = number;
};

Line.prototype.getNumber = function() {
	return this._number;
};

/**
 * getAll 方法: 返回当前线路上所有的站点名的数组
 * @return {Array}
 */
Line.prototype.getAll = function() {
	// let allStations = MyTools.deepCopy(this._stations);
	// return allStations;
	let allStations = new Array();
	for(let each of this._stations) {
		allStations.push(each);
	}
	return allStations;
};

/**
 * has 方法: 判断当前站点中是否存在 station 站点
 * @param {string} station
 * @return {bool}
 */
Line.prototype.has = function(station) {
	for(let each of this._stations) {
		if(each === station) {
			return true;
		}
	}
	return false;
};

/**
 * getIndex 方法: 得到 station 在站点列表中的位置(从 1 开始)
 * @param {string} station
 * @return {int}: 为 -1 代表没找到
 */
Line.prototype.getIndex = function(station) {
	for(let i = 0; i < this._stations.length; i++) {
		if(this._stations[i] === station) {
			return i + 1;
		}
	}
	return -1;
};

/**
 * isNeighbor 方法: 判断 A, B 在线路上是否相邻
 * @param {string} A
 * @param {string} B
 * @return {bool}
 */
Line.prototype.isNeighbor = function(A, B) {
	if(!this.has(A) || !this.has(B)) {
		// throw new Error(A + ' 或 ' + B + ' 不存在!');
		return false;
	}

	const indexA = this.getIndex(A);
	const indexB = this.getIndex(B);

	if(indexA - indexB === 1) {
		return true;
	} else if(indexA - indexB === -1) {
		return true;
	} else {
		return false;
	}
};

/**
 * isAccessible 方法: 判断 A, B 是否都在线路上
 * @param {string} A
 * @param {string} B
 * @return {bool}
 */
Line.prototype.isAccessible = function(A, B) {
	if(!this.has(A) || !this.has(B)) {
		return false;
	} else {
		return true;
	}
};

/**
 * insert 方法: 向原有站点 A 及 B 之间插入新站点
 * @param {string} stationA
 * @param {string} stationB
 * @param {string} newStation
 * @return {void}
 */
Line.prototype.insert = function(stationA, stationB, newStation) {
	if(!this.has(stationA)) {
		throw new Error('线路 ' + this._number + ' 上不存在 ' + stationA + '!');
	}
	if(!this.has(stationB)) {
		throw new Error('线路 ' + this._number + ' 上不存在 ' + stationB + '!');
	}

	const indexA = this.getIndex(stationA);
	const indexB = this.getIndex(stationB);
	if(indexA - indexB === 1) {
		this._stations.splice(indexA - 1, 0, newStation);
	}

	if(indexA - indexB === -1) {
		this._stations.splice(indexB - 1, 0, newStation);
	}
};

/**
 * add 方法: 向站点列表中 A 站后加入 B, A 后的元素自动后移 如果列表为空则加入A 和 B
 * @param {string} A
 * @param {string} B
 * @return {void}
 */
Line.prototype.add = function(A, B) {
	if(this._stations.length === 0) {
		this._stations[0] = A;
		this._stations[1] = B;
	} else {
		if(!this.has(A)) {
			throw new Error('线路 ' + this._number + ' 上不存在站点 ' + A);
		}
		const indexA = this.getIndex(A);
		this._stations.splice(indexA, 0, B);
	}
};

/**
 * remove 方法: 删去站点 A
 * @param {string} A
 * @return {void}
 */
Line.prototype.remove = function(A) {
	if(!this.has(A)) {
		throw new Error('线路 ' + this._number + ' 上存在站点 ' + A);
	}
	const indexA = this.getIndex(A);
	this._stations.splice(indexA - 1, 1);
};

/**
 * rename 方法: 将 station 重命名为 newName
 * @param {string} station
 * @param {string} newName
 * @return {void}
 */
Line.prototype.rename = function(station, newName) {
	if(!this.has(station)) {
		throw new Error('线路 ' + this._number + ' 上存在站点 ' + station);
	}
	
	const index = this.getIndex(station);
	this._stations[index - 1] = newName;
};



/*****************************************************
						地铁网络类
******************************************************/
/**
 * 地铁网络类, 表示地铁线路网络, 本质为图
 * @class
 */
class Metro {
	constructor() {
		/**
		 * 线路集合
		 * @type {Array}, 成员为 Line 对象
		 * @private
		 */
		this._lines = new Array();

		/**
		 * 所有站点的集合
		 * @type {Array}, 成员为 string 类对象
		 * @private
		 */
		this._stations = new Array();

		/**
		 * 邻接矩阵
		 * @type {Array}, 成员为数组, 成员数组的成员为 set
		 * 即成员为集合, 储存了线路编号
		 * @private
		 */
		this._matrix = new Array();
	}
}

/**
 * getLineAmount 方法: 返回线路总数
 * @return {int}
 */
Metro.prototype.getLineAmount = function() {
	return this._lines.length;
};

/**
 * hasLine 方法: 检查地铁网络中是否有某线路
 * @param {int} number
 * @return {bool}
 */
Metro.prototype.hasLine = function(number) {
	for(let each of this._lines) {
		if(each.getNumber() === number) {
			return true;
		}
	}

	return false;
};

/**
 * addLine 方法: 为地铁网络中加入新的地铁线路
 * @param {int} number
 * @return {void}
 */
Metro.prototype.addLine = function(number) {
	if(this.hasLine(number)) {
		throw new Error('线路 ' + number + ' 已存在');
	} else {
		if(!MyTools.isInteger(number)) {
			throw new Error('线路编号 ' + number + ' 不是整数');
		}

		let newLine = new Line();
		newLine.setNumber(number);
		this._lines.push(newLine);
	}
};

/**
 * getStationAmount 方法: 返回站点总数
 * @return {int}
 */
Metro.prototype.getStationAmount = function() {
	return this._stations.length;
};

/**
 * hasStation 方法: 检查地铁网络中是否有某站点
 * @param {string} station
 * @return {bool}
 */
Metro.prototype.hasStation = function(station) {
	for(let each of this._stations) {
		if(each === station) {
			return true;
		}
	}

	return false;
};

/**
 * addStation 方法: 向检查地铁网络中加入站点
 * @param {string} station
 * @return {bool}
 */
Metro.prototype.addStation = function(station) {
	if(this.hasStation(station)) {
		throw new Error('站点 ' + station + ' 已存在');
	} else {
		if(!MyTools.isString(station)) {
			throw new Error('站点名 ' + station + ' 不是字符串');
		}

		this._stations.push(station);

		const stationAmount = this.getStationAmount();
		for(let each of this._matrix) {
			// each 为一个数组, 成员为 set
			each.push(new Set()); // 向数组末尾添加一个新的成员, 即代表在邻接矩阵中添加新添加一列
		}

		const newVertices = new Array();
		for(let i = 0; i < stationAmount; i++) {
			newVertices[i] = new Set();
		}
		this._matrix.push(newVertices); // 新添加一行
	}
};

/**
 * getStationIndex 方法: 得到 station 在数组中的序号, 1开始
 * @param {string} station
 * @return {int}
 */
Metro.prototype.getStationIndex = function(station) {
	if(!this.hasStation(station)) {
		throw new Error('站点 ' + station + ' 不存在');
	} else {
		for(let i = 0; i < this.getStationAmount(); i++) {
			if(this._stations[i] === station) {
				return i + 1;
			}
		}
	}

	return -1;
};

/**
 * addConnection 方法: 向检查地铁网络中某条线路中的 A 后加入 B
   A 和 B 都需要在网络中
 * @param {int} lineNumber
 * @param {string} A
 * @param {string} B
 * @return {void}
 */
Metro.prototype.addConnection = function(lineNumber, A, B) {
	if(!this.hasLine(lineNumber)) {
		throw new Error('地铁网络中没有线路 ' + lineNumber);
	}

	if(!this.hasStation(A)) {
		throw new Error('地铁网络中没有站点 ' + A);
	}
	if(!this.hasStation(B)) {
		throw new Error('地铁网络中没有站点 ' + B);
	}

	// 将连线加入 Line 对象中
	const line = this._lines[lineNumber - 1];
	line.add(A, B);

	// 更改邻接矩阵
	const indexA = this.getStationIndex(A) - 1;
	const indexB = this.getStationIndex(B) - 1;
	const set1 = this._matrix[indexA][indexB];
	const set2 = this._matrix[indexB][indexA]; //引用而非深拷贝
	set1.add(lineNumber);
	set2.add(lineNumber);
};

/**
 * insertConnection 方法: 向检查地铁网络中某条线路中的 A 及 B 中间插入 C
   A B C 都需要在网络中
 * @param {int} lineNumber
 * @param {string} A
 * @param {string} B
 * @param {string} C
 * @return {void}
 */
Metro.prototype.insertConnection = function(lineNumber, A, B, C) {
	if(!this.hasLine(lineNumber)) {
		throw new Error('地铁网络中没有线路 ' + lineNumber);
	}

	if(!this.hasStation(A)) {
		throw new Error('地铁网络中没有站点 ' + A);
	}
	if(!this.hasStation(B)) {
		throw new Error('地铁网络中没有站点 ' + B);
	}
	if(!this.hasStation(C)) {
		throw new Error('地铁网络中没有站点 ' + C);
	}

	// 调整邻接矩阵
	if(this.isNeighbor(lineNumber, A, B)) {
		const indexA = this.getStationIndex(A) - 1;
		const indexB = this.getStationIndex(B) - 1;
		const indexC = this.getStationIndex(C) - 1;

		// 删除邻接矩阵中记录的, A B 间原有的 lineNumber 连线
		this._matrix[indexA][indexB].delete(lineNumber);
		this._matrix[indexB][indexA].delete(lineNumber);

		// 新增 AC BC 连线
		this._matrix[indexA][indexC].add(lineNumber);
		this._matrix[indexC][indexA].add(lineNumber);
		this._matrix[indexB][indexC].add(lineNumber);
		this._matrix[indexC][indexB].add(lineNumber);
	}

	// 将 C 插入 A B 间
	const line = this._lines[lineNumber - 1];
	line.insert(A, B, C);
};

/**
 * renameStation 方法: 将地铁网络中的某站点重命名
 * @param {string} oldName
 * @param {string} newName
 * @return {void}
 */
Metro.prototype.renameStation = function(oldName, newName) {
	if(!this.hasStation(oldName)) {
		throw new Error('地铁网络中没有站点 ' + oldName);
	}

	if(!MyTools.isString(newName)) {
		throw new Error('站点新名称 ' + newName + ' 不为字符串');
	}

	for(let each of this._lines) {
		if(each.has(oldName)) {
			each.rename(oldName, newName);
		}
	}

	for(let i = 0; i < this.getStationAmount(); i++) {
		if(this._stations[i] === oldName) {
			this._stations[i] = newName;
			return;
		}
	}
};

/**
 * isAccessible 方法: 检查地铁网络中某条线路上是否同时存在 A B 两个站点
 * @param {int} lineNumber
 * @param {string} A
 * @param {string} B
 * @return {bool}
 */
Metro.prototype.isAccessible = function(lineNumber, A, B) {
	if(!this.hasLine(lineNumber)) {
		throw new Error('地铁网络中没有线路 ' + lineNumber);
	}

	if(!this.hasStation(A)) {
		throw new Error('地铁网络中没有站点 ' + A);
	}
	if(!this.hasStation(B)) {
		throw new Error('地铁网络中没有站点 ' + B);
	}

	return this._lines[lineNumber - 1].isAccessible(A, B);
};

/**
 * isNeighbor 方法: 检查地铁网络中某条线路上 A B 两个站点是否相邻
 * @param {int} lineNumber
 * @param {string} A
 * @param {string} B
 * @return {bool}
 */
Metro.prototype.isNeighbor = function(lineNumber, A, B) {
	if(!this.hasLine(lineNumber)) {
		throw new Error('地铁网络中没有线路 ' + lineNumber);
	}

	if(!this.hasStation(A)) {
		throw new Error('地铁网络中没有站点 ' + A);
	}
	if(!this.hasStation(B)) {
		throw new Error('地铁网络中没有站点 ' + B);
	}

	return this._lines[lineNumber - 1].isNeighbor(A, B);
};

Metro.prototype.destroy = function() {
	this._lines = new Array();
	this._stations = new Array();
	this._matrix = new Array();
};

/**
 * getNeighbor 方法: 检查地铁网络中与 A 直接相连的站点
 * @param {string} A
 * @return {Array}
 */
Metro.prototype.getNeighbor = function(A) {
	if(!this.hasStation(A)) {
		throw new Error('地铁网络中没有站点 ' + A);
	}

	const index = this.getStationIndex(A);
	const matrixRow = this._matrix[index - 1];
	let s;
	let neighbor = new Array();
	for(let i = 0; i < this.getStationAmount(); i++) {
		s = matrixRow[i]; // s 为 set 对象, 储存了线路编号
		if(s.size !== 0) {
			// 如果集合不为空, 则说明其有邻居
			neighbor.push(this._stations[i]);
		}
	}
	return neighbor;
};

/**
 * dijkstra 方法: 查询以 A 为起点的单源最短路径
 使用 Dijkstra 算法!
 * @param {string} A
 * @param {string} B
 * @return {Object}
 */
 Metro.prototype.dijkstra = function(A, B) {
	const hasReached = new Set(); // 储存已经确定最短单源路径长度的站点
	const notReached = new Set(); // 储存还未确定最短单源路径长度的站点
	const distance = new Object(); // 记录起点到某个站点的距离, 键值对
	const stationAmount = this.getStationAmount();
	// const startIndex = this.getStationIndex(A) - 1;
	// const endIndex = this.getStationIndex(B) - 1;

	// 初始化
	for(let i = 0; i < stationAmount; i++) {
		notReached.add(this._stations[i]);
		distance[this._stations[i]] = INF;
	}

	// 调整出发结点
	hasReached.add(A);
	notReached.delete(A);
	distance[A] = 0;

	let flag; // 用于记录 A B 是否可达
	while(!hasReached.has(B)) {
		flag = false; 
		for(let station of hasReached) {
			let neighbor = this.getNeighbor(station); // neighbor 为 station 周围的可达站点
			for(let each of neighbor) {
				// each 为 station 周围的某个站点
				if(hasReached.has(each)) {
					//如果 each 这个站点已经确定了路径长度则退出
					continue;
				}

				flag = true;
				if(distance[station] + 1 < distance[each]) {
					// 从 station 出发到达 each 的距离小于先前到达 each 的距离
					distance[each] = distance[station] + 1;
				}
			} 
		} // 此时新一轮的扩展结束, 距离已经更新

		if(flag === false && !hasReached.has(B)) { // 如果前一轮更新的时候没有扩展出任何新结点, 且最终未到达 B, 则不可达
			throw new Error(A + ' 与 ' + B + ' 没有通路!');
		}

		let nearstStation;
		let nearstDistance = INF;
		for(let station of notReached) { // 找出当前未确定距离的站点中, 距离值最小的一个站点
			if(distance[station] < nearstDistance) {
				nearstStation = station;
			}
		} 

		let foundStation = new Array();
		for(let station of notReached) { // 找出当前所有未确定结点中, 距离值最小的所有结点
			if(distance[nearstStation] === distance[station]) {
				foundStation.push(station);
			}
		}
		for(let station of foundStation) {
			notReached.delete(station);
			hasReached.add(station);
		}
	}

	return distance;
 };

/**
 * findRoute 方法: 根据 dijkstra 算法得到的最短单源路径, 得到所有可能的路线
 * @param {string} A
 * @param {Object} distance
 * @return {Array}
 */
Metro.prototype.findRoute = function(B, distance) {
	let lastDistance = distance[B];
	let finalRoutes = new Array();
	finalRoutes.push(new Array(B));

	while(lastDistance > 0){
		let routeList = new Array(); // 新建一个空的数组, 储存新的路线

		for(let eachRoute of finalRoutes) { // 从现在的路线集合中一次取出每一条可能路线
			let eachRouteLength = eachRoute.length;
			let lastSelected = eachRoute[eachRouteLength - 1]; // 这条线路的末站点
			let candidate = this.getNeighbor(lastSelected); // 末站点周围的站点
			
			for(let eachStation of candidate) {
				if(distance[eachStation] === lastDistance - 1) {
					let newRoute = eachRoute.slice(0); // 深拷贝一份路线
					newRoute.push(eachStation); // 在这个路线的末尾天上新的站点 eachStation
					routeList.push(newRoute);
				}
			}
		}
		finalRoutes = routeList;
		lastDistance--;
	}

	// 对路线进行翻转
	for(let eachRoute of finalRoutes) {
		eachRoute.reverse();
	}

	return finalRoutes;
};

/**
 * getTransfer 方法: 某一条路径中对应的换乘方案
 * @param {Array} route
 * @return {Array}: 元素也是数组, 数组最后一个元素为换乘次数, 其余为对应的乘坐线路
 */
Metro.prototype.getTransfer = function(route) {
	const stationAmount = route.length;
	if(stationAmount < 2) {
		throw new Error('线路中所含站点小于 2 个!');
	}

	let start, end; // 表示路线中相邻的两个站点
	let startIndex, endIndex;
	let lines; //start end 间的地铁连线, set 类型
	let oldList = new Array(); 
	let newList = new Array();
	/**
	 * 以上两个 List 为换乘方式记录表, 元素为一个数组
	 * 数组中末元素为换成次数, 其余元素为对应站间乘坐的线路
	 */

	/**
	 * 考虑使用贪心算法, 一直乘坐同一条线路直到必须换乘为止
	 * (即尽可能保证当前走过的路程中换乘少)
	 */

	start = route[0];
	end = route[1];
	startIndex = this.getStationIndex(start);
	endIndex = this.getStationIndex(end);
	lines = this._matrix[startIndex - 1][endIndex - 1];
	for(let eachLine of lines) {
		let item = new Array();
		item.push(eachLine);
		item.push(0); // 换成次数为 0
		oldList.push(item);
	}

	for(let i = 1; i < stationAmount - 1; i++) {
		start = route[i];
		end = route[i + 1];
		startIndex = this.getStationIndex(start);
		endIndex = this.getStationIndex(end);
		lines = this._matrix[startIndex - 1][endIndex - 1];

		for(let eachTransfer of oldList) {
			let lastLine = eachTransfer[eachTransfer.length - 2];
			if(lines.has(lastLine)) { 
				// 当前乘坐的路线仍可以在这一站得到延续, 不换乘
				let eachTransferCopy = eachTransfer.slice(0);

				let transferTimes = eachTransferCopy.pop();
				eachTransferCopy.push(lastLine);
				eachTransferCopy.push(transferTimes); // 添加换乘次数

				newList.push(eachTransferCopy);
			} else {
				// 当前乘坐的路线在这一站不能延续, 必须换乘
				for(let eachLine of lines) {
					let eachTransferCopy = eachTransfer.slice(0);

					let transferTimes = eachTransferCopy.pop();
					eachTransferCopy.push(eachLine);
					eachTransferCopy.push(transferTimes + 1); // 添加换乘次数

					newList.push(eachTransferCopy);
				}
			}
		}

		oldList = newList;
		newList = new Array();
	} // 此时 oldList 记录了贪心法得到的所有换成方案

	let minTransferTime = INF;
	const plans = new Array(); 
	for(let eachPlan of oldList) {
		if(eachPlan[stationAmount - 1] < minTransferTime) {
			minTransferTime = eachPlan[stationAmount - 1];
		}
	}
	for(let eachPlan of oldList) {
		if(eachPlan[stationAmount - 1] === minTransferTime) {
			plans.push(eachPlan);
		}
	}
	
	return plans;
};

/**
 * search 方法: 查询 A 到 B 的路线
 使用 Dijkstra 算法!
 * @param {string} A
 * @param {string} B
 * @return {Object}
 */
Metro.prototype.search = function(A, B) {
	const distance = this.dijkstra(A, B);
	const routes = this.findRoute(B, distance);	

	const transferPlans = new Array();
	for(let eachRoute of routes) {
		transferPlans.push(this.getTransfer(eachRoute));
	}

	const routeAmount = routes.length;
	const stationPassedAmount = routes[0].length;
	const finalRoutes = new Array();
	const finalTransferPlans = new Array();
	let minTransferTime = INF;
	for(let i = 0; i < routeAmount; i++) {
		if(transferPlans[i][0][stationPassedAmount - 1] < minTransferTime) {
			minTransferTime = transferPlans[i][0][stationPassedAmount - 1];
		}
	}
	for(let i = 0; i < routeAmount; i++) {
		if(transferPlans[i][0][stationPassedAmount - 1] === minTransferTime) {
			finalRoutes.push(routes[i]);
			finalTransferPlans.push(transferPlans[i]);
		}
	}
	// console.log(finalRoutes);
	// console.log(finalTransferPlans);

	return {
		routes: finalRoutes,
		plans: finalTransferPlans
	};
};

/**
 * getAll 方法: 查询某路线的所有站点
 * @param {int} num
 * @return {Array}
 */
Metro.prototype.getAll = function(num) {
	if(num > this._lines.length) {
		throw new Error('没有线路 ' + num + ' !');
	}
	return this._lines[num - 1].getAll();
};

Metro.prototype.getConnection = function(A, B) {
	const indexA = this.getStationIndex(A);
	const indexB = this.getStationIndex(B);
	return this._matrix[indexA - 1][indexB - 1];
};	

// example
// const m = new Metro();
// m.addLine(1);
// m.addLine(2);
// m.addLine(3);
// m.addLine(4);
// m.addLine(5);
// for(let i = 97; i <= 112; i++) {
// 	m.addStation(String.fromCharCode(i));
// }

// m.addConnection(1, 'a', 'b');
// m.addConnection(1, 'b', 'c');
// m.addConnection(1, 'c', 'd');
// m.addConnection(1, 'd', 'e');
// m.addConnection(1, 'e', 'f');

// m.addConnection(2, 'j', 'b');
// m.addConnection(2, 'b', 'g');
// m.addConnection(2, 'g', 'h');
// m.addConnection(2, 'h', 'i');

// m.addConnection(3, 'i', 'd');
// m.addConnection(3, 'd', 'k');
// m.addConnection(3, 'k', 'o');
// m.addConnection(3, 'o', 'n');

// m.addConnection(4, 'p', 'j');
// m.addConnection(4, 'j', 'l');
// m.addConnection(4, 'l', 'k');
// m.addConnection(4, 'k', 'm');
// m.addConnection(4, 'm', 'n');

// m.addConnection(5, 'b', 'c');
// m.addConnection(5, 'c', 'd');
// m.addConnection(5, 'd', 'k');
// m.addConnection(5, 'k', 'm');
// m.addConnection(5, 'm', 'n');


// const result = m.search('a', 'n');
// console.log(result.routes);
// console.log(result.plans);

module.exports = Metro;