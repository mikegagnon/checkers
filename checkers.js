function assert(condition) {
    if (!condition) {
        console.error("Assertion failed");
    }
}

NUM_ROWS = 8;
NUM_COLS = 8;

CAPTURE_DELAY = 700;

MIN_MAX_DEPTH = 7;

EMPTY = 0;

PLAYER_ONE = 1;
PLAYER_ONE_FILENAME = "player-1.png";
PLAYER_ONE_KING_FILENAME = "player-1-king.png";
PLAYER_ONE_SUGGESTION_FILENAME = "player-1-suggestion.png";
UP_PLAYER = PLAYER_ONE;

PLAYER_TWO = 2;
PLAYER_TWO_FILENAME = "player-2.png";
PLAYER_TWO_KING_FILENAME = "player-2-king.png";
PLAYER_TWO_SUGGESTION_FILENAME = "player-2-suggestion.png";
DOWN_PLAYER = PLAYER_TWO;

PLAYER_COLOR = {
    1: "Red",
    2: "Black"
}

MAXIMIZING_PLAYER = PLAYER_ONE;
MINIMIZING_PLAYER = PLAYER_TWO;

FIRST_PLAYER = PLAYER_ONE;

HUMAN_PLAYER = PLAYER_ONE; 
COMPUTER_PLAYER = PLAYER_TWO;

// Todo hline of stars
class Coordinate {
    constructor(row, col) {
        this.row = row;
        this.col = col;
        Object.freeze(this);
    }

    equals(coord) {
        return this.row == coord.row && this.col == coord.col;d
    }
}

class PlayerCoordinate {
    constructor(player, coord) {
        this.player = player;
        this.coord = coord;
    }
}

/*******************************************************************************
 * Move is the interface between Checkers and Viz
 ******************************************************************************/
class Move {
    // TODO: document
    // todo switch to begin and end instead of coordBegin...
    // to change jumpOver to jumped
    constructor(coordBegin, coordEnd, jumpOver, player, king, gameOver) {
        this.coordBegin = coordBegin;
        this.coordEnd = coordEnd;
        this.jumpOver = jumpOver;
        this.player = player;
        this.king = king;
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
    constructor(victor) {
        this.victor = victor;

        // Make GameOver immutable
        Object.freeze(this);
    }
}


/*******************************************************************************
 * Cell class
 ******************************************************************************/
class Cell {
    // player == PLAYER_ONE or
    // player == PLAYER_TWO or
    // player == EMPTY or
    // player == undefined, which means out of bounds
    constructor(player, king) {
        this.player = player;
        this.king = king;
    }

    deepCopy() {
        var newCell = new Cell(this.player, this.king);
        return newCell;
    }
}

OOB_CELL = new Cell(undefined, false);

/*******************************************************************************
 * Checkers class
 ******************************************************************************/
class Checkers {

    // TODO: use
    static getOpponent(player) {
        if (player == PLAYER_ONE) {
            return PLAYER_TWO;
        } else {
            return PLAYER_ONE;
        }
    }

    getJumpUpLeft(begin) {
        var opponent = Checkers.getOpponent(this.player);
        if (this.getCell(begin.row - 1, begin.col - 1).player == opponent &&
            this.getCell(begin.row - 2, begin.col - 2).player == EMPTY) {
            var jumpedOver = new Coordinate(begin.row - 1, begin.col - 1);
            var end = new Coordinate(begin.row - 2, begin.col - 2);
            var king = this.getCell(begin.row, begin.col).king;
            var move = new Move(begin, end, jumpedOver, this.player, king, undefined);
            return [move];
        } else {
            return [];
        }
    }

    getJumpUpRight(begin) {
        var opponent = Checkers.getOpponent(this.player);
        if (this.getCell(begin.row - 1, begin.col + 1).player == opponent &&
            this.getCell(begin.row - 2, begin.col + 2).player == EMPTY) {
            var jumpedOver = new Coordinate(begin.row - 1, begin.col + 1);
            var end = new Coordinate(begin.row - 2, begin.col + 2);
            var king = this.getCell(begin.row, begin.col).king;
            var move = new Move(begin, end, jumpedOver, this.player, king, undefined);
            return [move];
        } else {
            return [];
        }
    }

