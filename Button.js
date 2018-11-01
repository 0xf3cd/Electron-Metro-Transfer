const anime = require('animejs');
const ipcRenderer = require('electron').ipcRenderer;

// 以下是 DOM 对象
const addStation = document.getElementById('add-station');
const renameStation = document.getElementById('rename-station');
const adjustLine = document.getElementById('adjust-line');
const initialize = document.getElementById('initialize');
const searchRoute = document.getElementById('search-route');
const clear = document.getElementById('clear');

addStation.addEventListener('click', (event) => {
	ipcRenderer.send('add-station');
}, false);

renameStation.addEventListener('click', (event) => {
	ipcRenderer.send('rename-station');
}, false);

adjustLine.addEventListener('click', (event) => {
	ipcRenderer.send('adjust-line');
}, false);

initialize.addEventListener('click', (event) => {
	ipcRenderer.send('initialize');
}, false);

searchRoute.addEventListener('click', (event) => {
	ipcRenderer.send('search-route');
}, false);

clear.addEventListener('click', (event) => {
	ipcRenderer.send('clear');
}, false);

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

addStation.addEventListener('mouseenter', mouseEnter, false);
addStation.addEventListener('mouseleave', mouseLeave, false);
renameStation.addEventListener('mouseenter', mouseEnter, false);
renameStation.addEventListener('mouseleave', mouseLeave, false);
adjustLine.addEventListener('mouseenter', mouseEnter, false);
adjustLine.addEventListener('mouseleave', mouseLeave, false);
initialize.addEventListener('mouseenter', mouseEnter, false);
initialize.addEventListener('mouseleave', mouseLeave, false);
searchRoute.addEventListener('mouseenter', mouseEnter, false);
searchRoute.addEventListener('mouseleave', mouseLeave, false);
clear.addEventListener('mouseenter', mouseEnter, false);
clear.addEventListener('mouseleave', mouseLeave, false);