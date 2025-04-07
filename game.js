class SudokuGame {
    constructor() {
        this.board = [];
        this.solution = [];
        this.selectedCell = null;
        this.difficulty = 'easy';
        this.level = 1;
        this.userFilled = Array(9).fill().map(() => Array(9).fill(false));
        this.timer = null;
        this.seconds = 0;
        this.isPaused = false;
        this.hints = 3; // Start with 3 hints
        this.initializeGame();
    }

    initializeGame() {
        this.setupEventListeners();
        this.loadLevels();
        this.newGame();
    }

    setupEventListeners() {
        document.getElementById('difficulty').addEventListener('change', (e) => {
            this.difficulty = e.target.value;
            this.loadLevels();
        });

        document.getElementById('level').addEventListener('change', (e) => {
            this.level = parseInt(e.target.value);
            this.newGame();
        });

        document.getElementById('newGame').addEventListener('click', () => this.newGame());

        document.querySelectorAll('.num-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (this.selectedCell) {
                    const number = parseInt(btn.dataset.number);
                    this.makeMove(number);
                }
            });
        });

        document.getElementById('pause').addEventListener('click', () => this.togglePause());
        document.getElementById('hint').addEventListener('click', () => this.showHint());
        document.getElementById('resumeButton').addEventListener('click', () => this.togglePause());
    }

    loadLevels() {
        const levelSelect = document.getElementById('level');
        levelSelect.innerHTML = '';
        for (let i = 1; i <= 100; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `Màn ${i}`;
            levelSelect.appendChild(option);
        }
    }

    generatePuzzle() {
        this.solution = this.generateSolution();
        this.board = this.copyBoard(this.solution);
        this.userFilled = Array(9).fill().map(() => Array(9).fill(false));

        const cellsToRemove = {
            'easy': 30,
            'medium': 40,
            'hard': 50
        }[this.difficulty];

        this.removeNumbers(cellsToRemove);
    }

    generateSolution() {
        let board = Array(9).fill().map(() => Array(9).fill(0));
        this.solveSudoku(board);
        return board;
    }

    solveSudoku(board) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (board[row][col] === 0) {
                    for (let num = 1; num <= 9; num++) {
                        if (this.isValid(board, row, col, num)) {
                            board[row][col] = num;
                            if (this.solveSudoku(board)) {
                                return true;
                            }
                            board[row][col] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    isValid(board, row, col, num) {
        for (let x = 0; x < 9; x++) {
            if (board[row][x] === num) return false;
        }

        for (let x = 0; x < 9; x++) {
            if (board[x][col] === num) return false;
        }

        let startRow = row - row % 3;
        let startCol = col - col % 3;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[i + startRow][j + startCol] === num) return false;
            }
        }

        return true;
    }

    removeNumbers(count) {
        let removed = 0;
        while (removed < count) {
            const row = Math.floor(Math.random() * 9);
            const col = Math.floor(Math.random() * 9);
            if (this.board[row][col] !== 0) {
                this.board[row][col] = 0;
                removed++;
            }
        }
    }

    renderBoard() {
        const boardElement = document.getElementById('board');
        boardElement.innerHTML = '';

        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                if (this.board[i][j] !== 0) {
                    cell.textContent = this.board[i][j];
                    if (!this.userFilled[i][j]) {
                        cell.classList.add('fixed');
                    } else {
                        cell.classList.add('user-filled');
                    }
                }

                cell.addEventListener('click', () => this.selectCell(i, j));
                boardElement.appendChild(cell);
            }
        }
    }

    selectCell(row, col) {
        if (this.board[row][col] === 0 || this.userFilled[row][col]) {
            document.querySelectorAll('.cell').forEach(cell => cell.classList.remove('selected'));
            const index = row * 9 + col;
            document.querySelectorAll('.cell')[index].classList.add('selected');
            this.selectedCell = { row, col };
        }
    }

    makeMove(number) {
        if (!this.selectedCell || this.isPaused) return;

        const { row, col } = this.selectedCell;
        if (number === 0) {
            if (this.userFilled[row][col]) {
                this.board[row][col] = 0;
                this.userFilled[row][col] = false;
            }
        } else if (this.isValid(this.board, row, col, number)) {
            this.board[row][col] = number;
            this.userFilled[row][col] = true;
            if (this.checkWin()) {
                clearInterval(this.timer);
                setTimeout(() => this.showCompletionModal(), 100);
            }
        }
        this.renderBoard();
        this.selectedCell = null;
    }

    checkWin() {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (this.board[i][j] !== this.solution[i][j]) {
                    return false;
                }
            }
        }
        return true;
    }

    copyBoard(board) {
        return board.map(row => [...row]);
    }

    newGame() {
        this.generatePuzzle();
        this.renderBoard();
        this.selectedCell = null;
        this.hints = 3;
        document.getElementById('hintsLeft').textContent = this.hints;
        this.isPaused = false;
        this.startTimer();
    }

    startTimer() {
        this.seconds = 0;
        this.updateTimerDisplay();
        clearInterval(this.timer);
        this.timer = setInterval(() => {
            if (!this.isPaused) {
                this.seconds++;
                this.updateTimerDisplay();
            }
        }, 1000);
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.seconds / 60);
        const remainingSeconds = this.seconds % 60;
        const display = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        document.querySelector('#timer span').textContent = display;
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        if (this.isPaused) {
            this.showPauseModal();
        } else {
            document.getElementById('pauseModal').style.display = 'none';
        }
    }

    showPauseModal() {
        const modal = document.getElementById('pauseModal');
        modal.style.display = 'flex';
    }

    showHint() {
        if (this.hints <= 0) {
            alert('Bạn đã hết lượt gợi ý!');
            return;
        }

        let emptyCells = [];
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (this.board[i][j] === 0 || this.board[i][j] !== this.solution[i][j]) {
                    emptyCells.push({ row: i, col: j });
                }
            }
        }

        if (emptyCells.length === 0) return;

        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        this.board[randomCell.row][randomCell.col] = this.solution[randomCell.row][randomCell.col];
        this.userFilled[randomCell.row][randomCell.col] = true;
        this.hints--;
        document.getElementById('hintsLeft').textContent = this.hints;
        this.renderBoard();
    }

    showCompletionModal() {
        const modal = document.getElementById('completionModal');
        const timeDisplay = document.getElementById('completionTime');
        const minutes = Math.floor(this.seconds / 60);
        const remainingSeconds = this.seconds % 60;
        timeDisplay.textContent = `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
        modal.style.display = 'flex';
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new SudokuGame();
});
