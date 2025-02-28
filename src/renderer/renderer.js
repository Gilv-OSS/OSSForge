// Import required modules
const monaco = require('monaco-editor');
const { Terminal } = require('xterm');

// DOM Elements
const navLinks = document.querySelectorAll('.main-nav a');
const views = document.querySelectorAll('.view');
const fileTree = document.getElementById('file-tree');
const agentActions = document.querySelectorAll('.agent-action');
const executeAgentTaskBtn = document.getElementById('execute-agent-task');
const agentTaskInput = document.getElementById('agent-task-input');
const agentTaskResult = document.getElementById('agent-task-result');
const refreshContainersBtn = document.getElementById('refresh-containers');
const createContainerBtn = document.getElementById('create-container');
const containerCreateForm = document.getElementById('container-create-form');
const cancelCreateBtn = document.getElementById('cancel-create');
const createContainerForm = document.getElementById('create-container-form');
const containersBody = document.getElementById('containers-body');
const githubSearchBtn = document.getElementById('github-search-button');
const githubSearchInput = document.getElementById('github-search-input');
const githubResults = document.getElementById('github-results');
const cloneRepoBtn = document.getElementById('clone-repo');
const settingsForm = document.getElementById('settings-form');

// Initialize Monaco Editor
let editor;
if (document.getElementById('editor')) {
    editor = monaco.editor.create(document.getElementById('editor'), {
        value: '// Welcome to OSSForge IDE\n// Start coding or open a file',
        language: 'javascript',
        theme: 'vs-dark',
        automaticLayout: true
    });
}

// Initialize Terminal
let terminal;
if (document.getElementById('terminal')) {
    terminal = new Terminal({
        cursorBlink: true,
        cursorStyle: 'block',
        fontSize: 14,
        fontFamily: 'Menlo, Monaco, "Courier New", monospace',
        theme: {
            background: '#1e1e1e',
            foreground: '#f0f0f0'
        }
    });
    terminal.open(document.getElementById('terminal'));
    terminal.writeln('OSSForge Terminal v0.1.0');
    terminal.writeln('Type "help" for available commands');
    terminal.writeln('');
    
    // Handle terminal input
    let command = '';
    terminal.onKey(({ key, domEvent }) => {
        const printable = !domEvent.altKey && !domEvent.ctrlKey && !domEvent.metaKey;
        
        if (domEvent.keyCode === 13) { // Enter key
            terminal.writeln('');
            if (command === 'help') {
                terminal.writeln('Available commands:');
                terminal.writeln('  help - Show this help message');
                terminal.writeln('  clear - Clear the terminal');
                terminal.writeln('  docker - List Docker containers');
                terminal.writeln('  git - Show Git commands');
                terminal.writeln('  agent <type> <task> - Execute an agent task');
            } else if (command === 'clear') {
                terminal.clear();
            } else if (command === 'docker') {
                terminal.writeln('Fetching Docker containers...');
                window.api.docker.listContainers()
                    .then(containers => {
                        if (containers.length === 0) {
                            terminal.writeln('No containers found');
                        } else {
                            terminal.writeln('CONTAINER ID\tNAME\t\tSTATUS');
                            containers.forEach(container => {
                                terminal.writeln(`${container.Id.substring(0, 12)}\t${container.Names[0]}\t${container.Status}`);
                            });
                        }
                    })
                    .catch(err => {
                        terminal.writeln(`Error: ${err.message}`);
                    });
            } else if (command === 'git') {
                terminal.writeln('Git commands:');
                terminal.writeln('  git clone <url> <path> - Clone a repository');
                terminal.writeln('  git commit <path> <message> - Commit changes');
                terminal.writeln('  git push <path> - Push changes');
                terminal.writeln('  git pull <path> - Pull changes');
            } else if (command.startsWith('agent ')) {
                const parts = command.split(' ');
                if (parts.length >= 3) {
                    const agentType = parts[1];
                    const task = parts.slice(2).join(' ');
                    terminal.writeln(`Executing ${agentType} agent with task: ${task}`);
                    window.api.agent.execute(agentType, task)
                        .then(result => {
                            terminal.writeln(`Result: ${result.result}`);
                        })
                        .catch(err => {
                            terminal.writeln(`Error: ${err.message}`);
                        });
                } else {
                    terminal.writeln('Usage: agent <type> <task>');
                }
            } else if (command) {
                terminal.writeln(`Command not found: ${command}`);
            }
            command = '';
        } else if (domEvent.keyCode === 8) { // Backspace
            if (command.length > 0) {
                command = command.substring(0, command.length - 1);
                terminal.write('\b \b');
            }
        } else if (printable) {
            command += key;
            terminal.write(key);
        }
    });
}

// Navigation
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const viewId = link.getAttribute('data-view');
        
        // Update active link
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        // Show selected view
        views.forEach(view => {
            view.classList.remove('active');
            if (view.id === `${viewId}-view`) {
                view.classList.add('active');
            }
        });
    });
});

