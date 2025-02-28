const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'api', {
    // Docker operations
    docker: {
      listContainers: () => ipcRenderer.invoke('docker:list-containers'),
      createContainer: (options) => ipcRenderer.invoke('docker:create-container', options),
      startContainer: (containerId) => ipcRenderer.invoke('docker:start-container', containerId),
      stopContainer: (containerId) => ipcRenderer.invoke('docker:stop-container', containerId),
      removeContainer: (containerId) => ipcRenderer.invoke('docker:remove-container', containerId)
    },
    
    // Git operations
    git: {
      clone: (repoUrl, localPath) => ipcRenderer.invoke('git:clone', { repoUrl, localPath }),
      commit: (repoPath, message) => ipcRenderer.invoke('git:commit', { repoPath, message }),
      push: (repoPath) => ipcRenderer.invoke('git:push', { repoPath }),
      pull: (repoPath) => ipcRenderer.invoke('git:pull', { repoPath })
    },
    
    // Agent system
    agent: {
      execute: (agentType, task) => ipcRenderer.invoke('agent:execute', { agentType, task }),
      supervisorAgent: {
        coordinate: (agents, task) => ipcRenderer.invoke('agent:execute', { 
          agentType: 'supervisor', 
          task: { action: 'coordinate', agents, task } 
        })
      },
      developmentAgent: {
        writeCode: (language, task) => ipcRenderer.invoke('agent:execute', { 
          agentType: 'development', 
          task: { action: 'writeCode', language, task } 
        }),
        optimizeCode: (code, criteria) => ipcRenderer.invoke('agent:execute', { 
          agentType: 'development', 
          task: { action: 'optimizeCode', code, criteria } 
        })
      },
      gitAgent: {
        autoCommit: (repoPath, message) => ipcRenderer.invoke('agent:execute', { 
          agentType: 'git', 
          task: { action: 'autoCommit', repoPath, message } 
        })
      },
      searchAgent: {
        findProjects: (query) => ipcRenderer.invoke('agent:execute', { 
          agentType: 'search', 
          task: { action: 'findProjects', query } 
        }),
        analyzeSolution: (repoUrl) => ipcRenderer.invoke('agent:execute', { 
          agentType: 'search', 
          task: { action: 'analyzeSolution', repoUrl } 
        })
      },
      terminalAgent: {
        executeCommand: (command, containerName) => ipcRenderer.invoke('agent:execute', { 
          agentType: 'terminal', 
          task: { action: 'executeCommand', command, containerName } 
        })
      }
    },
    
    // File system operations
    fs: {
      readFile: (path) => ipcRenderer.invoke('fs:read-file', path),
      writeFile: (path, content) => ipcRenderer.invoke('fs:write-file', { path, content }),
      listFiles: (directory) => ipcRenderer.invoke('fs:list-files', directory),
      createDirectory: (path) => ipcRenderer.invoke('fs:create-directory', path)
    }
  }
);