import { elements, updateStatus } from './ui.js';

const getScriptInstructions = (scriptType) => {
  if (scriptType === 'ps1') {
    return `
      <div class="script-instructions">
        <h3>Important: Run in PowerShell Terminal</h3>
        <p class="warning">⚠️ This script must be run from a PowerShell terminal. Do not double-click the file or run from other terminals.</p>
        <ol>
          <li>Open PowerShell terminal (not Command Prompt or other terminals)</li>
          <li>Navigate to the download directory:<br>
          <code>cd path/to/downloaded/script</code></li>
          <li>Run the script:<br>
          <code>.\\railway-setup.ps1</code></li>
          <li>If blocked by execution policy, run:<br>
          <code>Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process</code></li>
        </ol>
        <p class="note">A log file will be created in the same directory when run correctly.</p>
      </div>`;
  } else if (scriptType === 'sh') {
    return `
      <div class="script-instructions">
        <h3>Important: Run in Terminal</h3>
        <p class="warning">⚠️ This script must be run from a terminal. Do not double-click the file.</p>
        <ol>
          <li>Open Terminal</li>
          <li>Navigate to the download directory:<br>
          <code>cd path/to/downloaded/script</code></li>
          <li>Make the script executable:<br>
          <code>chmod +x railway-setup.sh</code></li>
          <li>Run the script:<br>
          <code>./railway-setup.sh</code></li>
        </ol>
        <p class="note">A log file will be created in the same directory when run correctly.</p>
      </div>`;
  }
  return '';
};

const getAlternativeDownloads = (scriptType, scriptName) => {
  return `
    <div class="alternative-downloads">
      <h3>Alternative Downloads</h3>
      <p>You downloaded the ${scriptName} script. You can also download:</p>
      <ul>
        ${scriptType !== 'ps1' ? '<li><a href="railway-setup.ps1" download>Windows PowerShell Script (.ps1)</a></li>' : ''}
        ${scriptType !== 'bat' ? '<li><a href="railway-setup.bat" download>Windows Batch Script (.bat)</a></li>' : ''}
        ${scriptType !== 'sh' ? '<li><a href="railway-setup.sh" download>Mac/Linux Shell Script (.sh)</a></li>' : ''}
      </ul>
    </div>`;
};

export const showPostDownloadInfo = (scriptType) => {
  console.log('Showing post-download info for script type:', scriptType);
  
  const scriptName = scriptType === 'ps1' ? 'Windows PowerShell' : 'Mac/Linux Shell';
  const instructions = getScriptInstructions(scriptType);
  const alternativeDownloads = getAlternativeDownloads(scriptType, scriptName);

  elements.postDownloadInfo.innerHTML = instructions + alternativeDownloads;
  elements.postDownloadInfo.style.display = 'block';
  
  console.log('Generated HTML content:', elements.postDownloadInfo.innerHTML);
};

export const generateScript = async () => {
  try {
    const userAgent = navigator.userAgent.toLowerCase();
    const scriptPath = userAgent.includes('windows') ? 'railway-setup.ps1' : 'railway-setup.sh';
    
    const baseUrl = window.location.href.replace(/\/[^/]*$/, '/');
    const fullScriptPath = new URL(scriptPath, baseUrl).href;
    
    const response = await fetch(fullScriptPath);
    if (!response.ok) {
      throw new Error(`Failed to fetch script: ${response.statusText}`);
    }
    
    const scriptContent = await response.text();
    const blob = new Blob([scriptContent], { 
        type: 'application/octet-stream',
        endings: 'native'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = scriptPath;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    const scriptType = scriptPath.split('.').pop();
    showPostDownloadInfo(scriptType);
    
    updateStatus('Script downloaded successfully!');
  } catch (error) {
    console.error('Error downloading script:', error);
    updateStatus('Failed to download script: ' + error.message, true);
  }
};
