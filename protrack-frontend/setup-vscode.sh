#!/bin/bash

# ProTrack VS Code Setup Script
# This script helps set up the VS Code environment for ProTrack development

echo "🚀 Setting up ProTrack VS Code environment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: Please run this script from the protrack-frontend directory"
  exit 1
fi

# Create .vscode directory if it doesn't exist
mkdir -p .vscode

# Install VS Code extensions
echo "🔧 Installing recommended VS Code extensions..."
code --install-extension ms-vscode.vscode-typescript-next
code --install-extension bradlc.vscode-tailwindcss
code --install-extension esbenp.prettier-vscode
code --install-extension ms-vscode.vscode-eslint
code --install-extension formulahendry.auto-rename-tag
code --install-extension christian-kohler.path-intellisense
code --install-extension ms-vscode.vscode-json
code --install-extension redhat.vscode-yaml
code --install-extension ms-vscode-remote.remote-containers
code --install-extension ms-vscode.vscode-git
code --install-extension eamodio.gitlens

# Create/update .vscode/settings.json
echo "⚙️  Configuring VS Code settings..."
cat > .vscode/settings.json << 'EOF'
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.suggest.autoImports": true,
  "typescript.updateImportsOnFileMove.enabled": "always",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "files.associations": {
    "*.tsx": "typescriptreact",
    "*.ts": "typescript"
  },
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  },
  "tailwindCSS.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  },
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ],
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/build": true,
    "**/.git": true,
    "**/coverage": true
  },
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/build": true,
    "**/.git": true,
    "**/coverage": true
  },
  "codium.codeCompletion.enable": false,
  "git.ignoreLimitWarning": true,
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "eslint.workingDirectories": [
    "./",
    "./backend"
  ]
}
EOF

# Create/update .vscode/extensions.json
echo "📋 Creating extensions recommendation file..."
cat > .vscode/extensions.json << 'EOF'
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-json",
    "redhat.vscode-yaml",
    "ms-vscode-remote.remote-containers",
    "ms-vscode.vscode-git",
    "eamodio.gitlens"
  ]
}
EOF

