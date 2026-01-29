#!/bin/bash

# Script to generate a PR prompt with git diff for LLM-based PR title and description generation

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to copy to clipboard based on OS
copy_to_clipboard() {
    local content="$1"
    
    if command -v pbcopy &> /dev/null; then
        # macOS
        echo "$content" | pbcopy
    elif command -v xclip &> /dev/null; then
        # Linux with xclip
        echo "$content" | xclip -selection clipboard
    elif command -v xsel &> /dev/null; then
        # Linux with xsel
        echo "$content" | xsel --clipboard --input
    elif command -v clip.exe &> /dev/null; then
        # Windows (WSL or Git Bash)
        echo "$content" | clip.exe
    else
        echo -e "${RED}Error: No clipboard utility found.${NC}"
        echo "Please install one of the following:"
        echo "  - macOS: pbcopy (built-in)"
        echo "  - Linux: xclip or xsel"
        echo "  - Windows WSL: clip.exe (built-in)"
        echo ""
        echo "Alternatively, the prompt has been saved to: /tmp/pr-prompt.txt"
        echo "$content" > /tmp/pr-prompt.txt
        return 1
    fi
    return 0
}

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

# Handle detached HEAD (git branch --show-current returns empty)
if [[ -z "$CURRENT_BRANCH" ]]; then
    echo -e "${RED}Error: You are in a detached HEAD state. Please check out a branch before running this script.${NC}"
    exit 1
fi
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
1. A concise PR title (max 72 characters) in conventional commit format:
   - Must start with a type: feat, fix, refactor, chore, docs, style, test, perf, ci, build
   - Optionally include a scope in parentheses: feat(api), fix(auth), refactor(utils)
   - Examples: 'feat: add user authentication', 'fix(api): handle null response', 'refactor(utils): simplify date parsing'
2. A PR description that:
   - Starts with a brief summary (~50 characters) explaining the main purpose
   - Followed by bullet points detailing the key changes
   - Uses clear, professional language

## Git Diff (comparing branch '${CURRENT_BRANCH}' to 'main'):

\`\`\`\`diff
${DIFF}
\`\`\`\`

## Expected Response Format:

Provide the PR title and PR description each in their own separate code block for easy copying."

# Copy to clipboard
if copy_to_clipboard "$PROMPT"; then
    echo -e "${GREEN}✅ PR prompt has been copied to your clipboard!${NC}"
    echo ""
    echo "Paste it into your preferred LLM (ChatGPT, Claude, etc.) to generate your PR title and description."
fi
