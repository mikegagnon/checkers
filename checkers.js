function assert(condition) {
    if (!condition) {
        console.error("Assertion failed");
    }
}

NUM_ROWS = 8;
NUM_COLS = 8;

CAPTURE_DELAY = 700;

MIN_MAX_DEPTH = 4;

EMPTY = 0;

PLAYER_ONE = 1;
PLAYER_ONE_FILENAME = "player-1.png";

PLAYER_TWO = 2;
PLAYER_TWO_FILENAME = "player-2.png";

MAXIMIZING_PLAYER = PLAYER_ONE;
MINIMIZING_PLAYER = PLAYER_TWO;

FIRST_PLAYER = PLAYER_ONE;

HUMAN_PLAYER = PLAYER_ONE; 
COMPUTER_PLAYER = PLAYER_TWO;

/*******************************************************************************
 * Move is the interface between Othello and Viz
 ******************************************************************************/
class Move {
    // valid == true iff the move results in change in game state
    // (row, col) are the coordinates that player added their mark
    // player is either PLAYER_ONE or PLAYER_TWO, depending on who made the move
    // TODO: document captured
    // gameOver is either undefined (which signifies the game has not concluded)
    // or gameOver is a GameOver object, representing the conclusion of the game
    constructor(valid, row, col, player, captured, gameOver) {
        this.valid = valid;
        this.row = row;
        this.col = col;
        this.player = player;
        this.captured = captured;
        this.gameOver = gameOver;
    }
}

/*******************************************************************************
 * GameOver
 ******************************************************************************/
// GameOver objects store information about the end of the game.
class GameOver {

    // There are two fields in a GameOver object:
    //      1. this.victor
    //      2. this.victoryCells
    //
    // this.victor
    // ===========
    // this.victor is equal to one of the following:
    //      (A) undefined
    //      (B) PLAYER_ONE
    //      (C) PLAYER_TWO
    //
    // if this.victor == undefined, then that indicates the game ended in a draw
    // if this.victor == PLAYER_ONE, then that indicates PLAYER_ONE won the game
    // if this.victor == PLAYER_TWO, then that indicates PLAYER_TWO won the game
    //
    // this.count
    // =================
    // this.count[PLAYER_ONE] == the number of pieces that belong to PLAYER_ONE
    // this.count[PLAYER_TWO] == the number of pieces that belong to PLAYER_TWO
    constructor(victor, count) {
        this.victor = victor;
        this.count = count;

        // Make GameOver immutable
        Object.freeze(this);
        Object.freeze(this.count);
    }
}

/*******************************************************************************
 * Othello class
 ******************************************************************************/
class Othello {

    // TODO: use
    static getOpponent(player) {
        if (player == PLAYER_ONE) {
            return PLAYER_TWO;
        } else {
            return PLAYER_ONE;
        }
    }


    // player is either PLAYER_ONE or PLAYER_TWO, and indicates which player has
    // the next move
    constructor(player, numRows, numCols) {

        assert(numRows % 2 == 0);
        assert(numCols % 2 == 0);
        assert(player == PLAYER_ONE || player == PLAYER_TWO);

        this.numRows = numRows;
        this.numCols = numCols;

        this.matrix = new Array(this.numRows);
        for (var row = 0; row < this.numRows; row++) {
            this.matrix[row] = new Array(this.numCols);
            for (var col = 0; col < this.numCols; col++) {
                this.matrix[row][col] = EMPTY;
            }
        }

        // Set the opening moves
        var openingMoves = this.getOpeningMoves();
        for (var i = 0; i < openingMoves.length; i++) {
            var move = openingMoves[i];
            this.matrix[move.row][move.col] = move.player;
        }

        // this.player always equals the player (either PLAYER_ONE or
        // PLAYER_TWO) who has the next move.
        this.player = player;


        // If the game is over, then this.gameOver equals a GameOver object
        // that describes the properties of the conclusion of the game
        // If the game is not over, then this.gameOver is undefined.
        this.gameOver = undefined;
    }

