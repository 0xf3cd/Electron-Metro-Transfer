/**
 * getRandomInt 函数说明: 获取 [start, end) 之间的一个随机整数
 * @param {int=} start: 默认为 0
 * @param {int=} end: 默认为 100
 * @return {int}: 一个介于 [start, end) 范围内的整数
 */
const getRandomInt = function(start, end) {
	start = start || 0;
	end = end || 100;

	if(start < end) {
		start = 0;
		end = 100;
	}

    return Math.floor(Math.random() * (end - start) + start);
};

/**
 * isNumeric 函数说明: 判断 input 是否为一个数
 * @param {*} input
 * @return {bool}: true 表示 input 为一个数, 否则不是
 */
const isNumeric = function(input) {
	if(typeof(input) === 'number') {
		return true;
	} else {
		return false;
	}
};

/**
 * isInteger 函数说明: 判断 input 是否为一个整数
 * @param {*} input
 * @return {bool}: true 表示 input 为一个整数, 否则不是
 */
const isInteger = function(input) {
	if(isNumeric(input) === true) {
		if(Math.floor(input) === input) {
			return true;
		} else {
			return false;
		}
	} else {
		return false;
	}
};

/**
 * isArray 函数说明: 判断 input 是否为一个数组
 * @param {*} input
 * @return {bool}: true 表示 input 为一个数组, 否则不是
 */
const isArray = function(input) {
	if(Object.prototype.toString.call(input) === '[object Array]') {
		return true;
	} else {
		return false;
	}
};

/**
 * isBoolean 函数说明: 判断 input 是否为一个布尔值
 * @param {*} input
 * @return {bool}: true 表示 input 为一个布尔值, 否则不是
 */
const isBoolean = function(input) {
	if(typeof(input) === 'boolean') {
		return true;
	} else {
		return false;
	}
};

/**
 * isString 函数说明: 判断 input 是否为一个字符串
 * @param {*} input
 * @return {bool}: true 表示 input 为一个字符串, 否则不是
 */
const isString = function(input) {
	if(typeof(input) === 'string') {
		return true;
	} else {
		return false;
	}
};

/**
 * isHexNumber 函数说明: 判断 input 是否为一个合法十六进制数
 * @param {*} input
 * @return {bool}: true 表示 input 为一个字符串, 否则不是
 */
const isHexNumber = function(input) {
	if(!isString(input)) {
		return false;
	}
	if(input.length !== 1) {
		return false;
	}

	if(input >= '0' && input <= '9') {
		return true;
	} else if(input >= 'a' && input <= 'f') {
		return true;
	} else if(input >= 'A' && input <= 'F') {
		return true;
	} else {
		return false;
	}
};

/**
 * isRGB 函数说明: 判断 input 是否为一个形如 '#FFBB24' 的字符串
 * @param {*} input
 * @return {bool}: true 表示 input 为一个 RGB 值, 否则不是
 */
const isRGB = function(input) {
	if(typeof(input) !== 'string') {
		return false;
	}
	if(input.length !== 7) {
		return false;
	}
	if(input[0] !== '#') {
		return false;
	}

	for(let i = 1; i <= 6; i++) {
		if(!isHexNumber(input[i])) {
			return false;
		}
	}
	return true;
};

/**
 * isValidLineDirection 函数说明: 判断 input 是否为一个合法的连线方向类型
 * @param {*} input
 * @return {bool}: true 表示 input 为一个合法的连线方向类型, 否则不是
 */
const isValidLineDirection = function(input) {
	if(input === 'dual' || input === 'single' || input === 'circularFinal') {
		return true;
	} else {
		return false;
	}
};

/**
 * deepCopy 函数说明: 进行深拷贝，将 oldObject 深拷贝至 newObject
 * @param {*} oldObject
 * @return {Object}: 一个值与 oldObject 相同的对象
 */
const deepCopy = function(oldObject) {
	if(typeof(oldObject) !== 'object') {
		return oldObject;
	}
	let newObject = new Object();
	for(let each in oldObject) {
		if(typeof(each) === 'object') {
			newObject[each] = deepCopy(oldObject[each]);
		} else {
			newObject[each] = oldObject[each];
		}
	}
	return newObject;
};

module.exports = {
	getRandomInt,
	isNumeric,
	isInteger,
	isArray,
	isBoolean,
	isString,
	isRGB,
	isHexNumber,
	isValidLineDirection,
	deepCopy
}