# Create/update .vscode/tasks.json
echo "📝 Creating task configurations..."
cat > .vscode/tasks.json << 'EOF'
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Start Frontend",
      "type": "shell",
      "command": "npm",
      "args": ["run", "dev"],
      "options": {
        "cwd": "${workspaceFolder}"
      },
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "new"
      },
      "isBackground": true,
      "problemMatcher": {
        "owner": "vite",
        "pattern": {
          "regexp": "^(.*):(\\d+):(\\d+):\\s+(warning|error):\\s+(.*)$",
          "file": 1,
          "line": 2,
          "column": 3,
          "severity": 4,
          "message": 5
        },
        "background": {
          "activeOnStart": true,
          "beginsPattern": "^.*VITE.*ready.*$",
          "endsPattern": "^.*Local:.*$"
        }
      }
    },
    {
      "label": "Start Backend",
      "type": "shell",
      "command": "npm",
      "args": ["run", "dev"],
      "options": {
        "cwd": "${workspaceFolder}/backend"
      },
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "new"
      },
      "isBackground": true,
      "problemMatcher": {
        "owner": "typescript",
        "pattern": {
          "regexp": "^(.*):(\\d+):(\\d+):\\s+(warning|error):\\s+(.*)$",
          "file": 1,
          "line": 2,
          "column": 3,
          "severity": 4,
          "message": 5
        },
        "background": {
          "activeOnStart": true,
          "beginsPattern": "^.*ProTrack Backend Server running.*$",
          "endsPattern": "^.*Available endpoints.*$"
        }
      }
    },
    {
      "label": "Start Both Servers",
      "dependsOrder": "parallel",
      "dependsOn": ["Start Frontend", "Start Backend"],
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "new"
      }
    },
    {
      "label": "Install Frontend Dependencies",
      "type": "shell",
      "command": "npm",
      "args": ["install", "--legacy-peer-deps"],
      "options": {
        "cwd": "${workspaceFolder}"
      },
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "new"
      }
    },
    {
      "label": "Install Backend Dependencies",
      "type": "shell",
      "command": "npm",
      "args": ["install"],
      "options": {
        "cwd": "${workspaceFolder}/backend"
      },
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "new"
      }
    },
    {
      "label": "Install All Dependencies",
      "dependsOrder": "parallel",
      "dependsOn": [
        "Install Frontend Dependencies",
        "Install Backend Dependencies"
      ],
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "new"
      }
    },
    {
      "label": "Update Frontend Dependencies",
      "type": "shell",
      "command": "npm",
      "args": ["update"],
      "options": {
        "cwd": "${workspaceFolder}"
      },
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "new"
      }
    },
    {
      "label": "Update Backend Dependencies",
      "type": "shell",
      "command": "npm",
      "args": ["update"],
      "options": {
        "cwd": "${workspaceFolder}/backend"
      },
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "new"
      }
    },
    {
      "label": "Update All Dependencies",
      "dependsOrder": "parallel",
      "dependsOn": [
        "Update Frontend Dependencies",
        "Update Backend Dependencies"
      ],
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "new"
      }
    },
    {
      "label": "Fix Frontend Vulnerabilities",
      "type": "shell",
      "command": "npm",
      "args": ["audit", "fix"],
      "options": {
        "cwd": "${workspaceFolder}"
      },
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "new"
      }
    },
    {
      "label": "Fix Backend Vulnerabilities",
      "type": "shell",
      "command": "npm",
      "args": ["audit", "fix"],
      "options": {
        "cwd": "${workspaceFolder}/backend"
      },
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "new"
      }
    },
    {
      "label": "Fix All Vulnerabilities",
      "dependsOrder": "parallel",
      "dependsOn": [
        "Fix Frontend Vulnerabilities",
        "Fix Backend Vulnerabilities"
      ],
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "new"
      }
    },
    {
      "label": "Compile Smart Contracts",
      "type": "shell",
      "command": "npx",
      "args": ["hardhat", "compile"],
      "options": {
        "cwd": "${workspaceFolder}/../contracts"
      },
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "new"
      }
    },
    {
      "label": "Lint Frontend",
      "type": "shell",
      "command": "npm",
      "args": ["run", "lint"],
      "options": {
        "cwd": "${workspaceFolder}"
      },
      "group": "test",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "new"
      }
    },
    {
      "label": "Lint Backend",
      "type": "shell",
      "command": "npm",
      "args": ["run", "lint"],
      "options": {
        "cwd": "${workspaceFolder}/backend"
      },
      "group": "test",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "new"
      }
    }
  ]
}
EOF

# Create/update .vscode/launch.json
echo "🔍 Creating debug configurations..."
cat > .vscode/launch.json << 'EOF'
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch Frontend",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}",
      "preLaunchTask": "Start Frontend"
    },
    {
      "name": "Launch Backend",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/backend/src/server.ts",
      "cwd": "${workspaceFolder}/backend",
      "preLaunchTask": "Start Backend",
      "env": {
        "NODE_ENV": "development",
        "PORT": "3001"
      },
      "sourceMaps": true,
      "outFiles": ["${workspaceFolder}/backend/dist/**/*.js"]
    }
  ],
  "compounds": [
    {
      "name": "Launch Full Stack",
      "configurations": ["Launch Frontend", "Launch Backend"],
      "stopAll": true
    }
  ]
}
EOF

# Fix vulnerabilities
echo "🛡️  Fixing npm vulnerabilities..."
cd backend && npm audit fix && cd ..
npm audit fix

echo "✅ VS Code setup complete!"
echo "💡 Tip: Restart VS Code to apply all changes"
echo "📖 Check the VS_CODE_SETUP_GUIDE.md file for detailed instructions"