    getOpeningMoves() {
        return [
            new Move(true, this.numRows / 2, this.numCols / 2, PLAYER_ONE, [], undefined),
            new Move(true, this.numRows / 2 - 1, this.numCols / 2 - 1, PLAYER_ONE, [], undefined),
            new Move(true, this.numRows / 2 - 1, this.numCols / 2, PLAYER_TWO, [], undefined),
            new Move(true, this.numRows / 2, this.numCols / 2 - 1, PLAYER_TWO, [], undefined),
        ]
    }

    deepCopy() {
        var newGame = new Othello(this.player, this.numRows, this.numCols);

        for (var row = 0; row < this.numRows; row++) {
            for (var col = 0; col < this.numCols; col++) {
                newGame.matrix[row][col] = this.matrix[row][col];
            }
        }

        // We do not need to make a deepCopy of this.gameOver
        // because this.gameOver is immutable
        newGame.gameOver = this.gameOver;

        return newGame;
    }

    isMoveInvalid(row, col, numCaptured) {
        return this.matrix[row][col] != EMPTY ||
               this.gameOver != undefined ||
               numCaptured == 0;
    }

    getCell(row, col) {
        if (!(row >= 0 && row < this.numRows &&
               col >= 0 && col < this.numCols)) {
            return undefined;
        } else {
            return this.matrix[row][col];
        }
    }

    tryCaptureDrDc(player, row, col, dr, dc) {

        var otherPlayer;

        if (player == PLAYER_ONE) {
            otherPlayer = PLAYER_TWO;
        } else {
            otherPlayer = PLAYER_ONE;
        }

        var captured = [];

        row += dr;
        col += dc;

        while (this.getCell(row, col) == otherPlayer) {
            captured.push([row, col]);
            row += dr;
            col += dc;
        }

        if (this.getCell(row, col) == player)  {
            return captured;
        } else {
            return [];
        }
    }

    tryCapture(player, row, col) {
        var capturedUp = this.tryCaptureDrDc(player, row, col, -1, 0);
        var capturedDown = this.tryCaptureDrDc(player, row, col, 1, 0);
        var capturedLeft = this.tryCaptureDrDc(player, row, col, 0, -1);
        var capturedRight = this.tryCaptureDrDc(player, row, col, 0, 1);

        var capturedDiagonal1 = this.tryCaptureDrDc(player, row, col, 1, 1);
        var capturedDiagonal2 = this.tryCaptureDrDc(player, row, col, 1, -1);
        var capturedDiagonal3 = this.tryCaptureDrDc(player, row, col, -1, 1);
        var capturedDiagonal4 = this.tryCaptureDrDc(player, row, col, -1, -1);


        return capturedUp
            .concat(capturedDown)
            .concat(capturedLeft)
            .concat(capturedRight)
            .concat(capturedDiagonal1)
            .concat(capturedDiagonal2)
            .concat(capturedDiagonal3)
            .concat(capturedDiagonal4)
    }

    makeMove(row, col) {

        assert(row >= 0 && row < this.numRows);
        assert(col >= 0 && col < this.numCols);

        var captured = this.tryCapture(this.player, row, col);

        if (this.isMoveInvalid(row, col, captured.length)) {
            return new Move(false, undefined, undefined, undefined, undefined, undefined);
        } 

        for (var i = 0; i < captured.length; i++) {
            var [r, c] = captured[i];
            this.matrix[r][c] = this.player;
        } 

        this.matrix[row][col] = this.player;

        this.checkGameOver();

        var move = new Move(true, row, col, this.player, captured, this.gameOver);

        // TODO: dedup
        if (this.player == PLAYER_ONE) {
            this.player = PLAYER_TWO;
        } else {
            this.player = PLAYER_ONE;
        }

        // If this.player must pass
        if (this.gameOver == undefined && !this.canMove(this.player)) {
            if (this.player == PLAYER_ONE) {
                this.player = PLAYER_TWO;
            } else {
                this.player = PLAYER_ONE;
            }
        }

        return move;
    }

