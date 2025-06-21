class CheckersGame {
    constructor() {
        this.board = this.initializeBoard();
        this.currentPlayer = 'red'; // 'red' or 'black'
        this.gameOver = false;
        this.score = { red: 0, black: 0 };
    }

    initializeBoard() {
        const board = [];
        for (let row = 0; row < 8; row++) {
            board[row] = [];
            for (let col = 0; col < 8; col++) {
                if ((row + col) % 2 === 1) {
                    if (row < 3) {
                        board[row][col] = 'black';
                    } else if (row > 4) {
                        board[row][col] = 'red';
                    } else {
                        board[row][col] = null;
                    }
                } else {
                    board[row][col] = null;
                }
            }
        }
        return board;
    }

    isValidMove(fromRow, fromCol, toRow, toCol) {
        // Check if positions are within bounds
        if (fromRow < 0 || fromRow >= 8 || fromCol < 0 || fromCol >= 8 ||
            toRow < 0 || toRow >= 8 || toCol < 0 || toCol >= 8) {
            return false;
        }

        // Check if source has a piece and destination is empty
        if (!this.board[fromRow][fromCol] || this.board[toRow][toCol]) {
            return false;
        }

        // Check if it's the correct player's turn
        const piece = this.board[fromRow][fromCol];
        if (!piece.startsWith(this.currentPlayer)) {
            return false;
        }

        const rowDiff = toRow - fromRow;
        const colDiff = Math.abs(toCol - fromCol);

        // Regular move (diagonal, one step)
        if (colDiff === 1) {
            if (this.currentPlayer === 'red' && rowDiff === -1) {
                return true;
            }
            if (this.currentPlayer === 'black' && rowDiff === 1) {
                return true;
            }
            // King moves
            if (piece.includes('king') && Math.abs(rowDiff) === 1) {
                return true;
            }
        }

        // Jump move (diagonal, two steps)
        if (colDiff === 2) {
            const jumpRow = fromRow + rowDiff / 2;
            const jumpCol = fromCol + (toCol - fromCol) / 2;
            
            if (Math.abs(rowDiff) === 2) {
                const jumpedPiece = this.board[jumpRow][jumpCol];
                if (jumpedPiece && !jumpedPiece.startsWith(this.currentPlayer)) {
                    if (this.currentPlayer === 'red' && rowDiff === -2) {
                        return true;
                    }
                    if (this.currentPlayer === 'black' && rowDiff === 2) {
                        return true;
                    }
                    // King jump
                    if (piece.includes('king')) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    makeMove(fromRow, fromCol, toRow, toCol) {
        if (!this.isValidMove(fromRow, fromCol, toRow, toCol)) {
            return false;
        }

        // Move the piece
        this.board[toRow][toCol] = this.board[fromRow][fromCol];
        this.board[fromRow][fromCol] = null;

        // Handle jump (capture)
        const rowDiff = toRow - fromRow;
        
        if (Math.abs(rowDiff) === 2) {
            const jumpRow = fromRow + rowDiff / 2;
            const jumpCol = fromCol + (toCol - fromCol) / 2;
            this.board[jumpRow][jumpCol] = null; // Remove captured piece
            this.score[this.currentPlayer]++; // Increment score
        }

        // Check for king promotion
        if (this.currentPlayer === 'red' && toRow === 0) {
            this.board[toRow][toCol] = 'red-king';
        } else if (this.currentPlayer === 'black' && toRow === 7) {
            this.board[toRow][toCol] = 'black-king';
        }

        // Switch players
        this.currentPlayer = this.currentPlayer === 'red' ? 'black' : 'red';

        // Check for game over
        this.checkGameOver();

        return true;
    }

    checkGameOver() {
        let redPieces = 0;
        let blackPieces = 0;

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.startsWith('red')) {
                    redPieces++;
                } else if (piece && piece.startsWith('black')) {
                    blackPieces++;
                }
            }
        }

        if (redPieces === 0) {
            this.gameOver = true;
            this.winner = 'black';
        } else if (blackPieces === 0) {
            this.gameOver = true;
            this.winner = 'red';
        }
    }

    getBoard() {
        return this.board;
    }

    getCurrentPlayer() {
        return this.currentPlayer;
    }

    isGameOver() {
        return this.gameOver;
    }

    getWinner() {
        return this.winner;
    }

    getScore() {
        return this.score;
    }

    resetGame() {
        this.board = this.initializeBoard();
        this.currentPlayer = 'red';
        this.gameOver = false;
        this.winner = null;
        this.score = { red: 0, black: 0 };
    }

    findAIMove() {
        const player = 'black';
        let possibleMoves = [];

        // Find all pieces for the current player
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.startsWith(player)) {
                    // Check for possible moves from this piece's position
                    // Jumps first
                    for (let dRow of [-2, 2]) {
                        for (let dCol of [-2, 2]) {
                            const toRow = row + dRow;
                            const toCol = col + dCol;
                            if (this.isValidMove(row, col, toRow, toCol)) {
                                possibleMoves.push({ fromRow: row, fromCol: col, toRow, toCol, isJump: true });
                            }
                        }
                    }
                     // Regular moves
                     for (let dRow of [-1, 1]) {
                        for (let dCol of [-1, 1]) {
                            const toRow = row + dRow;
                            const toCol = col + dCol;
                            if (this.isValidMove(row, col, toRow, toCol)) {
                                possibleMoves.push({ fromRow: row, fromCol: col, toRow, toCol, isJump: false });
                            }
                        }
                    }
                }
            }
        }

        if (possibleMoves.length === 0) {
            return null;
        }

        // Prioritize jumps
        const jumpMoves = possibleMoves.filter(move => move.isJump);
        if (jumpMoves.length > 0) {
            return jumpMoves[Math.floor(Math.random() * jumpMoves.length)];
        }

        // Otherwise, return a random regular move
        const regularMoves = possibleMoves.filter(move => !move.isJump);
         if (regularMoves.length > 0) {
            return regularMoves[Math.floor(Math.random() * regularMoves.length)];
        }
        return null;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const game = new CheckersGame();
    const boardElement = document.getElementById('board');
    const currentPlayerElement = document.getElementById('current-player');
    const winnerInfoElement = document.getElementById('winner-info');
    const winnerElement = document.getElementById('winner');
    const resetButton = document.getElementById('reset-button');
    const redScoreElement = document.getElementById('red-score');
    const blackScoreElement = document.getElementById('black-score');

    let selectedPiece = null; // { row: r, col: c }
    let isPlayerTurn = true;

    function createBoardUI() {
        boardElement.innerHTML = '';
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.classList.add('square');
                square.classList.add((row + col) % 2 === 0 ? 'light' : 'dark');
                square.dataset.row = row;
                square.dataset.col = col;

                const pieceData = game.getBoard()[row][col];
                if (pieceData) {
                    const pieceElement = document.createElement('div');
                    pieceElement.classList.add('piece');
                    if (pieceData.includes('red')) {
                        pieceElement.classList.add('red');
                    } else {
                        pieceElement.classList.add('black');
                    }
                    if (pieceData.includes('king')) {
                        pieceElement.classList.add('king');
                    }
                    square.appendChild(pieceElement);
                }
                boardElement.appendChild(square);
            }
        }
        updateGameInfo();
    }

    function handleSquareClick(e) {
        if (game.isGameOver()) return;

        const square = e.target.closest('.square');
        if (!square) return;

        const row = parseInt(square.dataset.row);
        const col = parseInt(square.dataset.col);
        const pieceData = game.getBoard()[row][col];

        if (selectedPiece) {
            const fromRow = selectedPiece.row;
            const fromCol = selectedPiece.col;

            // Try to make a move
            if (isPlayerTurn && game.makeMove(fromRow, fromCol, row, col)) {
                selectedPiece = null;
                removePossibleMoveHighlights();
                createBoardUI();
                // Remove all visual selections
                document.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
                
                // Trigger AI move
                if (!game.isGameOver() && game.getCurrentPlayer() === 'black') {
                    isPlayerTurn = false;
                    setTimeout(triggerAIMove, 500);
                }
            } else {
                // If the click is on another of the player's own pieces, select it instead
                if (pieceData && pieceData.startsWith(game.getCurrentPlayer())) {
                    // Remove previous selection
                    const prevSelectedSquare = boardElement.querySelector(`.square[data-row='${fromRow}'][data-col='${fromCol}']`);
                    if(prevSelectedSquare && prevSelectedSquare.firstChild) {
                        prevSelectedSquare.firstChild.classList.remove('selected');
                    }
                    removePossibleMoveHighlights();
                    
                    selectedPiece = { row, col };
                    // Add new visual selection
                    if (square.firstChild) {
                        square.firstChild.classList.add('selected');
                        highlightPossibleMoves(row, col);
                    }
                } else {
                    // Invalid move, deselect
                    const prevSelectedSquare = boardElement.querySelector(`.square[data-row='${fromRow}'][data-col='${fromCol}']`);
                     if(prevSelectedSquare && prevSelectedSquare.firstChild) {
                        prevSelectedSquare.firstChild.classList.remove('selected');
                    }
                    selectedPiece = null;
                    removePossibleMoveHighlights();
                }
            }
        } else {
            // If no piece is selected, select the clicked piece if it belongs to the current player
            if (pieceData && pieceData.startsWith(game.getCurrentPlayer())) {
                selectedPiece = { row, col };
                // Add visual selection
                if (square.firstChild) {
                    square.firstChild.classList.add('selected');
                    highlightPossibleMoves(row, col);
                }
            }
        }
    }

    function highlightPossibleMoves(fromRow, fromCol) {
        for (let toRow = 0; toRow < 8; toRow++) {
            for (let toCol = 0; toCol < 8; toCol++) {
                if (game.isValidMove(fromRow, fromCol, toRow, toCol)) {
                    const square = boardElement.querySelector(`.square[data-row='${toRow}'][data-col='${toCol}']`);
                    if (square) {
                        square.classList.add('possible-move');
                    }
                }
            }
        }
    }

    function removePossibleMoveHighlights() {
        document.querySelectorAll('.possible-move').forEach(el => el.classList.remove('possible-move'));
    }

    function updateGameInfo() {
        currentPlayerElement.textContent = game.getCurrentPlayer().charAt(0).toUpperCase() + game.getCurrentPlayer().slice(1);
        
        const score = game.getScore();
        redScoreElement.textContent = score.red;
        blackScoreElement.textContent = score.black;

        if (game.isGameOver()) {
            winnerInfoElement.style.display = 'block';
            winnerElement.textContent = game.getWinner().charAt(0).toUpperCase() + game.getWinner().slice(1);
        } else {
            winnerInfoElement.style.display = 'none';
        }
    }

    function resetAndRender() {
        game.resetGame();
        createBoardUI();
        isPlayerTurn = true;
    }

    function triggerAIMove() {
        const aiMove = game.findAIMove();
        if (aiMove) {
            game.makeMove(aiMove.fromRow, aiMove.fromCol, aiMove.toRow, aiMove.toCol);
            createBoardUI();
        }
        isPlayerTurn = true;
    }

    boardElement.addEventListener('click', handleSquareClick);
    resetButton.addEventListener('click', resetAndRender);

    createBoardUI();
});

// Example usage:
// const game = new CheckersGame();
// game.makeMove(5, 0, 4, 1); // Move red piece
// game.makeMove(2, 1, 3, 0); // Move black piece
