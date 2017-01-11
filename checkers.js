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
PLAYER_ONE_KING_FILENAME = "player-1-king.png";
PLAYER_ONE_SUGGESTION_FILENAME = "player-1-suggestion.png";
UP_PLAYER = PLAYER_ONE;

PLAYER_TWO = 2;
PLAYER_TWO_FILENAME = "player-2.png";
PLAYER_TWO_KING_FILENAME = "player-2-king.png";
PLAYER_TWO_SUGGESTION_FILENAME = "player-2-suggestion.png";
DOWN_PLAYER = PLAYER_TWO;

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
    constructor(coordBegin, coordEnd, jumpOver, player, gameOver) {
        this.coordBegin = coordBegin;
        this.coordEnd = coordEnd;
        this.jumpOver = jumpOver;
        this.player = player;
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
            var move = new Move(begin, end, jumpedOver, this.player, undefined);
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
            var move = new Move(begin, end, jumpedOver, this.player, undefined);
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
            var move = new Move(begin, end, jumpedOver, this.player, undefined);
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
            var move = new Move(begin, end, jumpedOver, this.player, undefined);
            return [move];
        } else {
            return [];
        }
    }

    // TODO: simplify with drdc
    getMoveUpLeft(coord) {
        if (this.getCell(coord.row - 1, coord.col - 1).player == EMPTY) {
            var newCoord = new Coordinate(coord.row - 1, coord.col - 1);
            var move = new Move(coord, newCoord, undefined, this.player, undefined);
            return [move];
        } else {
            return [];
        }
    }

    getMoveUpRight(coord) {
        if (this.getCell(coord.row - 1, coord.col + 1).player == EMPTY) {
            var newCoord = new Coordinate(coord.row - 1, coord.col + 1);
            var move = new Move(coord, newCoord, undefined, this.player, undefined);
            return [move];
        } else {
            return [];
        }
    }

    getMoveDownLeft(coord) {
        if (this.getCell(coord.row + 1, coord.col - 1).player == EMPTY) {
            var newCoord = new Coordinate(coord.row + 1, coord.col - 1);
            var move = new Move(coord, newCoord, undefined, this.player, undefined);
            return [move];
        } else {
            return [];
        }
    }

    getMoveDownRight(coord) {
        if (this.getCell(coord.row + 1, coord.col + 1).player == EMPTY) {
            var newCoord = new Coordinate(coord.row + 1, coord.col + 1);
            var move = new Move(coord, newCoord, undefined, this.player, undefined);
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

                if (this.matrix[row][col].player == this.player) {

                    var jumps = [];

                    if (this.player == UP_PLAYER) {
                        jumps = jumps
                            .concat(this.getJumpUpLeft(coord))
                            .concat(this.getJumpUpRight(coord));
                    } else {
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
        assert(this.gameOver == undefined);

        if (!this.validPieceToMove(coord)) {
            return [];
        }

        if (this.pieceMustPerformJump != undefined &&
            !this.pieceMustPerformJump.equals(coord)) {
            return [];
        }

        var jumpPossible = this.availableJump();

        var moves = [];

        if (this.player == UP_PLAYER) {
            moves = moves
                .concat(this.getJumpUpLeft(coord))
                .concat(this.getJumpUpRight(coord));

            if (moves.length == 0 && !jumpPossible) {
                moves = moves
                    .concat(this.getMoveUpLeft(coord))
                    .concat(this.getMoveUpRight(coord));
            }
        } else {

            moves = moves
                .concat(this.getJumpDownLeft(coord))
                .concat(this.getJumpDownRight(coord));

            if (moves.length == 0 && !jumpPossible) {
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

    // old
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

        while (this.getCell(row, col).player == otherPlayer) {
            captured.push([row, col]);
            row += dr;
            col += dc;
        }

        if (this.getCell(row, col).player == player)  {
            return captured;
        } else {
            return [];
        }
    }

    // old
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

    isMoveValid(move) {
        var [beginRow, beginCol] = [move.coordBegin.row, move.coordBegin.col];
        if (this.getCell(beginRow, beginCol).player != move.player) {
            return false;
        }

        var [endRow, endCol] = [move.coordEnd.row, move.coordEnd.col];
        if (this.getCell(endRow, endCol).player != EMPTY) {
            return false;
        }

        if (move.player == UP_PLAYER) {

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
        } else {
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

        if (this.jumpAgainPossible(move)) {
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
            this.gameOver);
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

    // TODO
    checkGameOver() {

    }

    countPieces(player) {
        var count = 0;

        for (var row = 0; row < this.numRows; row++) {
            for (var col = 0; col < this.numCols; col++) {
                if (this.matrix[row][col].player == player) {
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
        if (this.game.matrix[row][col] != Checkers.getOpponent(player)) {
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

    // todo dedup
    drawInitPosition(playerCoords) {

        for (var i = 0; i < playerCoords.length; i++) {
            var pc = playerCoords[i];

            var cellId = Viz.getCellId(pc.coord.row, pc.coord.col);
            var imgTag = this.getImgTag(pc.player);

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
    drawMove(move, possibleMoves) {

        for (var i = 0; i < possibleMoves.length; i++) {
            VIZ.undoDrawSuggestion(possibleMoves[i]);
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
        var imgTag = this.getImgTag(move.player);
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




    //var move = GAME.makeMove(row, col);
    //VIZ.drawMove(move);
}