    // returns true iff player has a valid move
    canMove(player) {
        for (var row = 0; row < this.numRows; row++) {
            for (var col = 0; col < this.numCols; col++) {

                var captured = this.tryCapture(player, row, col);

                if (!this.isMoveInvalid(row, col, captured.length)) {
                    return true;
                } 

            }
        }

        return false;
    }

    checkGameOver() {
        if (!this.canMove(PLAYER_ONE) && !this.canMove(PLAYER_TWO)) {
            var count = {};
            count[PLAYER_ONE] = this.countPieces(PLAYER_ONE);
            count[PLAYER_TWO] = this.countPieces(PLAYER_TWO);

            var victor;
            if (count[PLAYER_ONE] == count[PLAYER_TWO]) {
                victor = undefined;
            } else if (count[PLAYER_ONE] > count[PLAYER_TWO]) {
                victor = PLAYER_ONE;
            } else {
                victor = PLAYER_TWO;
            }

            this.gameOver = new GameOver(victor, count);
        }
    }

    countPieces(player) {
        var count = 0;

        for (var row = 0; row < this.numRows; row++) {
            for (var col = 0; col < this.numCols; col++) {
                if (this.matrix[row][col] == player) {
                    count += 1;
                }
            }
        }

        return count;
    }
}


/*******************************************************************************
 * Node class
 ******************************************************************************/

class Node {

    constructor(game, move = undefined) {
        this.game = game;
        this.move = move;
    }

    getMove() {
        return this.move;
    }

    isLeaf() {
        return this.game.gameOver != undefined;
    }

    getNumAvailableMoves(player) {
        var count = 0;

        for (var row = 0; row < this.game.numRows; row++) {
            for (var col = 0; col < this.game.numCols; col++) {

                var captured = this.game.tryCapture(player, row, col);
                var numCaptured = captured.length

                if (!this.game.isMoveInvalid(row, col, numCaptured)) {
                    count += 1;
                }
            }
        }

        return count;
    }

    isPotential(player, row, col) {
        if (this.game.matrix[row][col] != Othello.getOpponent(player)) {
            return false;
        }

        // The row above
        var a = this.game.getCell(row - 1, col - 1);
        var b = this.game.getCell(row - 1, col);
        var c = this.game.getCell(row - 1, col + 1);

        // The row below
        var d = this.game.getCell(row + 1, col - 1);
        var e = this.game.getCell(row + 1, col);
        var f = this.game.getCell(row + 1, col + 1);

        // to the left
        var g = this.game.getCell(row, col - 1);

        // to the right
        var h = this.game.getCell(row, col + 1);

        return  a == EMPTY ||
                b == EMPTY ||
                c == EMPTY ||
                d == EMPTY ||
                e == EMPTY ||
                f == EMPTY ||
                g == EMPTY ||
                h == EMPTY;
    }

    getNumPotential(player) {
        var count = 0;

        for (var row = 0; row < this.game.numRows; row++) {
            for (var col = 0; col < this.game.numCols; col++) {

                if (this.isPotential(player, row, col)) {
                    count += 1;
                }
            }
        }

        return count;   
    }

    getNumCorners(player) {
        var numRows = this.game.numRows;
        var numCols = this.game.numCols;
        var corners =
            [[0, 0],
             [0, numCols - 1],
             [numRows - 1, 0],
             [numRows - 1, numCols - 1]];

        var count = 0;

        for (var i = 0; i < corners.length; i++) {
            var [row, col] = corners[i];
            if (this.game.matrix[row][col] == player) {
                count += 1;
            }
        }

        return count;
    }