    getJumpDownLeft(begin) {
        var opponent = Checkers.getOpponent(this.player);
        if (this.getCell(begin.row + 1, begin.col - 1).player == opponent &&
            this.getCell(begin.row + 2, begin.col - 2).player == EMPTY) {
            var jumpedOver = new Coordinate(begin.row + 1, begin.col - 1);
            var end = new Coordinate(begin.row + 2, begin.col - 2);
            var king = this.getCell(begin.row, begin.col).king;
            var move = new Move(begin, end, jumpedOver, this.player, king, undefined);
            return [move];
        } else {
            return [];
        }
    }

    getJumpDownRight(begin) {
        var opponent = Checkers.getOpponent(this.player);
        if (this.getCell(begin.row + 1, begin.col + 1).player == opponent &&
            this.getCell(begin.row + 2, begin.col + 2).player == EMPTY) {
            var jumpedOver = new Coordinate(begin.row + 1, begin.col + 1);
            var end = new Coordinate(begin.row + 2, begin.col + 2);
            var king = this.getCell(begin.row, begin.col).king;
            var move = new Move(begin, end, jumpedOver, this.player, king, undefined);
            return [move];
        } else {
            return [];
        }
    }

    // TODO: simplify with drdc
    getMoveUpLeft(coord) {
        if (this.getCell(coord.row - 1, coord.col - 1).player == EMPTY) {
            var newCoord = new Coordinate(coord.row - 1, coord.col - 1);
            var king = this.getCell(coord.row, coord.col).king;
            var move = new Move(coord, newCoord, undefined, this.player, king, undefined);
            return [move];
        } else {
            return [];
        }
    }

    getMoveUpRight(coord) {
        if (this.getCell(coord.row - 1, coord.col + 1).player == EMPTY) {
            var newCoord = new Coordinate(coord.row - 1, coord.col + 1);
            var king = this.getCell(coord.row, coord.col).king;
            var move = new Move(coord, newCoord, undefined, this.player, king, undefined);
            return [move];
        } else {
            return [];
        }
    }

    getMoveDownLeft(coord) {
        if (this.getCell(coord.row + 1, coord.col - 1).player == EMPTY) {
            var newCoord = new Coordinate(coord.row + 1, coord.col - 1);
            var king = this.getCell(coord.row, coord.col).king;
            var move = new Move(coord, newCoord, undefined, this.player, king, undefined);
            return [move];
        } else {
            return [];
        }
    }

    getMoveDownRight(coord) {
        if (this.getCell(coord.row + 1, coord.col + 1).player == EMPTY) {
            var newCoord = new Coordinate(coord.row + 1, coord.col + 1);
            var king = this.getCell(coord.row, coord.col).king;
            var move = new Move(coord, newCoord, undefined, this.player, king, undefined);
            return [move];
        } else {
            return [];
        }
    }

    // Returns true if this.player has at least one jump available
    availableJump() {

        for (var row = 0; row < this.numRows; row++) {
            for (var col = 0 ; col < this.numCols; col++) {
                var coord = new Coordinate(row, col);
                var cell = this.matrix[row][col];

                if (cell.player == this.player) {

                    var jumps = [];

                    if (this.player == UP_PLAYER || cell.king) {
                        jumps = jumps
                            .concat(this.getJumpUpLeft(coord))
                            .concat(this.getJumpUpRight(coord));
                    }

                    if (this.player == DOWN_PLAYER || cell.king) {
                        jumps = jumps
                            .concat(this.getJumpDownLeft(coord))
                            .concat(this.getJumpDownRight(coord));
                    }

                    if (jumps.length > 0) {
                        return true;
                    }
                }

            }
        }

        return false;
    }

    // assuming move has already affected the game state,
    // is it possible for the moved piece to jump again?
    jumpAgainPossible(move) {
        var moves = this.getPossibleMoves(move.coordEnd);

        for (var i = 0; i < moves.length; i++) {
            var move = moves[i];

            if (move.jumpOver != undefined) {
                return true;
            }
        }

        return false;
    }

