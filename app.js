const electron = require('electron');
const ipcMain = electron.ipcMain;
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
let mainWindow = null;

const createMainWindow = function() {
	mainWindow = new BrowserWindow({
		width: 1600,//1200,
		height: 900,
		resizable: false,
		//maximizable: false,
		fullscreen: false,
		useContentSize: true,
		titleBarStyle: 'hiddenInset',
		backgroundColor: '#292B31'
	});

	//加载应用的界面文件
	mainWindow.loadURL(`file://${__dirname}/Canvas.html`);
	//console.log(`file://${__dirname}/index.html`);

	//打开开发者工具，方便调试
	//mainWindow.webContents.openDevTools();

	mainWindow.on('close', (event) => {
		isRegularClose = false;
		app.exit();
	});

	mainWindow.on('closed', function(event) {
		//event.preventDefault()
		mainWindow = null;
		// app.exit();
		//controlWindow = null;
	});

	// mainWindow.on('close', function(event) {
	// 	mainWindow = null;
	// });

	//mainWindow.setSize(800, 800);
};

const createWindow = function() {
	createMainWindow();
	// createControlWindow();
};

app.on('ready', createWindow);

app.on('window-all-closed', function() {
	app.exit();
});

app.on('activate', function() {
	if (mainWindow === null) {
		createWindow();
	}
});

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';


ipcMain.on('add-station', (event) => {
	//console.log('add-station');
	mainWindow.webContents.send('add-station');
});
ipcMain.on('rename-station', (event) => {
	//console.log('rename-station');
	mainWindow.webContents.send('rename-station');
});
ipcMain.on('adjust-line', (event) => {
	//console.log('adjust-line');
	mainWindow.webContents.send('adjust-line');
});
ipcMain.on('initialize', (event) => {
	//console.log('initialize');
	mainWindow.webContents.send('initialize');
});
ipcMain.on('search-route', (event) => {
	//console.log('search-route');
	mainWindow.webContents.send('search-route');
});
ipcMain.on('clear', (event) => {
	//console.log('clear');
	mainWindow.webContents.send('clear');
});

ipcMain.on('search-finished', (event, arg) => {
	mainWindow.webContents.send('show-plan', arg);
});