    // http://home.datacomm.ch/t_wolf/tw/misc/reversi/html/index.html
    // http://www.samsoft.org.uk/reversi/strategy.htm
    getNonLeafScore() {
        var numPieces =
            this.game.countPieces(MAXIMIZING_PLAYER) -
            this.game.countPieces(MINIMIZING_PLAYER);

        var numAvailableMoves =
            this.getNumAvailableMoves(MAXIMIZING_PLAYER) -
            this.getNumAvailableMoves(MINIMIZING_PLAYER);

        var numPotential =
            this.getNumPotential(MAXIMIZING_PLAYER) -
            this.getNumPotential(MINIMIZING_PLAYER);

        var numCorners =
            this.getNumCorners(MAXIMIZING_PLAYER) -
            this.getNumCorners(MINIMIZING_PLAYER);

        return numPieces +
               numCorners * 20 +
               numAvailableMoves * 6 +
               numPotential * 2;
    }

    getScore() {
        if (this.game.gameOver != undefined) {
            if (this.game.gameOver.victor == MAXIMIZING_PLAYER) {
                return Number.MAX_SAFE_INTEGER;
            } else if (this.game.gameOver.victor == MINIMIZING_PLAYER) {
                return Number.MIN_SAFE_INTEGER;
            } else {
                return 0;
            }
        } else {
            return this.getNonLeafScore();
        }
    }

    // Recall, in a game tree every node (except a leaf node)
    // is a parent. The children of a parent represent
    // all the possible moves a parent can make.
    getChildren() {

        var childrenNodes = [];

        for (var row = 0; row < this.game.numRows; row++) {
            for (var col = 0; col < this.game.numCols; col++) {

                var childGame = this.game.deepCopy();

                var move = childGame.makeMove(row, col);

                if (move.valid) {
                    var childNode = new Node(childGame, move);
                    childrenNodes.push(childNode);
                }
            }
        }

        assert(childrenNodes.length > 0);

        return childrenNodes;
    }
}

/*******************************************************************************
 * Viz class
 ******************************************************************************/
class Viz {
    
    /* Static functions *******************************************************/

    static getCellId(row, col) {
        return "cell-" + row + "-" + col;
    }

    /* Instance methods *******************************************************/
    constructor(boardId, numRows, numCols, cell_size) {
        this.boardId = boardId;
        this.numRows = numRows;
        this.numCols = numCols;
        this.cell_size = cell_size;
        this.drawCells();
    }
    
    drawCells() {
        for (var row = 0; row < this.numRows; row++) {

            var rowId = "row-" + row;
            var rowTag = "<div id='" + rowId + "' class='row'></div>"

            $(this.boardId).append(rowTag);

            for (var col = 0; col < this.numCols; col++) {

                var cellId = Viz.getCellId(row, col);
                var cellTag = "<div id='" + cellId + "' " + 
                              "class='cell' " + 
                              "onClick='cellClick(" + row + ", " + col +" )'>" +
                              "</div>";
                $("#" + rowId).append(cellTag);
                $("#" + cellId).css("width", this.cell_size);
                $("#" + cellId).css("height", this.cell_size);
            }
        }
    }

    getImgTag(player) {

        var filename = undefined;

        if (player == PLAYER_ONE) {
            filename = PLAYER_ONE_FILENAME;
        } else if (player == PLAYER_TWO) {
            filename = PLAYER_TWO_FILENAME
        } else {
            assert(false);
        }

        return "<img src='" + filename + "' width='" + this.cell_size + "'>";
    }


    drawMove(move) {
        if (!move.valid) {
            return;
        }

        var cellId = Viz.getCellId(move.row, move.col);
        var imgTag = this.getImgTag(move.player);

        $("#" + cellId).append(imgTag);


        var THIS = this;

        function drawCapture() {
            for (var i = 0; i < move.captured.length; i++) {
                var [row, col] = move.captured[i];
                console.log(row, col);

                var cellId = Viz.getCellId(row, col);
                var imgTag = THIS.getImgTag(move.player);

                $("#" + cellId + " img").remove();
                $("#" + cellId).append(imgTag);

            }
        }

        if (move.player == COMPUTER_PLAYER) {
            window.setTimeout(drawCapture, CAPTURE_DELAY);
        } else {
            drawCapture();
        }

        if (move.gameOver != undefined &&
            move.gameOver.victoryCells != undefined) {

            for (var i = 0; i < move.gameOver.victoryCells.length; i++) {
                var [row, col] = move.gameOver.victoryCells[i];

                var cellId = Viz.getCellId(row, col);

                $("#" + cellId).css("background-color", "gray");

                $("#" + cellId).css("outline",  "black solid 2px");

            }
        }

        if (move.gameOver != undefined) {
            if (move.gameOver.victor == HUMAN_PLAYER) {
                alert("You win!");
            } else {
                alert("You lose.")
            }
        }
    }
}

