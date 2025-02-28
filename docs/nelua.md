# Nelua Language Support in OSSForge

OSSForge provides first-class support for the [Nelua](https://nelua.io/) programming language, a systems programming language with syntax inspired by Lua but with static typing and memory management control.

## Features

- **Syntax Highlighting**: Full syntax highlighting for Nelua files in the IDE
- **Code Templates**: Pre-configured templates for common Nelua patterns and applications
- **Containerized Environment**: Dedicated Docker container for Nelua development
- **Intelligent Code Completion**: AI-powered code completion for Nelua
- **Debugging Support**: Integrated debugging for Nelua applications

## Getting Started with Nelua

### Prerequisites

To use Nelua in OSSForge, you need to have:

1. Docker installed (for containerized development)
2. OSSForge installed and configured

### Creating a New Nelua Project

1. Open OSSForge
2. Navigate to the IDE view
3. Click "New Project" and select "Nelua Project"
4. Choose a template:
   - Hello World
   - Basic Application
   - Command Line Tool
   - Library

### Running Nelua Code

OSSForge provides several ways to run Nelua code:

1. **In-IDE Terminal**: Use the integrated terminal to run Nelua commands
   ```bash
   nelua myfile.nelua
   ```

2. **Run Button**: Click the "Run" button in the IDE toolbar when a Nelua file is open

3. **Docker Container**: Execute code in the dedicated Nelua container
   ```bash
   docker exec -it nelua-dev nelua /workspace/myfile.nelua
   ```

## Nelua Development Agent

The Development Agent in OSSForge has special capabilities for Nelua:

- **Code Generation**: Generate Nelua code based on natural language descriptions
- **Code Optimization**: Optimize Nelua code for performance
- **Type Checking**: Verify type correctness in Nelua code
- **Best Practices**: Suggest improvements based on Nelua best practices

## Example: Using the Development Agent with Nelua

1. Navigate to the Agents view
2. Select the Development Agent
3. Enter a task description like: "Create a Nelua function that calculates the Fibonacci sequence"
4. Click "Execute"
5. Review and use the generated code

## Resources

- [Nelua Official Website](https://nelua.io/)
- [Nelua Documentation](https://nelua.io/docs/)
- [Nelua GitHub Repository](https://github.com/edubart/nelua-lang)