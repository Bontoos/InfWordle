class WordleGame {
    constructor() {
        this.premiumManager = new PremiumManager();
        this.currentMode = this.getModeFromURL() || 5;
        this.targetWord = null;
        this.currentRow = 0;
        this.currentCol = 0;
        this.gameOver = false;
        this.maxGuesses = 6;
        this.wordLength = this.currentMode;
        this.isInitializing = true;
        this.isSubmitting = false;
        
        this.gameBoard = document.getElementById('gameBoard');
        this.keyboard = document.getElementById('keyboard');
        this.message = document.getElementById('message');
        this.newGameBtn = document.getElementById('newGameBtn');
        this.modeSelector = document.getElementById('modeSelector');
        this.modeDropdown = document.getElementById('modeDropdown');
        
        this.initializeGame();
    }
    
    async initializeGame() {
        this.isInitializing = true;
        this.showMessage('Loading game...');
        
        // Debug: Check if elements exist
        console.log('Game elements check:', {
            gameBoard: !!this.gameBoard,
            keyboard: !!this.keyboard,
            message: !!this.message,
            newGameBtn: !!this.newGameBtn,
            modeSelector: !!this.modeSelector,
            modeDropdown: !!this.modeDropdown
        });
        
        // Remove premium check - all modes are now free
        await this.setNewTargetWord();
        
        this.createGameBoard();
        this.createKeyboard();
        this.setupEventListeners();
        this.updateModeSelector();
        
        this.isInitializing = false;
        this.showMessage('');
        console.log('Target word:', this.targetWord);
        console.log('Game initialized. Current state:', {
            currentMode: this.currentMode,
            wordLength: this.wordLength,
            currentRow: this.currentRow,
            currentCol: this.currentCol,
            gameOver: this.gameOver,
            isInitializing: this.isInitializing
        });
    }
    
    async setNewTargetWord() {
        try {
            this.targetWord = await wordService.getRandomWord(this.currentMode);
            if (!this.targetWord || this.targetWord.length !== this.currentMode) {
                throw new Error('Invalid word length');
            }
        } catch (error) {
            console.error('Error setting target word:', error);
            this.targetWord = this.generateFallbackWord(this.currentMode);
        }
    }
    
    generateFallbackWord(length) {
        const wordLists = {
            5: ['ABOUT', 'ABOVE', 'ABUSE', 'ACTOR', 'ACUTE', 'ADMIT', 'ADOPT', 'ADULT', 'AFTER', 'AGAIN'],
            6: ['ABSORB', 'ACCEPT', 'ACCESS', 'ACROSS', 'ACTION', 'ACTIVE', 'ACTUAL', 'ADVICE', 'AFFECT', 'AFFORD'],
            7: ['ABILITY', 'ABSENCE', 'ACADEMY', 'ACCOUNT', 'ACCUSED', 'ACHIEVE', 'ACQUIRE', 'ADDRESS', 'ADVANCE', 'ADVISER'],
            8: ['ABSOLUTE', 'ABSTRACT', 'ACADEMIC', 'ACCEPTED', 'ACCIDENT', 'ACCURATE', 'ACHIEVED', 'ACTIVATE', 'ACTIVITY', 'ACTUALLY'],
            12: ['ABBREVIATION', 'ACCELERATION', 'ACCIDENTALLY', 'ACCOMPANYING', 'ACCOMPLISHED', 'ACCUMULATION', 'ACKNOWLEDGED', 'ACQUAINTANCE', 'ADVANTAGEOUS', 'ANNOUNCEMENT']
        };
        
        const words = wordLists[length] || wordLists[5];
        return words[Math.floor(Math.random() * words.length)];
    }
    
    getModeFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const mode = urlParams.get('mode');
        if (mode) {
            const modeNumber = mode.includes('-') ? parseInt(mode.split('-')[0]) : parseInt(mode);
            return modeNumber && [5, 6, 7, 8, 12].includes(modeNumber) ? modeNumber : 5;
        }
        return 5;
    }
    
    // Remove premium access check - all modes are now free
    checkPremiumAccess() {
        return true; // Always return true - all modes are free
    }
    
    updateModeSelector() {
        if (this.modeSelector) {
            this.modeSelector.textContent = `${this.currentMode} Letters ▼`;
        }
        
        if (this.modeDropdown) {
            const options = this.modeDropdown.querySelectorAll('.mode-option');
            options.forEach(option => {
                const mode = parseInt(option.dataset.mode);
                
                // Reset classes and remove premium restrictions
                option.classList.remove('disabled', 'unlocked', 'current', 'premium');
                
                if (mode === this.currentMode) {
                    option.classList.add('current');
                }
                // All modes are now available - no premium checks needed
            });
        }
    }
    
    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            if (this.isInitializing || this.isSubmitting) return;
            
            const key = e.key.toUpperCase();
            
            if (key === 'ENTER') {
                e.preventDefault();
                this.handleKeyPress('ENTER');
            } else if (key === 'BACKSPACE') {
                e.preventDefault();
                this.handleKeyPress('BACKSPACE');
            } else if (key.match(/^[A-Z]$/) && key.length === 1) {
                e.preventDefault();
                this.handleKeyPress(key);
            }
        });
        
        // New game button
        if (this.newGameBtn) {
            this.newGameBtn.addEventListener('click', () => {
                this.startNewGame();
            });
        }
        
        // Mode selector
        if (this.modeSelector) {
            this.modeSelector.addEventListener('click', (e) => {
                e.stopPropagation();
                if (this.modeDropdown) {
                    this.modeDropdown.classList.toggle('show');
                }
            });
        }
        
        // Mode dropdown
        if (this.modeDropdown) {
            this.modeDropdown.addEventListener('click', (e) => {
                e.stopPropagation();
                const option = e.target.closest('.mode-option');
                if (option && !option.classList.contains('current')) {
                    const newMode = parseInt(option.dataset.mode);
                    this.switchMode(newMode);
                }
            });
        }
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (this.modeDropdown && !this.modeSelector.contains(e.target)) {
                this.modeDropdown.classList.remove('show');
            }
        });
    }
    
    async switchMode(newMode) {
        if (this.isInitializing || newMode === this.currentMode) return;
        
        // Remove premium access check - all modes are free now
        
        this.isInitializing = true;
        this.showMessage('Switching mode...');
        
        // Reset game state
        this.currentMode = newMode;
        this.wordLength = newMode;
        this.currentRow = 0;
        this.currentCol = 0;
        this.gameOver = false;
        
        // Set new target word
        await this.setNewTargetWord();
        
        // Update UI
        this.updateModeSelector();
        this.createGameBoard();
        this.resetKeyboard();
        
        // Close dropdown
        if (this.modeDropdown) {
            this.modeDropdown.classList.remove('show');
        }
        
        this.isInitializing = false;
        this.showMessage('');
        console.log('Switched to', newMode, 'letters. New target:', this.targetWord);
    }
    
    createGameBoard() {
        if (!this.gameBoard) {
            console.error('Game board element not found!');
            return;
        }
        
        this.gameBoard.innerHTML = '';
        
        // Add CSS custom property for grid columns
        this.gameBoard.style.setProperty('--word-length', this.wordLength);
        
        for (let row = 0; row < this.maxGuesses; row++) {
            const rowElement = document.createElement('div');
            rowElement.className = 'row';
            
            for (let col = 0; col < this.wordLength; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.id = `cell-${row}-${col}`;
                rowElement.appendChild(cell);
            }
            
            this.gameBoard.appendChild(rowElement);
        }
        
        console.log(`Created game board: ${this.maxGuesses} rows x ${this.wordLength} columns`);
    }

    createKeyboard() {
        if (!this.keyboard) {
            console.error('Keyboard element not found!');
            return;
        }
        
        const keyboardLayout = [
            ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
            ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
            ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
        ];
        
        this.keyboard.innerHTML = '';
        keyboardLayout.forEach(row => {
            const rowElement = document.createElement('div');
            rowElement.className = 'keyboard-row';
            
            row.forEach(key => {
                const keyElement = document.createElement('button');
                keyElement.className = 'key';
                keyElement.textContent = key === 'BACKSPACE' ? '⌫' : key;
                keyElement.dataset.key = key;
                
                if (key === 'ENTER' || key === 'BACKSPACE') {
                    keyElement.classList.add('special-key');
                }
                
                keyElement.addEventListener('click', () => this.handleKeyPress(key));
                rowElement.appendChild(keyElement);
            });
            
            this.keyboard.appendChild(rowElement);
        });
        
        console.log('Created keyboard');
    }
    
    resetKeyboard() {
        const keys = document.querySelectorAll('.key');
        keys.forEach(key => {
            key.classList.remove('correct', 'present', 'absent');
        });
    }
    
    handleKeyPress(key) {
        if (this.gameOver || this.isInitializing || this.isSubmitting) {
            console.log('Key press blocked:', { 
                key, 
                gameOver: this.gameOver, 
                isInitializing: this.isInitializing, 
                isSubmitting: this.isSubmitting 
            });
            return;
        }
        
        console.log('Key pressed:', key, 'Current position:', this.currentRow, this.currentCol);
        
        if (key === 'ENTER') {
            this.submitGuess();
        } else if (key === 'BACKSPACE') {
            this.deleteLetter();
        } else if (this.currentCol < this.wordLength && key.match(/^[A-Z]$/)) {
            this.addLetter(key);
        }
    }
    
    addLetter(letter) {
        if (this.currentCol < this.wordLength && !this.gameOver) {
            const cell = document.getElementById(`cell-${this.currentRow}-${this.currentCol}`);
            if (cell) {
                console.log(`Adding letter ${letter} to cell ${this.currentRow}-${this.currentCol}`);
                cell.textContent = letter;
                cell.classList.add('filled');
                this.currentCol++;
            } else {
                console.error(`Cell not found: cell-${this.currentRow}-${this.currentCol}`);
            }
        } else {
            console.log('Cannot add letter:', {
                currentCol: this.currentCol,
                wordLength: this.wordLength,
                gameOver: this.gameOver
            });
        }
    }
    
    deleteLetter() {
        if (this.currentCol > 0 && !this.gameOver) {
            this.currentCol--;
            const cell = document.getElementById(`cell-${this.currentRow}-${this.currentCol}`);
            if (cell) {
                console.log(`Deleting letter from cell ${this.currentRow}-${this.currentCol}`);
                cell.textContent = '';
                cell.classList.remove('filled');
            }
        }
    }
    
    getCurrentGuess() {
        let guess = '';
        for (let col = 0; col < this.wordLength; col++) {
            const cell = document.getElementById(`cell-${this.currentRow}-${col}`);
            guess += cell ? cell.textContent : '';
        }
        return guess;
    }
    
    async submitGuess() {
        if (this.isSubmitting || this.gameOver) return;
        
        if (this.currentCol !== this.wordLength) {
            this.showMessage('Not enough letters!', 'error');
            this.shakeRow();
            return;
        }
        
        const guess = this.getCurrentGuess();
        console.log('Submitting guess:', guess);
        this.isSubmitting = true;
        
        // Only validate 5-letter words strictly, be more lenient for others
        if (this.currentMode === 5) {
            const isValid = await wordService.isValidWord(guess);
            if (!isValid) {
                this.showMessage('Word not in list!', 'error');
                this.shakeRow();
                this.isSubmitting = false;
                return;
            }
        }
        
        this.checkGuess(guess);
        this.currentRow++;
        this.currentCol = 0;
        
        if (guess === this.targetWord) {
            this.gameOver = true;
            this.showMessage('Congratulations! 🎉', 'success');
        } else if (this.currentRow >= this.maxGuesses) {
            this.gameOver = true;
            this.showMessage(`Game Over! The word was: ${this.targetWord}`, 'error');
        }
        
        this.isSubmitting = false;
    }
    
    checkGuess(guess) {
        const targetArray = this.targetWord.split('');
        const guessArray = guess.split('');
        const result = new Array(this.wordLength).fill('absent');
        const targetUsed = new Array(this.wordLength).fill(false);
        
        // First pass: mark correct letters
        for (let i = 0; i < this.wordLength; i++) {
            if (guessArray[i] === targetArray[i]) {
                result[i] = 'correct';
                targetUsed[i] = true;
            }
        }
        
                // Second pass: mark present letters
        for (let i = 0; i < this.wordLength; i++) {
            if (result[i] === 'absent') {
                for (let j = 0; j < this.wordLength; j++) {
                    if (!targetUsed[j] && guessArray[i] === targetArray[j]) {
                        result[i] = 'present';
                        targetUsed[j] = true;
                        break;
                    }
                }
            }
        }
        
        // Apply colors to cells and keyboard
        for (let i = 0; i < this.wordLength; i++) {
            const cell = document.getElementById(`cell-${this.currentRow}-${i}`);
            const keyElement = document.querySelector(`[data-key="${guessArray[i]}"]`);
            
            if (cell) {
                cell.classList.add(result[i]);
            }
            
            if (keyElement) {
                // Only update keyboard color if it's not already correct
                if (!keyElement.classList.contains('correct')) {
                    if (result[i] === 'correct') {
                        keyElement.classList.remove('present', 'absent');
                        keyElement.classList.add('correct');
                    } else if (result[i] === 'present' && !keyElement.classList.contains('present')) {
                        keyElement.classList.remove('absent');
                        keyElement.classList.add('present');
                    } else if (result[i] === 'absent' && !keyElement.classList.contains('present')) {
                        keyElement.classList.add('absent');
                    }
                }
            }
        }
    }
    
    shakeRow() {
        const row = document.querySelector(`#gameBoard .row:nth-child(${this.currentRow + 1})`);
        if (row) {
            row.classList.add('shake');
            setTimeout(() => {
                row.classList.remove('shake');
            }, 600);
        }
    }
    
    showMessage(text, type = '') {
        if (this.message) {
            this.message.textContent = text;
            this.message.className = `message ${type}`;
            
            if (text && type !== 'info') {
                setTimeout(() => {
                    if (this.message.textContent === text) {
                        this.message.textContent = '';
                        this.message.className = 'message';
                    }
                }, 3000);
            }
        }
    }
    
    async startNewGame() {
        if (this.isInitializing) return;
        
        this.isInitializing = true;
        this.showMessage('Starting new game...');
        
        // Reset game state
        this.currentRow = 0;
        this.currentCol = 0;
        this.gameOver = false;
        this.isSubmitting = false;
        
        // Get new target word
        await this.setNewTargetWord();
        
        // Reset board
        this.createGameBoard();
        this.resetKeyboard();
        
        this.isInitializing = false;
        this.showMessage('');
        console.log('New game started. Target word:', this.targetWord);
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing game...');
    
    // Check if all required elements exist
    const requiredElements = ['gameBoard', 'keyboard', 'message', 'newGameBtn'];
    const missingElements = requiredElements.filter(id => !document.getElementById(id));
    
    if (missingElements.length > 0) {
        console.error('Missing required elements:', missingElements);
        return;
    }
    
    // Wait a bit for word service to initialize
    setTimeout(() => {
        // Initialize the game
        window.game = new WordleGame();
        console.log('Game instance created:', window.game);
    }, 100);
});