    // todo make elegant and dedup
    getPossibleMoves(coord) {
        if (this.gameOver != undefined) {
            return [];
        }

        if (!this.validPieceToMove(coord)) {
            return [];
        }

        if (this.pieceMustPerformJump != undefined &&
            !this.pieceMustPerformJump.equals(coord)) {
            return [];
        }

        var jumpPossible = this.availableJump();

        var cell = this.matrix[coord.row][coord.col];

        var moves = [];

        if (this.player == UP_PLAYER || cell.king) {
            moves = moves
                .concat(this.getJumpUpLeft(coord))
                .concat(this.getJumpUpRight(coord));
        }

        if (this.player == DOWN_PLAYER || cell.king) {
            moves = moves
                .concat(this.getJumpDownLeft(coord))
                .concat(this.getJumpDownRight(coord));
        }


        if (moves.length == 0 && !jumpPossible) {

            if (this.player == UP_PLAYER || cell.king) {
                moves = moves
                    .concat(this.getMoveUpLeft(coord))
                    .concat(this.getMoveUpRight(coord));
            }

            if (this.player == DOWN_PLAYER || cell.king) {
                moves = moves
                    .concat(this.getMoveDownLeft(coord))
                    .concat(this.getMoveDownRight(coord));
            }
        }

        // temporary
        for (var i = 0; i < moves.length; i++) {
            assert(this.isMoveValid(moves[i]));
        }

        return moves;

    }

    // TODO better function name
    validPieceToMove(coord) {
        return this.matrix[coord.row][coord.col].player == this.player;
    }

    // returns a list of PlayerCoordinate objects
    // TODO: code dedup
    getInitPosition() {
        var NUM_ROWS_PER_PLAYER = 3;
        assert(this.numRows >= NUM_ROWS_PER_PLAYER * 2);

        var pcs = []

        for (var row = 0; row < NUM_ROWS_PER_PLAYER; row++) {
            var startColumn;

            if (row % 2 == 0) {
                startColumn = 0;
            } else {
                startColumn = 1;
            }

            for (var col = startColumn; col < this.numCols; col += 2) {
                var pc =
                    new PlayerCoordinate(DOWN_PLAYER, new Coordinate(row, col));

                pcs.push(pc);
            }
        }

        var firstRow = this.numRows - NUM_ROWS_PER_PLAYER - 1;
        for (var row = this.numRows - 1; row > firstRow; row--) {
            var startColumn;

            if (row % 2 == 0) {
                startColumn = 0;
            } else {
                startColumn = 1;
            }

            for (var col = startColumn; col < this.numCols; col += 2) {
                var pc =
                    new PlayerCoordinate(UP_PLAYER, new Coordinate(row, col));

                pcs.push(pc);
            }
        }

        return pcs;

    }


    // player is either PLAYER_ONE or PLAYER_TWO, and indicates which player has
    // the next move
    constructor(player, numRows, numCols) {

        assert(numRows % 2 == 0);
        assert(numCols % 2 == 0);
        assert(player == PLAYER_ONE || player == PLAYER_TWO);

        this.numRows = numRows;
        this.numCols = numCols;

        // if defined, this.pieceMustPerformJump is the coordinate
        // for the piece that must perform a jump this turn.
        // this only happens as one step in a multi jump
        this.pieceMustPerformJump = undefined;

        this.matrix = new Array(this.numRows);
        for (var row = 0; row < this.numRows; row++) {
            this.matrix[row] = new Array(this.numCols);
            for (var col = 0; col < this.numCols; col++) {
                this.matrix[row][col] = new Cell(EMPTY, false);
            }
        }

        // TODO Document
        var initPosition = this.getInitPosition();
        for (var i = 0; i < initPosition.length; i++) {
            var pc = initPosition[i];
            this.matrix[pc.coord.row][pc.coord.col].player = pc.player;
        }

        // this.player always equals the player (either PLAYER_ONE or
        // PLAYER_TWO) who has the next move.
        this.player = player;

        // If the game is over, then this.gameOver equals a GameOver object
        // that describes the properties of the conclusion of the game
        // If the game is not over, then this.gameOver is undefined.
        this.gameOver = undefined;
    }

    deepCopy() {
        var newGame = new Checkers(this.player, this.numRows, this.numCols);

        for (var row = 0; row < this.numRows; row++) {
            for (var col = 0; col < this.numCols; col++) {
                newGame.matrix[row][col] = this.matrix[row][col].deepCopy();
            }
        }

        // Coordinates are immutable
        newGame.pieceMustPerformJump = this.pieceMustPerformJump;


        // We do not need to make a deepCopy of this.gameOver
        // because this.gameOver is immutable
        newGame.gameOver = this.gameOver;

        return newGame;
    }

    // todo coord
    getCell(row, col) {
        if (!(row >= 0 && row < this.numRows &&
               col >= 0 && col < this.numCols)) {
            return OOB_CELL;
        } else {
            return this.matrix[row][col];
        }
    }

