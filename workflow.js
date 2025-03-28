import { elements, updateStatus, updateServerInfo } from './ui.js';
import { saveN8nCredentials, getN8nCredentials, getRailwayCredentials } from './db.js';

export const processLogFile = async () => {
  const file = elements.logFile.files[0];
  if (!file) {
    updateStatus('Please select a log file', true);
    return;
  }

  try {
    // Check for Railway credentials first
    const railwayCredentials = await getRailwayCredentials();
    if (!railwayCredentials) {
      throw new Error('Railway credentials not found. Please set up Railway credentials first.');
    }

    const content = await file.text();
    
    // Extract deployment URL
    const urlMatch = content.match(/Deployment URL:?\s*(https?:\/\/[^\s]+)/i);
    if (!urlMatch) {
      throw new Error('Deployment URL not found in log file');
    }

    const deploymentUrl = urlMatch[1];
    
    // Extract Railway project info
    const projectMatch = content.match(/Project:\s*([^\s]+)/i);
    const projectId = projectMatch ? projectMatch[1] : null;

    const credentials = {
      deploymentUrl,
      projectId,
      timestamp: new Date().toISOString()
    };

    await saveN8nCredentials(credentials);
    updateServerInfo(credentials);
    updateStatus('Deployment credentials saved successfully!');
    
  } catch (error) {
    console.error('Error processing log file:', error);
    updateStatus('Failed to process log file: ' + error.message, true);
  }
};

export const uploadWorkflow = async () => {
  const file = elements.workflowFile.files[0];
  if (!file) {
    updateStatus('Please select a workflow file', true);
    return;
  }

  try {
    const credentials = await getN8nCredentials();
    if (!credentials) {
      throw new Error('No deployment credentials found. Please process a deployment log file first.');
    }

    const workflow = await file.text();
    const workflowData = JSON.parse(workflow);

    // Construct the n8n API endpoint
    const apiUrl = `${credentials.deploymentUrl}/api/workflows`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(workflowData)
    });

    if (!response.ok) {
      throw new Error(`Failed to upload workflow: ${response.statusText}`);
    }

    updateStatus('Workflow uploaded successfully!');
    
  } catch (error) {
    console.error('Error uploading workflow:', error);
    updateStatus('Failed to upload workflow: ' + error.message, true);
  }
};
