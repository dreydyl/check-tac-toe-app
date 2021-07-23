import { INVALID_MOVE } from 'boardgame.io/core';

function isVictory(cells) {
    //check
    const positions = [
        [12, 13, 14, 15], [16, 17, 18, 19], [20, 21, 22, 23], [24, 25, 26, 27],
        [12, 16, 20, 24], [13, 17, 21, 25], [14, 18, 22, 26], [15, 19, 23, 27],
        [12, 17, 22, 27], [15, 18, 21, 24]
    ];

    const isRowComplete = row => {
        const symbols = row.map(i => cells[i]);
        return symbols.every(c => c !== null && c.player != -1 && c.player === symbols[0].player) && symbols.some(c => c !== null && c.type == "K");
    }
    //mark victory squares

    return positions.map(isRowComplete).some(i => i === true);
}

function getVictoryCells(cells) {
    const positions = [
        [12, 13, 14, 15], [16, 17, 18, 19], [20, 21, 22, 23], [24, 25, 26, 27],
        [12, 16, 20, 24], [13, 17, 21, 25], [14, 18, 22, 26], [15, 19, 23, 27],
        [12, 17, 22, 27], [15, 18, 21, 24]
    ];

    const isRowComplete = row => {
        const symbols = row.map(i => cells[i]);
        if (symbols.every(c => c !== null && c.player != -1 && c.player === symbols[0].player)
            && symbols.some(c => c !== null && c.type == "K")) {
            for (let i = 0; i < 4; i++) {
                symbols[i].winning = true;
            }
        }
    }

    return positions.map(isRowComplete).some(i => i === true);
}

function isDrawPt2(G) {
    for (let i = 0; i < 2; i++) {
        if (G.taken[i].length <= 8) {
            return false;
        }
    }
    return true;
}

function isDraw(G) { //if no kings on board, or less than 4 pieces from each player on board
    for (let i = 0; i < G.cells.length; i++) {
        if (G.cells[i].type == "K") {
            return isDrawPt2(G);
        }
    }
    return true;
}

function getCoordinates(id) {
    let xCoord;
    let yCoord;
    xCoord = id % 4; //29 > 1 
    yCoord = Math.floor(id / 4); //29 > 7
    return { x: xCoord, y: yCoord };
}

function toId(coords) {
    return 4 * coords.y + coords.x;
}

function offset(coords, x, y) {
    return { x: coords.x + x, y: coords.y + y }; //0, -1 > 1, 6
}

function onBoard(coords) {
    return coords.x >= 0 && coords.x < 4 && coords.y >= 0 && coords.y < 10;
}

function getStartArray() {
    const setup = [
        "R", "Q", "K", "R",
        "N", "B", "B", "N",
        "P", "P", "P", "P",
        "", "", "", "",
        "", "", "", "",
        "", "", "", "",
        "", "", "", "",
        "P", "P", "P", "P",
        "N", "B", "B", "N",
        "R", "Q", "K", "R"
    ];
    let board = Array(40).fill().map(() => ({
        player: -1,
        type: "",
        valid: false,
        winning: false
    }));

    for (let i = 0; i < 12; i++) {
        board[i].player = 1;
        board[i + 28].player = 0;
    }
    for (let i = 0; i < 40; i++) {
        board[i].type = setup[i];
        board[i].id = i;
    }

    return board;
}