    // TODO
    isMoveValid(move) {
        var [beginRow, beginCol] = [move.coordBegin.row, move.coordBegin.col];
        if (this.getCell(beginRow, beginCol).player != move.player) {
            return false;
        }

        var [endRow, endCol] = [move.coordEnd.row, move.coordEnd.col];
        if (this.getCell(endRow, endCol).player != EMPTY) {
            return false;
        }

        if (move.player == UP_PLAYER && !move.king) {

            if (move.jumpOver != undefined) {

                if (endRow != beginRow - 2) {
                    return false;
                }

                if (endCol != beginCol - 2 &&
                    endCol != beginCol + 2) {
                    return false;
                }

                var [jumpRow, jumpCol] = [move.jumpOver.row, move.jumpOver.col];
                var opponent = Checkers.getOpponent(this.player);

                if (this.getCell(jumpRow, jumpCol).player != opponent) {
                    return false;
                }

            } else {
                if (endRow != beginRow - 1) {
                    return false;
                }

                if (endCol != beginCol - 1 &&
                    endCol != beginCol + 1) {
                    return false;
                }
            }
        } else if (move.player == DOWN_PLAYER && !move.king) {
            if (move.jumpOver != undefined) {

                if (endRow != beginRow + 2) {
                    return false;
                }

                if (endCol != beginCol - 2 &&
                    endCol != beginCol + 2) {
                    return false;
                }

                var [jumpRow, jumpCol] = [move.jumpOver.row, move.jumpOver.col];
                var opponent = Checkers.getOpponent(this.player);

                if (this.getCell(jumpRow, jumpCol).player != opponent) {
                    return false;
                }

            } else {
                if (endRow != beginRow + 1) {
                    return false;
                }

                if (endCol != beginCol - 1 &&
                    endCol != beginCol + 1) {
                    return false;
                }
            }
        } else if (move.king) {
            if (move.jumpOver != undefined) {

                if (endRow != beginRow + 2 && endRow != beginRow - 2) {
                    return false;
                }

                if (endCol != beginCol - 2 &&
                    endCol != beginCol + 2) {
                    return false;
                }

                var [jumpRow, jumpCol] = [move.jumpOver.row, move.jumpOver.col];
                var opponent = Checkers.getOpponent(this.player);

                if (this.getCell(jumpRow, jumpCol).player != opponent) {
                    return false;
                }

            } else {
                if (endRow != beginRow + 1 && endRow != beginRow - 1 ) {
                    return false;
                }

                if (endCol != beginCol - 1 &&
                    endCol != beginCol + 1) {
                    return false;
                }
            }
        } else {
            assert(false);
        }

        return true;

    }

    // assumes move is valid
    makeMove(move) {
        assert(this.isMoveValid(move));

        var [beginRow, beginCol] = [move.coordBegin.row, move.coordBegin.col];
        var [endRow, endCol] = [move.coordEnd.row, move.coordEnd.col];

        var endCell = this.matrix[endRow][endCol];
        var beginCell = this.matrix[beginRow][beginCol];

        endCell.player = beginCell.player;
        endCell.king = beginCell.king;

        beginCell.player = EMPTY;

        if (move.jumpOver != undefined) {
            var [row, col] = [move.jumpOver.row, move.jumpOver.col];
            this.matrix[row][col].player = EMPTY;
        }

        if ((this.player == UP_PLAYER && endRow == 0) || (
             this.player == DOWN_PLAYER && endRow == this.numRows - 1)) {
            endCell.king = true;
        }

        this.checkGameOver();

        if (move.jumpOver != undefined && this.jumpAgainPossible(move)) {
            this.pieceMustPerformJump = move.coordEnd;
        } else {
            this.pieceMustPerformJump = undefined;
            this.player = Checkers.getOpponent(this.player);
        }

        return new Move(
            move.coordBegin,
            move.coordEnd,
            move.jumpOver,
            move.player,
            endCell.king,
            this.gameOver);
    }


    countPieces(player) {
        var count = 0;

        for (var row = 0; row < this.numRows; row++) {
            for (var col = 0; col < this.numCols; col++) {
                var piece = this.matrix[row][col];
                if (piece.player == player) {
                    count += 1;
                }
            }
        }

        return count;
    }

    countKingPieces(player) {
        var count = 0;

        for (var row = 0; row < this.numRows; row++) {
            for (var col = 0; col < this.numCols; col++) {
                var piece = this.matrix[row][col];
                if (piece.player == player && piece.king) {
                    count += 1;
                }
            }
        }

        return count;
    }

