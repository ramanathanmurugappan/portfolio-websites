# Add Homebrew's executable directory to the front of the PATH
export PATH=/usr/local/bin:${PATH}
export PATH=/Users/ram/desktop/flutter/bin:${PATH}
export PATH=/usr/local/bin:$PATH
# >>> conda initialize >>>
# !! Contents within this block are managed by 'conda init' !!
__conda_setup="$('/opt/anaconda3/bin/conda' 'shell.zsh' 'hook' 2> /dev/null)"
if [ $? -eq 0 ]; then
    eval "$__conda_setup"
else
    if [ -f "/opt/anaconda3/etc/profile.d/conda.sh" ]; then
        . "/opt/anaconda3/etc/profile.d/conda.sh"
    else
        export PATH="/opt/anaconda3/bin:$PATH"
    fi
fi
unset __conda_setup
# <<< conda initialize <<<

# export PATH="/usr/local/anaconda3/bin:$PATH"  # commented out by conda initialize
export JAVA_HOME=/opt/homebrew/opt/adoptopenjdk@16.0.1/Contents/Home

alias docker="/Applications/Docker.app/Contents/Resources/bin/docker"


# Load Angular CLI autocompletion.
source <(ng completion script)

. "$HOME/.grit/bin/env"

# Added by Windsurf
export PATH="/Users/ram/.codeium/windsurf/bin:$PATH"

. "$HOME/.local/bin/env"

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