function markValidMoves(G, ctx, clickedId) {
    //mark all spaces with active moves
    let numMoves = 0;
    for (let i = 0; i < 40; i++) {
        G.cells[i].valid = false;
    }
    let coords = getCoordinates(clickedId);
    if (G.activePiece.type == "p" || G.activePiece.type == "P") {
        var tempCoords = offset(coords, -1, ctx.currentPlayer == 0 ? -1 : 1);
        if (onBoard(tempCoords)) {
            if (G.cells[toId(tempCoords)].player != ctx.currentPlayer
                && G.cells[toId(tempCoords)].player != -1) {
                G.cells[toId(tempCoords)].valid = true;
                numMoves++;
            }
        }
        tempCoords = offset(coords, 1, ctx.currentPlayer == 0 ? -1 : 1);
        if (onBoard(tempCoords)) {
            if (G.cells[toId(tempCoords)].player != ctx.currentPlayer
                && G.cells[toId(tempCoords)].player != -1) {
                G.cells[toId(tempCoords)].valid = true;
                numMoves++;
            }
        }
        tempCoords = offset(coords, 0, ctx.currentPlayer == 0 ? -1 : 1);
        if (onBoard(tempCoords)) {
            if (G.cells[toId(tempCoords)].player == -1) {
                G.cells[toId(tempCoords)].valid = true;
                numMoves++;
            }
        }
        if (G.activePiece.type == "P" && G.cells[toId(tempCoords)].valid) {
            tempCoords = offset(coords, 0, ctx.currentPlayer == 0 ? -2 : 2);
            if (onBoard(tempCoords)) {
                if (G.cells[toId(tempCoords)].player == -1) {
                    G.cells[toId(tempCoords)].valid = true;
                    numMoves++;
                }
            }
        }
    }
    if (G.activePiece.type == "N") {
        var tempCoords;
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 5; j++) {
                let dx = -2 + i;
                let dy = -2 + j;
                if (Math.abs(dx) != Math.abs(dy) && dx != 0 && dy != 0) {
                    tempCoords = offset(coords, dx, dy);
                    if (onBoard(tempCoords)) {
                        if (G.cells[toId(tempCoords)].player != ctx.currentPlayer) {
                            G.cells[toId(tempCoords)].valid = true;
                            numMoves++;
                        }
                    }
                }
            }
        }
    }
    if (G.activePiece.type == "B" || G.activePiece.type == "Q") {
        let dx = -1;
        let dy = -1;
        var tempCoords;
        for (let n = 0; n < 2; n++) {
            for (let m = 0; m < 2; m++) {
                tempCoords = coords;
                let offBoard = false;
                while (!offBoard) {
                    tempCoords = offset(tempCoords, dx, dy);
                    if (onBoard(tempCoords)) {
                        if (G.cells[toId(tempCoords)].player != ctx.currentPlayer) {
                            G.cells[toId(tempCoords)].valid = true;
                            numMoves++;
                        }
                        if (G.cells[toId(tempCoords)].player != -1) {
                            offBoard = true;
                        }
                    } else {
                        offBoard = true;
                    }
                }
                dy = dy * -1;
            }
            dx = dx * -1;
        }
    }
    if (G.activePiece.type == "R" || G.activePiece.type == "Q") {
        let dx = -1;
        var tempCoords;
        for (let i = 0; i < 2; i++) {
            tempCoords = coords;
            let offBoard = false;
            while (!offBoard) {
                tempCoords = offset(tempCoords, dx, 0);
                if (onBoard(tempCoords)) {
                    if (G.cells[toId(tempCoords)].player != ctx.currentPlayer) {
                        G.cells[toId(tempCoords)].valid = true;
                        numMoves++;
                    }
                    if (G.cells[toId(tempCoords)].player != -1) {
                        offBoard = true;
                    }
                } else {
                    offBoard = true;
                }
            }
            tempCoords = coords;
            offBoard = false;
            while (!offBoard) {
                tempCoords = offset(tempCoords, 0, dx);
                if (onBoard(tempCoords)) {
                    if (G.cells[toId(tempCoords)].player != ctx.currentPlayer) {
                        G.cells[toId(tempCoords)].valid = true;
                        numMoves++;
                    }
                    if (G.cells[toId(tempCoords)].player != -1) {
                        offBoard = true;
                    }
                } else {
                    offBoard = true;
                }
            }
            dx = dx * -1;
        }
    }
    if (G.activePiece.type == "K") {
        var tempCoords;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                let dx = -1 + i;
                let dy = -1 + j;
                if (dx != 0 | dy != 0) {
                    tempCoords = offset(coords, dx, dy);
                    if (onBoard(tempCoords)) {
                        if (G.cells[toId(tempCoords)].player != ctx.currentPlayer) {
                            G.cells[toId(tempCoords)].valid = true;
                            numMoves++;
                        }
                    }
                }
            }
        }
    }
    return numMoves;
}