    // TODO
    checkGameOver() {
        if (this.countPieces(PLAYER_ONE) == 0) {
            this.gameOver = new GameOver(PLAYER_TWO);
        } else if (this.countPieces(PLAYER_TWO) == 0) {
            this.gameOver = new GameOver(PLAYER_ONE);
        }
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

    getNonLeafScore() {
        return this.game.countPieces(MAXIMIZING_PLAYER) +
               this.game.countKingPieces(MAXIMIZING_PLAYER) * 2 - 
               this.game.countPieces(MINIMIZING_PLAYER) -
               this.game.countKingPieces(MINIMIZING_PLAYER) * 2;   
    }

    // TODO: document
    getMaximize() {
        this.game.player == MAXIMIZING_PLAYER;
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

        var moves = [];

        for (var row = 0; row < this.game.numRows; row++) {
            for (var col = 0; col < this.game.numCols; col++) {
                var coord = new Coordinate(row, col);
                moves = moves.concat(this.game.getPossibleMoves(coord));
            }
        }

        var children = [];

        for (var i = 0; i < moves.length; i++) {
            var move = moves[i];
            var newGame = this.game.deepCopy();
            newGame.makeMove(move);
            var child = new Node(newGame, move);
            children.push(child);
        }

        return children;

    }
}

/*******************************************************************************
 * Viz class
 ******************************************************************************/
class Viz {
    
    /* Static functions *******************************************************/

    // TODO: change to coord
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

                var cssClass;
                if ((row % 2 == 0 && col % 2 == 0) ||
                    (row % 2 == 1 && col % 2 == 1)) {
                    cssClass = "light"; 
                } else {
                    cssClass = "dark";
                }