// Legacy functions for backward compatibility
async function getRandomWord() {
    return await wordService.getRandomWord(5);
}

async function isValidWord(word) {
    return await wordService.isValidWord(word);
}

// Game over screen functions
function showGameOverScreen(won, targetWord, attempts) {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'game-over-overlay';
    overlay.innerHTML = `
        <div class="game-over-modal">
            <div class="game-over-header">
                <h2>${won ? '🎉 You Win!' : '😞 Game Over'}</h2>
            </div>
            <div class="game-over-content">
                <p class="target-word">The word was: <strong>${targetWord}</strong></p>
                ${won ? 
                    `<p class="win-message">Congratulations! You solved it in ${attempts} attempt${attempts === 1 ? '' : 's'}!</p>` :
                    `<p class="lose-message">Better luck next time!</p>`
                }
                <div class="game-over-stats">
                    <div class="stat">
                        <span class="stat-label">Attempts Used:</span>
                        <span class="stat-value">${attempts}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Word Length:</span>
                        <span class="stat-value">${targetWord.length} letters</span>
                    </div>
                </div>
            </div>
            <div class="game-over-actions">
                <button class="btn btn-primary" onclick="startNewGame()">Play Again</button>
                <button class="btn btn-secondary" onclick="closeGameOverScreen()">Close</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Add click outside to close
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeGameOverScreen();
        }
    });
    
    // Add escape key to close
    document.addEventListener('keydown', handleGameOverKeyPress);
}

function closeGameOverScreen() {
    const overlay = document.querySelector('.game-over-overlay');
    if (overlay) {
        overlay.remove();
    }
    document.removeEventListener('keydown', handleGameOverKeyPress);
}

function handleGameOverKeyPress(e) {
    if (e.key === 'Escape') {
        closeGameOverScreen();
    } else if (e.key === 'Enter') {
        startNewGame();
    }
}

function startNewGame() {
    closeGameOverScreen();
    // Use the game instance's startNewGame method
    if (window.game) {
        window.game.startNewGame();
    }
}

