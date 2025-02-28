/**
 * Terminal Agent
 * 
 * The Terminal Agent is responsible for executing commands and managing containers.
 * It can run shell commands, manage Docker containers, and automate terminal tasks.
 */

const { spawn } = require('child_process');
const Docker = require('dockerode');
const os = require('os');
const path = require('path');

class TerminalAgent {
    constructor(config = {}) {
        this.config = {
            shell: os.platform() === 'win32' ? 'powershell.exe' : 'bash',
            dockerHost: config.dockerHost || undefined,
            ...config
        };
        
        this.docker = new Docker(this.config.dockerHost ? { host: this.config.dockerHost } : undefined);
    }
    
    /**
     * Execute a shell command
     * @param {string} command - Command to execute
     * @param {object} options - Command options
     * @returns {Promise<object>} - Promise resolving to command result
     */
    async executeCommand(command, options = {}) {
        console.log(`Executing command: ${command}`);
        
        return new Promise((resolve, reject) => {
            const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
            const shellArgs = os.platform() === 'win32' ? ['-Command'] : ['-c'];
            
            const proc = spawn(shell, [...shellArgs, command], {
                cwd: options.cwd || process.cwd(),
                env: { ...process.env, ...options.env },
                shell: true
            });
            
            let stdout = '';
            let stderr = '';
            
            proc.stdout.on('data', (data) => {
                const output = data.toString();
                stdout += output;
                if (options.onOutput) {
                    options.onOutput(output);
                }
            });
            
            proc.stderr.on('data', (data) => {
                const output = data.toString();
                stderr += output;
                if (options.onError) {
                    options.onError(output);
                }
            });
            
            proc.on('close', (code) => {
                if (code === 0 || options.ignoreErrors) {
                    resolve({
                        success: code === 0,
                        command,
                        stdout,
                        stderr,
                        exitCode: code,
                        timestamp: new Date().toISOString()
                    });
                } else {
                    reject(new Error(`Command failed with exit code ${code}: ${stderr}`));
                }
            });
            
            proc.on('error', (error) => {
                reject(error);
            });
        });
    }
    
    /**
     * Execute a command in a Docker container
     * @param {string} command - Command to execute
     * @param {string} containerName - Name of the container
     * @param {object} options - Command options
     * @returns {Promise<object>} - Promise resolving to command result
     */
    async executeInContainer(command, containerName, options = {}) {
        console.log(`Executing command in container ${containerName}: ${command}`);
        
        try {
            const container = this.docker.getContainer(containerName);
            
            // Check if container exists and is running
            const containerInfo = await container.inspect();
            if (!containerInfo.State.Running) {
                throw new Error(`Container ${containerName} is not running`);
            }
            
            // Execute command in container
            const exec = await container.exec({
                Cmd: options.shell ? [options.shell, '-c', command] : ['sh', '-c', command],
                AttachStdout: true,
                AttachStderr: true
            });
            
            const stream = await exec.start();
            
            return new Promise((resolve, reject) => {
                let stdout = '';
                let stderr = '';
                
                stream.on('data', (chunk) => {
                    const output = chunk.toString();
                    stdout += output;
                    if (options.onOutput) {
                        options.onOutput(output);
                    }
                });
                
                stream.on('end', async () => {
                    const execInfo = await exec.inspect();
                    
                    resolve({
                        success: execInfo.ExitCode === 0,
                        command,
                        containerName,
                        stdout,
                        stderr,
                        exitCode: execInfo.ExitCode,
                        timestamp: new Date().toISOString()
                    });
                });
                
                stream.on('error', (error) => {
                    reject(error);
                });
            });
        } catch (error) {
            console.error('Error executing command in container:', error);
            throw error;
        }
    }
    
    /**
     * List Docker containers
     * @param {object} options - List options
     * @returns {Promise<object>} - Promise resolving to container list
     */
    async listContainers(options = {}) {
        console.log('Listing Docker containers');
        
        try {
            const containers = await this.docker.listContainers({ all: true, ...options });
            
            return {
                success: true,
                containers: containers.map(container => ({
                    id: container.Id,
                    name: container.Names[0].replace(/^\//, ''),
                    image: container.Image,
                    status: container.Status,
                    state: container.State,
                    created: container.Created
                })),
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error listing containers:', error);
            throw error;
        }
    }
    
    /**
     * Create a Docker container
     * @param {object} options - Container options
     * @returns {Promise<object>} - Promise resolving to container creation result
     */
    async createContainer(options) {
        console.log(`Creating Docker container with image ${options.Image}`);
        
        try {
            const container = await this.docker.createContainer(options);
            const containerInfo = await container.inspect();
            
            return {
                success: true,
                containerId: containerInfo.Id,
                name: containerInfo.Name.replace(/^\//, ''),
                image: containerInfo.Config.Image,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error creating container:', error);
            throw error;
        }
    }
    
    /**
     * Start a Docker container
     * @param {string} containerId - ID of the container to start
     * @returns {Promise<object>} - Promise resolving to container start result
     */
    async startContainer(containerId) {
        console.log(`Starting Docker container ${containerId}`);
        
        try {
            const container = this.docker.getContainer(containerId);
            await container.start();
            const containerInfo = await container.inspect();
            
            return {
                success: true,
                containerId,
                name: containerInfo.Name.replace(/^\//, ''),
                state: containerInfo.State,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error starting container:', error);
            throw error;
        }
    }
    
    /**
     * Stop a Docker container
     * @param {string} containerId - ID of the container to stop
     * @returns {Promise<object>} - Promise resolving to container stop result
     */
    async stopContainer(containerId) {
        console.log(`Stopping Docker container ${containerId}`);
        
        try {
            const container = this.docker.getContainer(containerId);
            await container.stop();
            const containerInfo = await container.inspect();
            
            return {
                success: true,
                containerId,
                name: containerInfo.Name.replace(/^\//, ''),
                state: containerInfo.State,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error stopping container:', error);
            throw error;
        }
    }
    
    /**
     * Execute a general task
     * @param {object} task - Task to execute
     * @returns {Promise<object>} - Promise resolving to the task result
     */
    async execute(task) {
        console.log('Terminal agent executing task:', task);
        
        if (task.action === 'executeCommand') {
            if (task.containerName) {
                return await this.executeInContainer(task.command, task.containerName, task.options);
            } else {
                return await this.executeCommand(task.command, task.options);
            }
        } else if (task.action === 'listContainers') {
            return await this.listContainers(task.options);
        } else if (task.action === 'createContainer') {
            return await this.createContainer(task.options);
        } else if (task.action === 'startContainer') {
            return await this.startContainer(task.containerId);
        } else if (task.action === 'stopContainer') {
            return await this.stopContainer(task.containerId);
        } else {
            throw new Error(`Unknown action: ${task.action}`);
        }
    }
}

module.exports = TerminalAgent;