function areValidMoves(G, ctx, clickedId) {
    //mark all spaces with active moves
    let coords = getCoordinates(clickedId);
    let type = G.cells[clickedId].type;
    if (type == "p" || type == "P") {
        var tempCoords = offset(coords, -1, ctx.currentPlayer == 0 ? -1 : 1);
        if (onBoard(tempCoords)) {
            if (G.cells[toId(tempCoords)].player != ctx.currentPlayer
                && G.cells[toId(tempCoords)].player != -1) {
                return true;
            }
        }
        tempCoords = offset(coords, 1, ctx.currentPlayer == 0 ? -1 : 1);
        if (onBoard(tempCoords)) {
            if (G.cells[toId(tempCoords)].player != ctx.currentPlayer
                && G.cells[toId(tempCoords)].player != -1) {
                return true;
            }
        }
        tempCoords = offset(coords, 0, ctx.currentPlayer == 0 ? -1 : 1);
        if (onBoard(tempCoords)) {
            if (G.cells[toId(tempCoords)].player == -1) {
                return true;
            }
        }
        if (type == "P" && G.cells[toId(tempCoords)].valid) {
            tempCoords = offset(coords, 0, ctx.currentPlayer == 0 ? -2 : 2);
            if (onBoard(tempCoords)) {
                if (G.cells[toId(tempCoords)].player == -1) {
                    return true;
                }
            }
        }
    }
    if (type == "N") {
        var tempCoords;
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 5; j++) {
                let dx = -2 + i;
                let dy = -2 + j;
                if (Math.abs(dx) != Math.abs(dy) && dx != 0 && dy != 0) {
                    tempCoords = offset(coords, dx, dy);
                    if (onBoard(tempCoords)) {
                        if (G.cells[toId(tempCoords)].player != ctx.currentPlayer) {
                            return true;
                        }
                    }
                }
            }
        }
    }
    if (type == "B" || type == "Q") {
        let dx = -1;
        let dy = -1;
        var tempCoords;
        for (let n = 0; n < 2; n++) {
            for (let m = 0; m < 2; m++) {
                tempCoords = coords;
                let offBoard = false;
                while (!offBoard) {
                    tempCoords = offset(tempCoords, dx, dy);
                    if (onBoard(tempCoords)) {
                        if (G.cells[toId(tempCoords)].player != ctx.currentPlayer) {
                            return true;
                        }
                        if (G.cells[toId(tempCoords)].player != -1) {
                            offBoard = true;
                        }
                    } else {
                        offBoard = true;
                    }
                }
                dy = dy * -1;
            }
            dx = dx * -1;
        }
    }
    if (type == "R" || type == "Q") {
        let dx = -1;
        var tempCoords;
        for (let i = 0; i < 2; i++) {
            tempCoords = coords;
            let offBoard = false;
            while (!offBoard) {
                tempCoords = offset(tempCoords, dx, 0);
                if (onBoard(tempCoords)) {
                    if (G.cells[toId(tempCoords)].player != ctx.currentPlayer) {
                        return true;
                    }
                    if (G.cells[toId(tempCoords)].player != -1) {
                        offBoard = true;
                    }
                } else {
                    offBoard = true;
                }
            }
            tempCoords = coords;
            offBoard = false;
            while (!offBoard) {
                tempCoords = offset(tempCoords, 0, dx);
                if (onBoard(tempCoords)) {
                    if (G.cells[toId(tempCoords)].player != ctx.currentPlayer) {
                        return true;
                    }
                    if (G.cells[toId(tempCoords)].player != -1) {
                        offBoard = true;
                    }
                } else {
                    offBoard = true;
                }
            }
            dx = dx * -1;
        }
    }
    if (type == "K") {
        var tempCoords;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                let dx = -1 + i;
                let dy = -1 + j;
                if (dx != 0 | dy != 0) {
                    tempCoords = offset(coords, dx, dy);
                    if (onBoard(tempCoords)) {
                        if (G.cells[toId(tempCoords)].player != ctx.currentPlayer) {
                            return true;
                        }
                    }
                }
            }
        }
    }
    return false;
}

function resetValidMoves(G) {
    for (let i = 0; i < 40; i++) {
        G.cells[i].valid = false;
    }
}