// File Explorer
function loadFileTree() {
    // This would be populated with actual file data
    const demoFiles = [
        { name: 'project', type: 'folder', children: [
            { name: 'index.html', type: 'file' },
            { name: 'styles.css', type: 'file' },
            { name: 'app.js', type: 'file' },
            { name: 'assets', type: 'folder', children: [
                { name: 'logo.png', type: 'file' },
                { name: 'background.jpg', type: 'file' }
            ]}
        ]},
        { name: 'README.md', type: 'file' },
        { name: 'package.json', type: 'file' }
    ];
    
    fileTree.innerHTML = '';
    renderFileTree(demoFiles, fileTree);
}

function renderFileTree(files, container) {
    const ul = document.createElement('ul');
    ul.className = 'file-tree-list';
    
    files.forEach(file => {
        const li = document.createElement('li');
        li.className = `file-tree-item ${file.type}`;
        li.innerHTML = `<span class="file-name">${file.name}</span>`;
        
        if (file.type === 'folder' && file.children) {
            li.classList.add('expanded');
            renderFileTree(file.children, li);
        } else if (file.type === 'file') {
            li.addEventListener('click', () => {
                // This would load the actual file content
                editor.setValue(`// Content of ${file.name}\n// This is a demo file`);
                
                // Set language based on file extension
                const ext = file.name.split('.').pop();
                switch (ext) {
                    case 'js':
                        monaco.editor.setModelLanguage(editor.getModel(), 'javascript');
                        break;
                    case 'html':
                        monaco.editor.setModelLanguage(editor.getModel(), 'html');
                        break;
                    case 'css':
                        monaco.editor.setModelLanguage(editor.getModel(), 'css');
                        break;
                    case 'md':
                        monaco.editor.setModelLanguage(editor.getModel(), 'markdown');
                        break;
                    case 'json':
                        monaco.editor.setModelLanguage(editor.getModel(), 'json');
                        break;
                    default:
                        monaco.editor.setModelLanguage(editor.getModel(), 'plaintext');
                }
            });
        }
        
        ul.appendChild(li);
    });
    
    container.appendChild(ul);
}

// Load demo file tree
if (fileTree) {
    loadFileTree();
}

// Agent Actions
if (agentActions) {
    agentActions.forEach(button => {
        button.addEventListener('click', () => {
            const agentType = button.getAttribute('data-agent');
            agentTaskInput.placeholder = `Describe the task for the ${agentType} agent...`;
            agentTaskInput.focus();
        });
    });
}

// Execute Agent Task
if (executeAgentTaskBtn) {
    executeAgentTaskBtn.addEventListener('click', () => {
        const task = agentTaskInput.value.trim();
        if (!task) {
            agentTaskResult.textContent = 'Please enter a task description';
            return;
        }
        
        const activeAgent = document.querySelector('.agent-action.active');
        const agentType = activeAgent ? activeAgent.getAttribute('data-agent') : 'development';
        
        agentTaskResult.textContent = 'Executing task...';
        
        window.api.agent.execute(agentType, task)
            .then(result => {
                agentTaskResult.innerHTML = `<pre>${result.result}</pre>`;
            })
            .catch(err => {
                agentTaskResult.textContent = `Error: ${err.message}`;
            });
    });
}

// Docker Container Management
function loadContainers() {
    if (!containersBody) return;
    
    containersBody.innerHTML = '<tr><td colspan="5">Loading containers...</td></tr>';
    
    window.api.docker.listContainers()
        .then(containers => {
            containersBody.innerHTML = '';
            
            if (containers.length === 0) {
                containersBody.innerHTML = '<tr><td colspan="5">No containers found</td></tr>';
                return;
            }
            
            containers.forEach(container => {
                const row = document.createElement('tr');
                
                row.innerHTML = `
                    <td>${container.Id.substring(0, 12)}</td>
                    <td>${container.Names[0].replace(/^\//, '')}</td>
                    <td>${container.Image}</td>
                    <td>${container.Status}</td>
                    <td>
                        <button class="container-action start" data-id="${container.Id}">Start</button>
                        <button class="container-action stop" data-id="${container.Id}">Stop</button>
                        <button class="container-action remove" data-id="${container.Id}">Remove</button>
                    </td>
                `;
                
                containersBody.appendChild(row);
            });
            
            // Add event listeners to container action buttons
            document.querySelectorAll('.container-action').forEach(button => {
                button.addEventListener('click', () => {
                    const containerId = button.getAttribute('data-id');
                    const action = button.classList.contains('start') ? 'start' :
                                  button.classList.contains('stop') ? 'stop' : 'remove';
                    
                    if (action === 'start') {
                        window.api.docker.startContainer(containerId)
                            .then(() => loadContainers())
                            .catch(err => alert(`Error starting container: ${err.message}`));
                    } else if (action === 'stop') {
                        window.api.docker.stopContainer(containerId)
                            .then(() => loadContainers())
                            .catch(err => alert(`Error stopping container: ${err.message}`));
                    } else if (action === 'remove') {
                        if (confirm('Are you sure you want to remove this container?')) {
                            window.api.docker.removeContainer(containerId)
                                .then(() => loadContainers())
                                .catch(err => alert(`Error removing container: ${err.message}`));
                        }
                    }
                });
            });
        })
        .catch(err => {
            containersBody.innerHTML = `<tr><td colspan="5">Error: ${err.message}</td></tr>`;
        });
}

