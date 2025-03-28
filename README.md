# n8n PWA Configuration Tool

A Progressive Web App for managing n8n deployments on Railway.

## Features
- Configure n8n instance connection
- Test API connectivity
- Save and manage configuration
- Works with both Railway deployments and local instances

## Usage

1. Visit the app at: https://yourusername.github.io/n8npwa/

2. Follow the setup instructions to deploy n8n on Railway

3. Configure your n8n instance:
   - Enter your n8n URL (from Railway deployment)
   - Enter your API key (from n8n settings)
   - Test the connection
   - Save your configuration

## Local Development

1. Clone the repository:
```bash
git clone https://github.com/yourusername/n8npwa.git
cd n8npwa
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm start
```

4. Open http://localhost:3000 in your browser

## Deployment

The app is automatically deployed to GitHub Pages when changes are pushed to the main branch.

To set up GitHub Pages:

1. Go to your repository settings
2. Navigate to Pages section
3. Select main branch as source
4. Save the changes

The app will be available at: https://yourusername.github.io/n8npwa/
