/**
 * Agent System
 * 
 * This module exports all the agents in the OSSForge multi-agent system.
 */

const SupervisorAgent = require('./supervisor');
const DevelopmentAgent = require('./development');
const GitAgent = require('./git');
const SearchAgent = require('./search');
const TerminalAgent = require('./terminal');

/**
 * Initialize the agent system
 * @param {object} config - Configuration for the agents
 * @returns {object} - Object containing all initialized agents
 */
function initializeAgents(config = {}) {
    // Create agent instances
    const supervisor = new SupervisorAgent(config.supervisor);
    const development = new DevelopmentAgent(config.development);
    const git = new GitAgent(config.git);
    const search = new SearchAgent(config.search);
    const terminal = new TerminalAgent(config.terminal);
    
    // Register agents with supervisor
    supervisor.registerAgent('development', development);
    supervisor.registerAgent('git', git);
    supervisor.registerAgent('search', search);
    supervisor.registerAgent('terminal', terminal);
    
    return {
        supervisor,
        development,
        git,
        search,
        terminal
    };
}

module.exports = {
    SupervisorAgent,
    DevelopmentAgent,
    GitAgent,
    SearchAgent,
    TerminalAgent,
    initializeAgents
};