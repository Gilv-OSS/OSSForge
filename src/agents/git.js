/**
 * Git Agent
 * 
 * The Git Agent is responsible for managing repositories and version control.
 * It can clone repositories, commit changes, push to remote, and automate
 * common Git operations.
 */

const simpleGit = require('simple-git');
const fs = require('fs');
const path = require('path');

class GitAgent {
    constructor(config = {}) {
        this.config = {
            defaultCommitMessage: 'Update files',
            defaultBranch: 'main',
            ...config
        };
    }
    
    /**
     * Clone a repository
     * @param {string} repoUrl - URL of the repository to clone
     * @param {string} localPath - Local path to clone to
     * @returns {Promise<object>} - Promise resolving to the clone result
     */
    async clone(repoUrl, localPath) {
        console.log(`Cloning repository ${repoUrl} to ${localPath}`);
        
        try {
            // Ensure directory exists
            const directory = path.dirname(localPath);
            if (!fs.existsSync(directory)) {
                fs.mkdirSync(directory, { recursive: true });
            }
            
            // Clone repository
            const git = simpleGit();
            await git.clone(repoUrl, localPath);
            
            return {
                success: true,
                repoUrl,
                localPath,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error cloning repository:', error);
            throw error;
        }
    }
    
    /**
     * Commit changes to a repository
     * @param {string} repoPath - Path to the repository
     * @param {string} message - Commit message
     * @param {Array<string>} files - Files to commit (default: all)
     * @returns {Promise<object>} - Promise resolving to the commit result
     */
    async commit(repoPath, message, files = ['./*']) {
        console.log(`Committing changes to repository at ${repoPath}`);
        
        try {
            const git = simpleGit(repoPath);
            
            // Check if there are changes to commit
            const status = await git.status();
            if (status.isClean()) {
                return {
                    success: false,
                    message: 'No changes to commit',
                    timestamp: new Date().toISOString()
                };
            }
            
            // Add files
            await git.add(files);
            
            // Commit changes
            const commitResult = await git.commit(message);
            
            return {
                success: true,
                commitHash: commitResult.commit,
                message,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error committing changes:', error);
            throw error;
        }
    }
    
    /**
     * Push changes to remote
     * @param {string} repoPath - Path to the repository
     * @param {string} remote - Remote to push to (default: origin)
     * @param {string} branch - Branch to push (default: current branch)
     * @returns {Promise<object>} - Promise resolving to the push result
     */
    async push(repoPath, remote = 'origin', branch = null) {
        console.log(`Pushing changes to ${remote}/${branch || 'current branch'}`);
        
        try {
            const git = simpleGit(repoPath);
            
            // Get current branch if not specified
            if (!branch) {
                const branchSummary = await git.branch();
                branch = branchSummary.current;
            }
            
            // Push changes
            await git.push(remote, branch);
            
            return {
                success: true,
                remote,
                branch,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error pushing changes:', error);
            throw error;
        }
    }
    
    /**
     * Pull changes from remote
     * @param {string} repoPath - Path to the repository
     * @param {string} remote - Remote to pull from (default: origin)
     * @param {string} branch - Branch to pull (default: current branch)
     * @returns {Promise<object>} - Promise resolving to the pull result
     */
    async pull(repoPath, remote = 'origin', branch = null) {
        console.log(`Pulling changes from ${remote}/${branch || 'current branch'}`);
        
        try {
            const git = simpleGit(repoPath);
            
            // Get current branch if not specified
            if (!branch) {
                const branchSummary = await git.branch();
                branch = branchSummary.current;
            }
            
            // Pull changes
            const pullResult = await git.pull(remote, branch);
            
            return {
                success: true,
                remote,
                branch,
                files: pullResult.files,
                insertions: pullResult.insertions,
                deletions: pullResult.deletions,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error pulling changes:', error);
            throw error;
        }
    }
    
    /**
     * Create a new branch
     * @param {string} repoPath - Path to the repository
     * @param {string} branchName - Name of the branch to create
     * @param {boolean} checkout - Whether to checkout the new branch (default: true)
     * @returns {Promise<object>} - Promise resolving to the branch creation result
     */
    async createBranch(repoPath, branchName, checkout = true) {
        console.log(`Creating branch ${branchName} in repository at ${repoPath}`);
        
        try {
            const git = simpleGit(repoPath);
            
            // Create branch
            await git.checkoutLocalBranch(branchName);
            
            return {
                success: true,
                branchName,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error creating branch:', error);
            throw error;
        }
    }
    
    /**
     * Automatically commit changes with a generated message
     * @param {string} repoPath - Path to the repository
     * @param {string} message - Commit message (optional)
     * @returns {Promise<object>} - Promise resolving to the commit result
     */
    async autoCommit(repoPath, message = null) {
        console.log(`Auto-committing changes to repository at ${repoPath}`);
        
        try {
            const git = simpleGit(repoPath);
            
            // Check if there are changes to commit
            const status = await git.status();
            if (status.isClean()) {
                return {
                    success: false,
                    message: 'No changes to commit',
                    timestamp: new Date().toISOString()
                };
            }
            
            // Generate commit message if not provided
            if (!message) {
                const changedFiles = [
                    ...status.modified,
                    ...status.created,
                    ...status.deleted
                ];
                
                if (changedFiles.length === 1) {
                    message = `Update ${changedFiles[0]}`;
                } else {
                    message = `Update ${changedFiles.length} files`;
                }
            }
            
            // Add all changes
            await git.add('./*');
            
            // Commit changes
            const commitResult = await git.commit(message);
            
            return {
                success: true,
                commitHash: commitResult.commit,
                message,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error auto-committing changes:', error);
            throw error;
        }
    }
    
    /**
     * Get repository status
     * @param {string} repoPath - Path to the repository
     * @returns {Promise<object>} - Promise resolving to the repository status
     */
    async getStatus(repoPath) {
        console.log(`Getting status of repository at ${repoPath}`);
        
        try {
            const git = simpleGit(repoPath);
            const status = await git.status();
            
            return {
                success: true,
                isClean: status.isClean(),
                current: status.current,
                tracking: status.tracking,
                modified: status.modified,
                created: status.created,
                deleted: status.deleted,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error getting repository status:', error);
            throw error;
        }
    }
    
    /**
     * Execute a general task
     * @param {object} task - Task to execute
     * @returns {Promise<object>} - Promise resolving to the task result
     */
    async execute(task) {
        console.log('Git agent executing task:', task);
        
        if (task.action === 'clone') {
            return await this.clone(task.repoUrl, task.localPath);
        } else if (task.action === 'commit') {
            return await this.commit(task.repoPath, task.message, task.files);
        } else if (task.action === 'push') {
            return await this.push(task.repoPath, task.remote, task.branch);
        } else if (task.action === 'pull') {
            return await this.pull(task.repoPath, task.remote, task.branch);
        } else if (task.action === 'createBranch') {
            return await this.createBranch(task.repoPath, task.branchName, task.checkout);
        } else if (task.action === 'autoCommit') {
            return await this.autoCommit(task.repoPath, task.message);
        } else if (task.action === 'getStatus') {
            return await this.getStatus(task.repoPath);
        } else {
            throw new Error(`Unknown action: ${task.action}`);
        }
    }
}

module.exports = GitAgent;