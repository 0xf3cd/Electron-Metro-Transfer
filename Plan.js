const ipcRenderer = require('electron').ipcRenderer;
const textArea = document.getElementById('plan-text');
const clearButton = document.getElementById('plan-text-clear');
const helpButton = document.getElementById('help');
const anime = require('animejs');

const mouseEnter = function(event) {
	anime.remove(event.target);
	anime({
		targets: event.target,
		scale: {
		    value: 1.1,
		    duration: 100,
		    easing: 'easeOutQuart'//easeInOutQuad
		},
		opacity: [1, 0.7]
	});
};

const mouseLeave = function(event) {
	anime.remove(event.target);
	anime({
		targets: event.target,
		scale: {
		    value: 1,
		    duration: 100,
		    easing: 'easeOutQuart'
		},
		opacity: [0.7, 1]
	});
};

clearButton.addEventListener('mouseenter', mouseEnter, false);
clearButton.addEventListener('mouseleave', mouseLeave, false);
clearButton.addEventListener('click', (event) => {
	textArea.innerText = '';
});

helpButton.addEventListener('mouseenter', mouseEnter, false);
helpButton.addEventListener('mouseleave', mouseLeave, false);
helpButton.addEventListener('click', (event) => {
	let toShow = '';
	toShow += '本程序使用点击和输入框相结合的方式进行输入，通过文本输出框和提示框进行输出。\n';
	toShow += '可以点击窗体任意一处进行拖拽，移动窗口。\n';
	toShow += '所有站点都必须放置在锚点上。\n';
	toShow += '点击“初始化”按钮能够载入部分上海地铁网络。\n';
	toShow += '点击“清除按钮”将清空所有线路和站点。\n';
	toShow += '点击”新增站点“按钮，并根据提示点击锚点并输入站点名从而建立站点\n';
	toShow += '点击”站点更名“按钮，根据提示点击站点并输入姓名称。\n';
	toShow += '点击”调整线路“按钮，根据提示将站点通过地铁线路连接起来。\n';
	toShow += '点击”路线查询“按钮，根据提示点击起点和终点，并在文本输出框输出换乘路线。\n';
	textArea.innerText = toShow;
});

ipcRenderer.on('show-plan', (event, arg) => {
	let toShow = '';
	for(let item of arg) {
		toShow += item;
		toShow += '\n';
	}
	textArea.innerText = toShow;
});