/*******************************************************************************
 * MinMax function
 ******************************************************************************/

// Arguments:
//    node is the node for which we want to calculate its score
//    maximizingPlayer is true if node wants to maximize its score
//    maximizingPlayer is false if node wants to minimize its score
//
// minMax(node, player) returns the best possible score
// that the player can achieve from this node
//
// node must be an object with the following methods:
//    node.isLeaf()
//    node.getScore()
//    node.getChildren()
//    node.getMove()
function minMax(node, depth, maximizingPlayer) {
    if (node.isLeaf() || depth == 0) {
        return [node.getMove(), node.getScore()];
    }

    // If the node wants to maximize its score:
    if (maximizingPlayer) {
        var bestScore = Number.MIN_SAFE_INTEGER;
        var bestMove = undefined;

        // find the child with the highest score
        var children = node.getChildren();
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            var [_, childScore] = minMax(child, depth - 1, false);
            bestScore = Math.max(childScore, bestScore);

            if (bestScore == childScore) {
                bestMove = child.getMove();
            }

        }
        return [bestMove, bestScore];
    }

    // If the node wants to minimize its score:
    else {
        var bestScore = Number.MAX_SAFE_INTEGER;
        var bestMove = undefined;

        // find the child with the lowest score
        var children = node.getChildren();
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            var [_, childScore] = minMax(child, depth -1, true);
            bestScore = Math.min(childScore, bestScore);

            if (bestScore == childScore) {
                bestMove = child.getMove();
            }
        }
        return [bestMove, bestScore];
    }
}


/*******************************************************************************
 * AI code
 ******************************************************************************/

function makeAiMove(game) {

    assert(game.gameOver == undefined);

    var node = new Node(game);

    var maximizing = MAXIMIZING_PLAYER == COMPUTER_PLAYER;

    var [bestMove, _] = minMax(node, MIN_MAX_DEPTH, maximizing);

    return game.makeMove(bestMove.row, bestMove.col);
}

/*******************************************************************************
 * Controller
 ******************************************************************************/
         
var cell_size = 50;

var GAME = new Othello(FIRST_PLAYER, NUM_ROWS, NUM_COLS);

// Global variable to hold the Viz class
var VIZ = new Viz("#board", NUM_ROWS, NUM_COLS, cell_size);

var openingMoves = GAME.getOpeningMoves();
for (var i = 0; i < openingMoves.length; i++) {
    var move = openingMoves[i];
    VIZ.drawMove(move);
}


if (FIRST_PLAYER == COMPUTER_PLAYER) {
    move = makeAiMove(GAME);
    VIZ.drawMove(move);
}

function cellClick(row, col) {

    // Ignores invalid moves from the human
    assert(GAME.player == HUMAN_PLAYER);
    var move = GAME.makeMove(row, col);
    VIZ.drawMove(move);

    if (move.valid && GAME.player == HUMAN_PLAYER) {
        alert("The computer passed a turn.");
    }

    function doAi() {
        move = makeAiMove(GAME);
        VIZ.drawMove(move);

        if (GAME.player == COMPUTER_PLAYER) {
            alert("You passed a turn.");
        }

        if (move.valid &&
            GAME.gameOver == undefined &&
            GAME.player == COMPUTER_PLAYER) {
            window.setTimeout(doAi, 300);
        }

    }

    if (move.valid &&
        GAME.gameOver == undefined &&
        GAME.player == COMPUTER_PLAYER) {
        window.setTimeout(doAi, 300);
    }

}

