#!/bin/bash

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# UPDATE THESE WITH YOUR ACTUAL HUGGING FACE SPACE REMOTES
SPACE_URL="https://huggingface.co/spaces/harishgarg2508/mail-service"
GIT_REMOTE="https://huggingface.co/spaces/harishgarg2508/mail-service"

echo -e "${GREEN}🚀 Preparing to deploy Mail Service to Hugging Face Space: mail-service${NC}"

# 1. Check for Git
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ git is not installed.${NC}"
    echo "Please install git: sudo apt install git"
    exit 1
fi

# 2. Fresh Start for deployment directory
if [ -d ".git" ]; then
    echo -e "\n${YELLOW}🧹 Cleaning up old git history...${NC}"
    rm -rf .git
fi

echo -e "\n${YELLOW}📦 Initializing fresh Git repository...${NC}"
git init
git branch -m main

# 3. Configure Remote
echo -e "\n${YELLOW}🔗 Configuring remote...${NC}"
if ! git remote | grep -q "huggingface"; then
    git remote add huggingface $GIT_REMOTE
fi

# 4. Add Files
echo -e "\n${YELLOW}➕ Adding files...${NC}"
git add .

# 5. Commit
echo -e "\n${YELLOW}💾 Committing changes...${NC}"
git commit -m "Deploying AstroFinix Mail Service to HF Spaces"

# 6. Push
echo -e "\n${YELLOW}🚀 Pushing to Hugging Face...${NC}"
echo -e "${RED}IMPORTANT: You will be asked for your Username and Password.${NC}"
echo -e "Username: ${GREEN}harishgarg2508${NC}"
echo -e "Password: ${GREEN}YOUR_WRITE_ACCESS_TOKEN${NC} (Not your login password!)"
echo -e "Get token here: https://huggingface.co/settings/tokens"
echo ""

git push -f huggingface main

if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}✅ Deployment Pushed!${NC}"
    echo "Build logs: $SPACE_URL"
else
    echo -e "\n${RED}❌ Push Failed.${NC}"
    echo "Did you use a Write Access Token as the password?"
fi
