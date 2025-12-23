# How to Sync Your Game to GitHub

Since the AI environment cannot directly access your private GitHub account for security reasons, you need to execute these commands in your terminal.

## Prerequisite: Create a Repository
1. Go to [GitHub.com](https://github.com) and sign in.
2. Click **New Repository**.
3. Name it (e.g., `verse8-quarterview-game`).
4. **DO NOT** check "Initialize with README" (we already have project files).
5. Click **Create repository**.

## Step 1: Initialize Git (One-time setup)

Open your terminal (usually at the bottom of the IDE) and run these commands one by one:

```bash
# 1. Initialize git in this project
git init

# 2. Add all current files (respecting .gitignore)
git add .

# 3. Create the first commit
git commit -m "Initial commit: Verse8 Game Project"

# 4. Rename branch to main (best practice)
git branch -M main

# 5. Connect to your GitHub repository
# REPLACE <YOUR_USERNAME> and <REPO_NAME> with your actual details!
git remote add origin https://github.com/<YOUR_USERNAME>/<REPO_NAME>.git
```

## Step 2: Push Code (Upload)

```bash
git push -u origin main
```

*Note: You may be asked for your GitHub username and password. For password, you must use a **Personal Access Token** if you have 2FA enabled.*

## Step 3: Real-time Updates (Daily Workflow)

Whenever the AI makes changes or you write code, run these three commands to save them to GitHub:

```bash
# 1. Stage all changes
git add .

# 2. Commit changes (describe what you did)
git commit -m "Update game features and assets"

# 3. Push to GitHub
git push
```

## Troubleshooting

- **Permissions Error**: If `git push` fails, ensure you are using a [Personal Access Token](https://github.com/settings/tokens) instead of your account password.
- **Wrong Origin**: If you typed the URL wrong, run `git remote remove origin` and try step 1.5 again.
