'use strict';

// Requires
const path = require('path');
const { app } = require('electron');
const Window = require('./js/window');

// Window Objects
let mainWindow = null;

function main()
{
    mainWindow = createWindow();
}

function createWindow()
{
    const windowProperties =
    {
        width: 1260,
        height: 700,
        show: false,
        resizable: false,
        webPreferences: { nodeIntegration: true }
    };

    const menuTemplate =
    [
        {
            label: 'File',
            submenu:
            [
                {
                    label: 'Quit',
                    accelerator: 'CmdOrCtrl+Q',
                    click()
                    {
                        app.quit();
                    }
                }
            ]
        }
    ];

    return new Window
    ({
        properties: windowProperties,
        menuTemplate: menuTemplate,
        file: path.join(__dirname, 'index.html')
    });
}

if(!app.requestSingleInstanceLock()) app.quit();

app.on('ready', main);

app.on('window-all-closed', () =>
{ 
    if(process.platform !== 'darwin') app.quit();
});

app.on('activate', () =>
{
    if(Window.getAllWindows().length === 0) mainWindow = createWindow();
});