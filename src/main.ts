import { app, BrowserWindow, ipcMain } from 'electron';
import * as WebSocket from 'ws';

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

let connections = new Set<WebSocket.WebSocket>();

// Initialize WebSocket Server
function initializeWebSocketServer() {
    const wss = new WebSocket.Server({ port: 5000 });

    wss.on('connection', (ws) => {
        console.log('React Native client connected');
        connections.add(ws);

        ws.on('message', (message) => {
            try {
                const parsedMessage = JSON.parse(message.toString());
                console.log('Received from RN:', parsedMessage);

                ws.send(JSON.stringify({
                    type: "acknowledgment",
                    message: `Received: ${parsedMessage.type}`
                }));
            } catch (error) {
                console.log('Received raw message from RN:', message.toString());
            }
        });

        ws.on('close', () => {
            console.log('React Native client disconnected');
            connections.delete(ws);
        });

        ws.on('error', (error) => {
            console.error('WebSocket error:', error);
        });
    });
}

initializeWebSocketServer();

// Handle messages from renderer and broadcast to WebSocket clients
ipcMain.handle('send-message', async (_event, message: { type: string; data: string; }) => {
    try {
        if (connections.size > 0) {
            for (const client of connections) {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({
                        type: 'image',
                        data: message.data
                    }));
                }
            }
            return { success: true };
        } else {
            throw new Error('No WebSocket clients connected');
        }
    } catch (error) {
        console.error('Error processing message:', error);
        throw error;
    }
});

function createWindow() {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY
        },
    });

    // and load the index.html of the app.
    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

    // Open the DevTools.
    mainWindow.webContents.openDevTools();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(() => {
    createWindow();

    app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
}); 