// Refresh containers
if (refreshContainersBtn) {
    refreshContainersBtn.addEventListener('click', loadContainers);
    // Load containers on initial page load
    loadContainers();
}

// Create container modal
if (createContainerBtn) {
    createContainerBtn.addEventListener('click', () => {
        containerCreateForm.style.display = 'flex';
    });
}

if (cancelCreateBtn) {
    cancelCreateBtn.addEventListener('click', () => {
        containerCreateForm.style.display = 'none';
    });
}

if (createContainerForm) {
    createContainerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('container-name').value;
        const image = document.getElementById('container-image').value;
        const ports = document.getElementById('container-ports').value;
        const volumes = document.getElementById('container-volumes').value;
        
        const options = {
            Image: image,
            name: name,
            HostConfig: {}
        };
        
        if (ports) {
            const portMappings = {};
            ports.split(',').forEach(mapping => {
                const [hostPort, containerPort] = mapping.trim().split(':');
                portMappings[`${containerPort}/tcp`] = [{ HostPort: hostPort }];
            });
            options.HostConfig.PortBindings = portMappings;
        }
        
        if (volumes) {
            const volumeMappings = [];
            volumes.split(',').forEach(mapping => {
                const [hostPath, containerPath] = mapping.trim().split(':');
                volumeMappings.push(`${hostPath}:${containerPath}`);
            });
            options.HostConfig.Binds = volumeMappings;
        }
        
        window.api.docker.createContainer(options)
            .then(() => {
                containerCreateForm.style.display = 'none';
                loadContainers();
                createContainerForm.reset();
            })
            .catch(err => {
                alert(`Error creating container: ${err.message}`);
            });
    });
}

// GitHub Search
if (githubSearchBtn) {
    githubSearchBtn.addEventListener('click', () => {
        const query = githubSearchInput.value.trim();
        if (!query) return;
        
        githubResults.innerHTML = '<p>Searching GitHub repositories...</p>';
        
        // This would use the GitHub API
        // For now, we'll just show a demo result
        setTimeout(() => {
            githubResults.innerHTML = `
                <div class="repo-card">
                    <h3>example/repo</h3>
                    <p>Example repository description</p>
                    <div class="repo-stats">
                        <span>⭐ 123</span>
                        <span>🍴 45</span>
                    </div>
                    <a href="#" class="repo-link">View on GitHub</a>
                </div>
                <div class="repo-card">
                    <h3>another/repo</h3>
                    <p>Another repository description</p>
                    <div class="repo-stats">
                        <span>⭐ 456</span>
                        <span>🍴 78</span>
                    </div>
                    <a href="#" class="repo-link">View on GitHub</a>
                </div>
            `;
        }, 1000);
    });
}

// Clone Repository
if (cloneRepoBtn) {
    cloneRepoBtn.addEventListener('click', () => {
        const repoUrl = document.getElementById('repo-url').value.trim();
        const localPath = document.getElementById('local-path').value.trim();
        
        if (!repoUrl || !localPath) {
            alert('Please enter both repository URL and local path');
            return;
        }
        
        cloneRepoBtn.disabled = true;
        cloneRepoBtn.textContent = 'Cloning...';
        
        window.api.git.clone(repoUrl, localPath)
            .then(() => {
                alert(`Repository cloned successfully to ${localPath}`);
                cloneRepoBtn.disabled = false;
                cloneRepoBtn.textContent = 'Clone';
            })
            .catch(err => {
                alert(`Error cloning repository: ${err.message}`);
                cloneRepoBtn.disabled = false;
                cloneRepoBtn.textContent = 'Clone';
            });
    });
}

// Settings
if (settingsForm) {
    // Load saved settings
    const savedSettings = {
        projectsDirectory: localStorage.getItem('projectsDirectory') || '',
        theme: localStorage.getItem('theme') || 'dark',
        dockerHost: localStorage.getItem('dockerHost') || '',
        githubToken: localStorage.getItem('githubToken') || '',
        neluaPath: localStorage.getItem('neluaPath') || ''
    };
    
    document.getElementById('projects-directory').value = savedSettings.projectsDirectory;
    document.getElementById('theme').value = savedSettings.theme;
    document.getElementById('docker-host').value = savedSettings.dockerHost;
    document.getElementById('github-token').value = savedSettings.githubToken;
    document.getElementById('nelua-path').value = savedSettings.neluaPath;
    
    // Save settings
    settingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const settings = {
            projectsDirectory: document.getElementById('projects-directory').value,
            theme: document.getElementById('theme').value,
            dockerHost: document.getElementById('docker-host').value,
            githubToken: document.getElementById('github-token').value,
            neluaPath: document.getElementById('nelua-path').value
        };
        
        // Save settings to localStorage
        Object.entries(settings).forEach(([key, value]) => {
            localStorage.setItem(key, value);
        });
        
        alert('Settings saved successfully');
    });
}