export const CheckTacToe = {
    setup: () => ({ cells: getStartArray(), activePiece: { id: -1, type: "" }, taken: [[], []], stage: "Select a piece" }),

    turn: {
        stages: {
            movePiece: {
                moves: {
                    clickCell: (G, ctx, clickedId) => {
                        //check if valid square
                        let clickedCell = G.cells[clickedId];
                        if (clickedCell.valid) {
                            if (G.activePiece.type == "p") { //promote
                                if ((clickedId >= 4 && clickedId < 8) || (clickedId >= 32 && clickedId < 36)) {
                                    ctx.events.setStage('promote');
                                    G.stage = "Promote your pawn";
                                    clickedCell.player = ctx.currentPlayer;
                                    clickedCell.type = G.activePiece.type;
                                    G.cells[G.activePiece.id].player = -1;
                                    G.cells[G.activePiece.id].type = "";
                                    G.activePiece.id = clickedId;
                                    G.activePiece.type = "p";
                                    resetValidMoves(G);
                                    return;
                                }
                            }
                            if (G.activePiece.type == "P") {
                                G.activePiece.type = "p";
                            }
                            if (clickedCell.player >= 0) {
                                G.taken[clickedCell.player].push(G.activePiece.type);
                            }
                            clickedCell.player = ctx.currentPlayer;
                            clickedCell.type = G.activePiece.type;
                            G.cells[G.activePiece.id].player = -1;
                            G.cells[G.activePiece.id].type = "";
                            G.activePiece.id = -1;
                            G.activePiece.type = "";
                            resetValidMoves(G);
                            ctx.events.endTurn();
                            G.stage = "Select a piece";
                        } else {
                            if (clickedCell.player == ctx.currentPlayer) {
                                G.activePiece.id = clickedId;
                                G.activePiece.type = clickedCell.type;
                                markValidMoves(G, ctx, clickedId);
                                ctx.events.setStage('movePiece');
                                G.stage = "Move selected piece";
                            } else {
                                G.activePiece.id = -1;
                                G.activePiece.type = "";
                                resetValidMoves(G);
                                ctx.events.endStage();
                                G.stage = "Select a piece";
                            }
                        }
                        //if not
                        //if your piece, set active piece
                        //else, reset active piece, endstage
                        //else
                        //if piece, take, move piece
                        //else, move piece
                        //end turn
                    }
                }
            },
            promote: {
                moves: {
                    choosePiece: (G, ctx, clickedId) => {
                        if (clickedId == 0) {
                            G.cells[G.activePiece.id].type = "Q";
                        } else if (clickedId == 1) {
                            G.cells[G.activePiece.id].type = "R";
                        } else if (clickedId == 2) {
                            G.cells[G.activePiece.id].type = "B";
                        } else if (clickedId == 3) {
                            G.cells[G.activePiece.id].type = "N";
                        }
                        G.activePiece.id = -1;
                        G.activePiece.type = "";
                        ctx.events.endTurn();
                        G.stage = "Select a piece";
                    }
                }
            }
        }
    },

    moves: {
        clickCell: (G, ctx, clickedId) => {
            if (G.cells[clickedId].player == ctx.currentPlayer) { //select piece
                G.activePiece.id = clickedId;
                G.activePiece.type = G.cells[clickedId].type;
                markValidMoves(G, ctx, clickedId);
                ctx.events.setStage('movePiece');
                G.stage = "Move selected piece";
            }
        }
    },

    endIf: (G, ctx) => {
        if (isVictory(G.cells)) {
            return { winner: ctx.currentPlayer };
        }
        if (isDraw(G)) {
            return { draw: true }
        }
    },

    onEnd: (G, ctx) => {
        getVictoryCells(G.cells);
    },

    ai: {
        enumerate: (G, ctx) => {
            let moves = [];
            if(G.stage == "Promote your pawn") {
                for(let i = 0;i < 4;i++) {
                    moves.push({ move: 'choosePiece', args: [i] });
                }
            } else if (G.activePiece.id == -1) {
                for (let i = 0; i < 40; i++) {
                    if (G.cells[i].player == ctx.currentPlayer) {
                        if(areValidMoves(G, ctx, i)) {
                            moves.push({ move: 'clickCell', args: [i] });
                        }
                    }
                }
            } else {
                for (let i = 0; i < 40; i++) {
                    if (G.cells[i].valid) {
                        moves.push({ move: 'clickCell', args: [i] });
                    }
                }
            }
            return moves;
        },
    },
};