                $("#" + cellId).addClass(cssClass);



            }
        }
    }

    // TODO: dedup
    getSuggestionTag(player) {

        var filename = undefined;

        if (player == PLAYER_ONE) {
            filename = PLAYER_ONE_SUGGESTION_FILENAME;
        } else if (player == PLAYER_TWO) {
            filename = PLAYER_TWO_SUGGESTION_FILENAME
        } else {
            assert(false);
        }

        return "<img src='" + filename + "' width='" + this.cell_size + "'>";
    }

    getImgTag(move) {

        var filename = undefined;

        if (move.player == PLAYER_ONE) {
            if (move.king) {
                filename = PLAYER_ONE_KING_FILENAME;
            } else {
                filename = PLAYER_ONE_FILENAME;
            }
        } else if (move.player == PLAYER_TWO) {
            if (move.king) {
                filename = PLAYER_TWO_KING_FILENAME;
            } else {
                filename = PLAYER_TWO_FILENAME;
            }
        } else {
            assert(false);
        }

        return "<img src='" + filename + "' width='" + this.cell_size + "'>";
    }

    // todo dedup
    drawInitPosition(playerCoords) {

        for (var i = 0; i < playerCoords.length; i++) {
            var pc = playerCoords[i];

            var cellId = Viz.getCellId(pc.coord.row, pc.coord.col);
            var imgTag = this.getImgTag(pc);

            $("#" + cellId).append(imgTag);
        }
    }

    drawSelectPiece(coord) {
        var cellId = Viz.getCellId(coord.row, coord.col);
        $("#" + cellId).addClass("selected");
    }

    undoDrawSelectPiece(coord) {
        var cellId = Viz.getCellId(coord.row, coord.col);
        $("#" + cellId).removeClass("selected");
    }

    drawSuggestion(move) {
        var row = move.coordEnd.row;
        var col = move.coordEnd.col;
        var cellId = Viz.getCellId(row, col);
        var suggestionTag = this.getSuggestionTag(move.player);

        $("#" + cellId + " img").remove();
        $("#" + cellId).append(suggestionTag);
    }

    undoDrawSuggestion(move) {
        var row = move.coordEnd.row;
        var col = move.coordEnd.col;
        var cellId = Viz.getCellId(row, col);

        $("#" + cellId + " img").remove();
    }

    // assumes move is valid
    // todo document
    drawMove(move, possibleMoves) {

        if (possibleMoves != undefined) {
            for (var i = 0; i < possibleMoves.length; i++) {
                VIZ.undoDrawSuggestion(possibleMoves[i]);
            }
        }

        var [beginRow, beginCol] = [move.coordBegin.row, move.coordBegin.col];
        var [endRow, endCol] = [move.coordEnd.row, move.coordEnd.col];

        if (move.jumpOver != undefined) {
            var [row, col] = [move.jumpOver.row, move.jumpOver.col];

            var cellId = Viz.getCellId(row, col);
            $("#" + cellId + " img").remove();
        }

        // todo coord for getcellid
        // Remove the piece
        var cellId = Viz.getCellId(beginRow, beginCol);
        $("#" + cellId).removeClass("selected");
        $("#" + cellId + " img").remove();

        // Add the piece
        var cellId = Viz.getCellId(endRow, endCol);
        var imgTag = this.getImgTag(move);
        $("#" + cellId).append(imgTag);
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
function minMax(node, depth, maximizingPlayer,
    alpha=Number.MIN_SAFE_INTEGER, beta=Number.MAX_SAFE_INTEGER) {

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
            var maximize = child.getMaximize();
            var [_, childScore] = minMax(child, depth - 1, maximize, alpha, beta);
            bestScore = Math.max(childScore, bestScore);
            alpha = Math.max(alpha, bestScore);

            if (bestScore == childScore) {
                bestMove = child.getMove();
            }

            if (beta <= alpha) {
                break;
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
            var maximize = child.getMaximize();
            var [_, childScore] = minMax(child, depth -1, maximize, alpha, beta);
            bestScore = Math.min(childScore, bestScore);
            beta = Math.min(beta, bestScore);

            if (bestScore == childScore) {
                bestMove = child.getMove();
            }

            if (beta <= alpha) {
                break;
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

    return game.makeMove(bestMove);
}

/*******************************************************************************
 * Controller
 ******************************************************************************/
         
var cell_size = 50;

var GAME = new Checkers(FIRST_PLAYER, NUM_ROWS, NUM_COLS);

// Global variable to hold the Viz class
var VIZ = new Viz("#board", NUM_ROWS, NUM_COLS, cell_size);
VIZ.drawInitPosition(GAME.getInitPosition());

if (FIRST_PLAYER == COMPUTER_PLAYER) {
    move = makeAiMove(GAME);
    VIZ.drawMove(move);
}

var SELECT_PIECE_CELL = undefined;
var POSSIBLE_MOVES = undefined;

function cellClick(row, col) {

    // Ignores invalid moves from the human
    //assert(GAME.player == HUMAN_PLAYER);

    var coord = new Coordinate(row, col); 

    var madeMove = false;
    if (POSSIBLE_MOVES != undefined) {
        for (var i = 0; i < POSSIBLE_MOVES.length; i++) {
            var move = POSSIBLE_MOVES[i];
            if (move.coordEnd.equals(coord)) {
                var resultMove = GAME.makeMove(move);
                VIZ.drawMove(resultMove, POSSIBLE_MOVES);

                if (resultMove.gameOver != undefined) {
                    var color = PLAYER_COLOR[resultMove.gameOver.victor];
                    alert("Player " + color + " wins!");
                } else {

                    if (GAME.pieceMustPerformJump == undefined) {

                        function doAiMove() {
                            move = makeAiMove(GAME);
                            VIZ.drawMove(move, undefined);

                            if (GAME.pieceMustPerformJump != undefined) {
                                window.setTimeout(doAiMove, 300);
                            }
                        }

                        window.setTimeout(doAiMove, 300);

                    }
                }

                madeMove = true;
            }
        }
    }

    if (madeMove) {
        POSSIBLE_MOVES = undefined;
        SELECT_PIECE_CELL = undefined;
    }


    var possibleMoves = GAME.getPossibleMoves(coord);

    if (possibleMoves.length > 0) {

        if (SELECT_PIECE_CELL != undefined) {
            VIZ.undoDrawSelectPiece(SELECT_PIECE_CELL);
            
            for (var i = 0; i < POSSIBLE_MOVES.length; i++) {
                VIZ.undoDrawSuggestion(POSSIBLE_MOVES[i]);
            }
        }
        
        SELECT_PIECE_CELL = coord;
        POSSIBLE_MOVES = possibleMoves;
        VIZ.drawSelectPiece(SELECT_PIECE_CELL);

        for (var i = 0; i < POSSIBLE_MOVES.length; i++) {
            VIZ.drawSuggestion(POSSIBLE_MOVES[i]);
        }
    } else {
        // ?
    }

}

