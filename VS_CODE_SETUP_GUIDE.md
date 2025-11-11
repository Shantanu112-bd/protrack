# VS Code Setup Guide for ProTrack

This guide will help you set up the ProTrack project in Visual Studio Code with all the necessary extensions and configurations for optimal development experience.

## Prerequisites

1. **Node.js** (version 18 or higher)
2. **npm** (version 9 or higher)
3. **Visual Studio Code** (latest version recommended)

## Recommended VS Code Extensions

The project includes a `.vscode/extensions.json` file that recommends essential extensions. When you open the project in VS Code, you'll be prompted to install these extensions. The recommended extensions are:

- **TypeScript + JavaScript Language Features** (`ms-vscode.vscode-typescript-next`)
- **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`)
- **Prettier - Code formatter** (`esbenp.prettier-vscode`)
- **ESLint** (`ms-vscode.vscode-eslint`)
- **Auto Rename Tag** (`formulahendry.auto-rename-tag`)
- **Path Intellisense** (`christian-kohler.path-intellisense`)
- **GitLens** (`eamodio.gitlens`)

## Project Structure

The ProTrack project has the following structure:

```
ProTrack/
├── .vscode/                 # VS Code configuration
├── protrack-frontend/       # React frontend application
│   ├── src/                 # Source code
│   ├── backend/             # Express.js backend
│   └── contracts/           # Smart contracts
├── contracts/               # Standalone Hardhat project
└── scripts/                 # Deployment scripts
```

## TypeScript Configuration

The project uses TypeScript with the following configuration files:

- `tsconfig.json` - Main TypeScript configuration
- `tsconfig.app.json` - Frontend application configuration
- `tsconfig.node.json` - Node.js specific configuration
- `backend/tsconfig.json` - Backend TypeScript configuration

## ESLint Configuration

The project includes ESLint for code linting with the following configurations:

- `eslint.config.js` - Main ESLint configuration
- `.eslintrc.dev.cjs` - Development-specific ESLint rules

## Setting Up the Project

1. **Clone the repository** (if not already done):

   ```bash
   git clone <repository-url>
   cd ProTrack
   ```

2. **Install frontend dependencies**:

   ```bash
   cd protrack-frontend
   npm install --legacy-peer-deps
   ```

3. **Install backend dependencies**:

   ```bash
   cd backend
   npm install
   ```

4. **Return to the project root**:
   ```bash
   cd ../..
   ```

## Running the Project

### Using VS Code Tasks

The project includes predefined VS Code tasks for common operations:

1. **Start Frontend**: Runs the React development server
2. **Start Backend**: Runs the Express.js backend server
3. **Start Both Servers**: Runs both frontend and backend simultaneously
4. **Fix All Vulnerabilities**: Runs `npm audit fix` on both frontend and backend

To run these tasks:

1. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac) to open the command palette
2. Type "Tasks: Run Task" and select it
3. Choose the task you want to run

### Using Terminal

You can also run the project using the integrated terminal:

1. **Frontend**:

   ```bash
   cd protrack-frontend
   npm run dev
   ```

2. **Backend**:
   ```bash
   cd protrack-frontend/backend
   npm run dev
   ```

## Debugging Configuration

The project includes VS Code launch configurations for debugging:

1. **Launch Frontend**: Debug the React frontend application
2. **Launch Backend**: Debug the Express.js backend server
3. **Launch Both Servers**: Debug both frontend and backend simultaneously
4. **Launch Full Stack**: Compound configuration to launch both frontend and backend

To start debugging:

1. Open the Run and Debug view (`Ctrl+Shift+D` or `Cmd+Shift+D`)
2. Select the configuration you want to run
3. Click the "Start Debugging" button (F5)

## Handling Security Vulnerabilities

The project includes automated tasks to handle npm security vulnerabilities:

1. **Fix Frontend Vulnerabilities**: Runs `npm audit fix` in the frontend directory
2. **Fix Backend Vulnerabilities**: Runs `npm audit fix` in the backend directory
3. **Fix All Vulnerabilities**: Runs vulnerability fixes for both frontend and backend

If you encounter vulnerability warnings:

1. Run the "Fix All Vulnerabilities" task from VS Code
2. Or manually run `npm audit fix` in both frontend and backend directories

Common vulnerability issues and solutions:

- **elliptic**: Updated by updating ethers package
- **vite**: Updated to latest version
- **ws**: Updated by updating ethers package
- **nanoid**: Updated in backend dependencies
- **nodemailer**: Updated to latest version
- **parse-duration**: Updated in backend dependencies

## Smart Contract Development

For smart contract development, you can use the standalone Hardhat project in the `contracts/` directory:

1. **Compile contracts**:

   ```bash
   cd contracts
   npx hardhat compile
   ```

2. **Run tests**:

   ```bash
   npx hardhat test
   ```

3. **Deploy contracts**:
   ```bash
   npx hardhat run scripts/deploy.js --network localhost
   ```

## Troubleshooting

### Common Issues

1. **TypeScript errors**:

   - Ensure all dependencies are installed with `npm install --legacy-peer-deps`
   - Restart TypeScript server: `Ctrl+Shift+P` → "TypeScript: Restart TS Server"

2. **ESLint not working**:

   - Check that the ESLint extension is installed and enabled
   - Verify that the ESLint configuration files are present

3. **Tailwind CSS IntelliSense not working**:

   - Ensure the Tailwind CSS IntelliSense extension is installed
   - Check that the `tailwind.config.js` file is present in the project root

4. **Port conflicts**:

   - The frontend runs on port 5173 by default
   - The backend runs on port 3001 by default
   - If ports are in use, the applications will automatically select different ports

5. **Security vulnerabilities**:
   - Run the "Fix All Vulnerabilities" task
   - Or manually run `npm audit fix` in both frontend and backend directories

### Useful VS Code Commands

- `Ctrl+Shift+P` / `Cmd+Shift+P`: Open command palette
- `Ctrl+` `/`Cmd+` `: Toggle integrated terminal
- `F5`: Start debugging
- `Ctrl+Shift+M` / `Cmd+Shift+M`: Open problems panel
- `Ctrl+Shift+X` / `Cmd+Shift+X`: Open extensions panel

## Additional Resources

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev/learn)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Hardhat Documentation](https://hardhat.org/getting-started/)
- [Express.js Documentation](https://expressjs.com/en/guide/routing.html)
