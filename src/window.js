'use strict';

// Requires
const { BrowserWindow, Menu } = require('electron');

const defaultProperties =
{
    width: 800,
    height: 600,
    show: false,
    webPreferences: { nodeIntegration: true }
};

// Create default menu template
const defaultMenuTemplate =
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

class Window extends BrowserWindow
{
    constructor({properties=defaultProperties, menuTemplate=defaultMenuTemplate, file, ...windowSettings})
    {
        // Call BrowserWindow constructor
        super({...properties, ...windowSettings});
        
        // Load the html file into this window
        this.loadFile(file);

        // When the window is ready to show...
        this.once('ready-to-show', () =>
        {
            //#region Build Main Menu

            // Add empty object at the start of the menu to work with MacOS
            if(process.platform == 'darwin')
            { 
                menuTemplate.unshift({});
            }

            // Enable developer tools in the menu if it isn't a production build
            if(process.env.NODE_ENV !== 'production')
            {
                menuTemplate.push
                ({
                    label: 'Developer Tools',
                    submenu:
                    [
                        {
                            label: 'Toggle DevTools',
                            accelerator: 'CmdOrCtrl+I',
                            click(item, focusedWindow)
                            {
                                focusedWindow.toggleDevTools();
                            }
                        },
                        {
                            role: 'reload'
                        }
                    ]
                });
            }
            
            // Set menu for the window
            Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));
            
            //#endregion

            // Show this window
            this.show();
        })
    }
}

module.exports = Window;