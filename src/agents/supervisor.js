/**
 * Supervisor Agent
 * 
 * The Supervisor Agent coordinates all agent activities and manages workflow.
 * It acts as the central hub for communication between agents and ensures
 * that tasks are properly distributed and executed.
 */

class SupervisorAgent {
    constructor() {
        this.agents = new Map();
        this.tasks = [];
        this.history = [];
    }

    /**
     * Register an agent with the supervisor
     * @param {string} agentType - Type of agent (development, git, search, terminal)
     * @param {object} agent - Agent instance
     */
    registerAgent(agentType, agent) {
        this.agents.set(agentType, agent);
        console.log(`Registered ${agentType} agent`);
    }

    /**
     * Coordinate a task across multiple agents
     * @param {Array} agentTypes - Types of agents to involve
     * @param {object} task - Task to execute
     * @returns {Promise} - Promise resolving to the task result
     */
    async coordinate(agentTypes, task) {
        console.log(`Coordinating task across ${agentTypes.join(', ')} agents`);
        
        // Add task to queue
        const taskId = Date.now().toString();
        this.tasks.push({
            id: taskId,
            agentTypes,
            task,
            status: 'pending',
            results: {}
        });

        // Execute task on each agent
        const results = {};
        for (const agentType of agentTypes) {
            const agent = this.agents.get(agentType);
            if (!agent) {
                results[agentType] = { error: `Agent ${agentType} not found` };
                continue;
            }

            try {
                // Execute the appropriate method based on agent type and task
                let result;
                switch (agentType) {
                    case 'development':
                        if (task.action === 'writeCode') {
                            result = await agent.writeCode(task.language, task.description);
                        } else if (task.action === 'optimizeCode') {
                            result = await agent.optimizeCode(task.code, task.criteria);
                        }
                        break;
                    case 'git':
                        if (task.action === 'autoCommit') {
                            result = await agent.autoCommit(task.repoPath, task.message);
                        }
                        break;
                    case 'search':
                        if (task.action === 'findProjects') {
                            result = await agent.findProjects(task.query);
                        } else if (task.action === 'analyzeSolution') {
                            result = await agent.analyzeSolution(task.repoUrl);
                        }
                        break;
                    case 'terminal':
                        if (task.action === 'executeCommand') {
                            result = await agent.executeCommand(task.command, task.containerName);
                        }
                        break;
                    default:
                        result = await agent.execute(task);
                }
                
                results[agentType] = { success: true, result };
            } catch (error) {
                console.error(`Error executing ${agentType} agent:`, error);
                results[agentType] = { error: error.message };
            }
        }

        // Update task status
        const taskIndex = this.tasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            this.tasks[taskIndex].status = 'completed';
            this.tasks[taskIndex].results = results;
            this.tasks[taskIndex].completedAt = new Date().toISOString();
            
            // Add to history
            this.history.push(this.tasks[taskIndex]);
            
            // Limit history size
            if (this.history.length > 100) {
                this.history.shift();
            }
        }

        return {
            taskId,
            results,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Execute a task on a single agent
     * @param {string} agentType - Type of agent to execute task on
     * @param {object} task - Task to execute
     * @returns {Promise} - Promise resolving to the task result
     */
    async execute(agentType, task) {
        console.log(`Executing task on ${agentType} agent`);
        
        const agent = this.agents.get(agentType);
        if (!agent) {
            throw new Error(`Agent ${agentType} not found`);
        }

        try {
            const result = await agent.execute(task);
            
            // Add to history
            this.history.push({
                id: Date.now().toString(),
                agentType,
                task,
                status: 'completed',
                result,
                timestamp: new Date().toISOString()
            });
            
            // Limit history size
            if (this.history.length > 100) {
                this.history.shift();
            }
            
            return result;
        } catch (error) {
            console.error(`Error executing ${agentType} agent:`, error);
            throw error;
        }
    }

    /**
     * Get task history
     * @param {number} limit - Maximum number of history items to return
     * @returns {Array} - Array of task history items
     */
    getHistory(limit = 10) {
        return this.history.slice(-limit);
    }

    /**
     * Get task by ID
     * @param {string} taskId - ID of task to retrieve
     * @returns {object|null} - Task object or null if not found
     */
    getTask(taskId) {
        return this.tasks.find(task => task.id === taskId) || null;
    }
}

module.exports = SupervisorAgent;