/**
 * Agent Factory for creating OpenAI Agents
 * 
 * This module creates specialized agents using the OpenAI Agents SDK.
 * It implements a main triage agent that can delegate to specialized sub-agents.
 */

// Note: This is a Node.js implementation that uses the Python OpenAI Agents SDK via child_process
// In a production environment, you might want to use a Python microservice or the JavaScript SDK when available
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const logger = require('./logger');

// Path to Python scripts
const PYTHON_SCRIPTS_DIR = path.join(__dirname, '../python');

/**
 * Create the main triage agent that can delegate to specialized sub-agents
 */
const createMainAgent = () => {
  // Ensure Python scripts directory exists
  if (!fs.existsSync(PYTHON_SCRIPTS_DIR)) {
    fs.mkdirSync(PYTHON_SCRIPTS_DIR, { recursive: true });
  }

  // Create main agent script if it doesn't exist
  const mainAgentScriptPath = path.join(PYTHON_SCRIPTS_DIR, 'main_agent.py');
  if (!fs.existsSync(mainAgentScriptPath)) {
    const mainAgentScript = `
import os
import sys
import json
from agents import Agent, Runner, ModelSettings

# Import specialized agents
from research_agent import create_research_agent
from writing_agent import create_writing_agent

def create_main_agent():
    """Create the main triage agent that can delegate to specialized sub-agents"""
    
    # Create specialized agents for handoff
    research_agent = create_research_agent()
    writing_agent = create_writing_agent()
    
    # Create main triage agent with handoffs to specialized agents
    main_agent = Agent(
        name="YardlyBot",
        instructions="""You are YardlyBot, a helpful assistant for yard and garden care.
        
        Your primary role is to understand the user's request and either:
        1. Answer directly for general yard and garden questions
        2. Delegate to the Research Agent for complex research tasks
        3. Delegate to the Writing Agent for creating content
        
        Always be friendly, helpful, and focus on providing practical advice for yard care.
        """,
        model="o3-mini",  # Use appropriate model based on needs
        handoffs=[research_agent, writing_agent],
    )
    
    return main_agent

def run_agent(messages, workflow_name=None):
    """Run the main agent with the given messages"""
    main_agent = create_main_agent()
    
    # Configure run settings
    run_config = {}
    if workflow_name:
        run_config["workflow_name"] = workflow_name
    
    # Run the agent
    result = Runner.run_sync(main_agent, messages, **run_config)
    
    # Return the result as JSON
    return {
        "final_output": result.final_output,
        "trace_id": result.trace_id if hasattr(result, "trace_id") else None
    }

if __name__ == "__main__":
    # Read input from stdin
    input_data = json.loads(sys.stdin.read())
    messages = input_data.get("messages", [])
    workflow_name = input_data.get("workflow_name")
    
    # Run the agent
    result = run_agent(messages, workflow_name)
    
    # Write result to stdout
    sys.stdout.write(json.dumps(result))
`;
    fs.writeFileSync(mainAgentScriptPath, mainAgentScript);
  }

  // Create research agent script if it doesn't exist
  const researchAgentScriptPath = path.join(PYTHON_SCRIPTS_DIR, 'research_agent.py');
  if (!fs.existsSync(researchAgentScriptPath)) {
    const researchAgentScript = `
import os
from agents import Agent, function_tool

def search_tool(query):
    """Simulated search tool for research purposes"""
    # In a real implementation, this would connect to search APIs
    return f"Research results for: {query}"

@function_tool
def search(query: str) -> str:
    """Search for information on a topic"""
    return search_tool(query)

def create_research_agent():
    """Create a specialized research agent"""
    research_agent = Agent(
        name="ResearchAgent",
        instructions="""You are a specialized research agent for yard and garden care.
        
        Your role is to find detailed information about plants, gardening techniques,
        pest control, lawn care, and other yard-related topics.
        
        Use the search tool to gather information, then synthesize it into
        comprehensive and accurate responses.
        """,
        model="o3-mini",
        tools=[search],
    )
    
    return research_agent
`;
    fs.writeFileSync(researchAgentScriptPath, researchAgentScript);
  }

  // Create writing agent script if it doesn't exist
  const writingAgentScriptPath = path.join(PYTHON_SCRIPTS_DIR, 'writing_agent.py');
  if (!fs.existsSync(writingAgentScriptPath)) {
    const writingAgentScript = `
import os
from agents import Agent

def create_writing_agent():
    """Create a specialized writing agent"""
    writing_agent = Agent(
        name="WritingAgent",
        instructions="""You are a specialized writing agent for yard and garden content.
        
        Your role is to create well-structured, engaging content about yard care topics,
        including:
        - How-to guides
        - Seasonal yard care tips
        - Plant care instructions
        - Troubleshooting guides for common yard problems
        
        Focus on clear, practical advice with a friendly tone.
        """,
        model="o3-mini",
    )
    
    return writing_agent
`;
    fs.writeFileSync(writingAgentScriptPath, writingAgentScript);
  }

  // Return a JavaScript object that mimics the Python agent interface
  return {
    runSync: async (options) => {
      try {
        const { messages, workflow_name } = options;
        
        // Spawn Python process
        const pythonProcess = spawn('python3', [mainAgentScriptPath]);
        
        // Prepare input data
        const inputData = JSON.stringify({
          messages,
          workflow_name,
        });
        
        // Send data to Python process
        pythonProcess.stdin.write(inputData);
        pythonProcess.stdin.end();
        
        // Collect output
        let outputData = '';
        pythonProcess.stdout.on('data', (data) => {
          outputData += data.toString();
        });
        
        // Handle errors
        let errorData = '';
        pythonProcess.stderr.on('data', (data) => {
          errorData += data.toString();
        });
        
        // Return a promise that resolves when the process exits
        return new Promise((resolve, reject) => {
          pythonProcess.on('close', (code) => {
            if (code !== 0) {
              logger.error(`Python process exited with code ${code}`);
              logger.error(`Error: ${errorData}`);
              reject(new Error(`Agent execution failed with code ${code}: ${errorData}`));
            } else {
              try {
                const result = JSON.parse(outputData);
                resolve(result);
              } catch (error) {
                logger.error('Failed to parse agent output:', error);
                reject(error);
              }
            }
          });
        });
      } catch (error) {
        logger.error('Error running agent:', error);
        throw error;
      }
    }
  };
};

/**
 * Create a specialized research agent
 */
const createResearchAgent = () => {
  // In a real implementation, this would create a standalone research agent
  // For now, we'll just return a placeholder
  return {
    name: 'ResearchAgent',
    // Additional properties and methods would be implemented here
  };
};

/**
 * Create a specialized writing agent
 */
const createWritingAgent = () => {
  // In a real implementation, this would create a standalone writing agent
  // For now, we'll just return a placeholder
  return {
    name: 'WritingAgent',
    // Additional properties and methods would be implemented here
  };
};

module.exports = {
  createMainAgent,
  createResearchAgent,
  createWritingAgent,
};