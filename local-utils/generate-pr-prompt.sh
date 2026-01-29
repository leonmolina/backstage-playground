#!/bin/bash

# Script to generate a PR prompt with git diff for LLM-based PR title and description generation

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}⚠️  Warning: Make sure your local 'main' branch is up to date with remote!${NC}"
echo -e "   You can update it by running: ${GREEN}git fetch origin main:main${NC}"
echo ""
read -n 1 -p "Do you want to continue? (y/N): " confirm
echo ""

if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
    echo -e "${RED}Aborted.${NC}"
    exit 1
fi

# Get current branch name
CURRENT_BRANCH=$(git branch --show-current)

if [[ "$CURRENT_BRANCH" == "main" ]]; then
    echo -e "${RED}Error: You are currently on 'main' branch. Please switch to your feature branch.${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}Generating PR prompt for branch: ${CURRENT_BRANCH}${NC}"
echo ""

# Generate the diff
DIFF=$(git diff main...HEAD)

if [[ -z "$DIFF" ]]; then
    echo -e "${RED}No differences found between 'main' and current branch '${CURRENT_BRANCH}'.${NC}"
    exit 1
fi

# Create the prompt
PROMPT="You are a helpful assistant that generates pull request titles and descriptions based on git diffs.

Analyze the following git diff and generate:
1. A concise PR title (max 72 characters)
2. A PR description that:
   - Starts with a brief summary (~50 characters) explaining the main purpose
   - Followed by bullet points detailing the key changes
   - Uses clear, professional language

## Git Diff (comparing branch '${CURRENT_BRANCH}' to 'main'):

\`\`\`diff
${DIFF}
\`\`\`

## Expected Response Format:

Please provide your response in exactly this format:

### PR Title:
\`\`\`
<your title here>
\`\`\`

### PR Description:
\`\`\`
<brief ~50 char summary>

- <bullet point 1>
- <bullet point 2>
- ...
\`\`\`"

# Copy to clipboard (macOS)
echo "$PROMPT" | pbcopy

echo -e "${GREEN}✅ PR prompt has been copied to your clipboard!${NC}"
echo ""
echo "Paste it into your preferred LLM (ChatGPT, Claude, etc.) to generate your PR title and description."
