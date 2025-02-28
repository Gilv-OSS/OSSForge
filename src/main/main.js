const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Docker = require('dockerode');
const simpleGit = require('simple-git');
const Store = require('electron-store');

// Initialize configuration store
const store = new Store();

// Initialize Docker client
const docker = new Docker();

// Keep a global reference of the window object to prevent garbage collection
let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../../assets/icon.png')
  });

  // Load the index.html of the app
  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  // Open DevTools in development mode
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  // Emitted when the window is closed
  mainWindow.on('closed', () => {
    // Dereference the window object
    mainWindow = null;
  });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open
    if (mainWindow === null) createWindow();
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Docker container management
ipcMain.handle('docker:list-containers', async () => {
  try {
    const containers = await docker.listContainers({ all: true });
    return containers;
  } catch (error) {
    console.error('Error listing Docker containers:', error);
    throw error;
  }
});

ipcMain.handle('docker:create-container', async (event, options) => {
  try {
    const container = await docker.createContainer(options);
    return container.id;
  } catch (error) {
    console.error('Error creating Docker container:', error);
    throw error;
  }
});

ipcMain.handle('docker:start-container', async (event, containerId) => {
  try {
    const container = docker.getContainer(containerId);
    await container.start();
    return true;
  } catch (error) {
    console.error('Error starting Docker container:', error);
    throw error;
  }
});

// Git operations
ipcMain.handle('git:clone', async (event, { repoUrl, localPath }) => {
  try {
    await simpleGit().clone(repoUrl, localPath);
    return true;
  } catch (error) {
    console.error('Error cloning Git repository:', error);
    throw error;
  }
});

ipcMain.handle('git:commit', async (event, { repoPath, message }) => {
  try {
    const git = simpleGit(repoPath);
    await git.add('./*');
    const result = await git.commit(message);
    return result;
  } catch (error) {
    console.error('Error committing changes:', error);
    throw error;
  }
});

// Agent system communication
ipcMain.handle('agent:execute', async (event, { agentType, task }) => {
  try {
    // This would connect to the agent system
    // For now, we'll just return a mock response
    return {
      success: true,
      result: `Executed ${agentType} agent with task: ${task}`,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error(`Error executing ${agentType} agent:`, error);
    throw error;
  }
});