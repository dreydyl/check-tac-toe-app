import { Client } from 'boardgame.io/client';
import { Local } from 'boardgame.io/multiplayer';
import { CheckTacToe } from './RealGame';

class CheckTacToeClient {
    constructor(rootElement, { playerID } = {}) {
        this.client = Client({
            game: CheckTacToe,
            multiplayer: Local(),
            playerID,
        });
        this.client.start();
        this.rootElement = rootElement;
        this.createBoard();
        this.attachListeners();
        this.client.subscribe(state => this.update(state));
    }

    createBoard() {
        const rows = [];
        for (let i = 0; i < 10; i++) {
            const cells = [];
            cells.push(`<td class="row">${10 - i}</td>`);
            for (let j = 0; j < 4; j++) {
                const id = 4 * i + j;
                cells.push(`<td class="cell ${id >= 12 && id < 28 ? " goal" : ""}" data-id="${id}"></td>`);
            }
            rows.push(`<tr>${cells.join('')}</tr>`);
        }
        var cells = [];
        cells.push(`<td></td>`);
        cells.push(`<td class="file">A</td>`);
        cells.push(`<td class="file">B</td>`);
        cells.push(`<td class="file">C</td>`);
        cells.push(`<td class="file">D</td>`);
        rows.push(`<tr>${cells.join('')}</tr>`);

        cells = [];
        cells.push(`<td></td>`);
        cells.push(`<td class="choice" data-id="0">Q</td>`);
        cells.push(`<td class="choice" data-id="1">R</td>`);
        cells.push(`<td class="choice" data-id="2">B</td>`);
        cells.push(`<td class="choice" data-id="3">N</td>`);
        rows.push(`<tr>${cells.join('')}</tr>`);

        this.rootElement.innerHTML = `
            <p class="player">Current Player: white</p>
            <p class="stage">Select Piece</p>
            <p class="winner"></p>
            <table>${rows.join('')}</table>
        `;
    }

    attachListeners() {
        const handleCellClick = event => {
            const id = parseInt(event.target.dataset.id);
            this.client.moves.clickCell(id);
        };
        const cells = this.rootElement.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.onclick = handleCellClick;
        });
        const handleChoiceClick = event => {
            const id = parseInt(event.target.dataset.id);
            this.client.moves.choosePiece(id);
        };
        const choices = this.rootElement.querySelectorAll('.choice');
        choices.forEach(choice => {
            choice.onclick = handleChoiceClick;
        });
    }

    update(state) {
        const cells = this.rootElement.querySelectorAll('.cell');

        cells.forEach(cell => {
            const cellId = parseInt(cell.dataset.id);
            const cellValue = state.G.cells[cellId].type;
            cell.innerHTML = cellValue !== null ? cellValue : '';
            const cellPlayer = state.G.cells[cellId].player;
            cell.style.color = cellPlayer == 0 ? "white" : "black";

            cell.style.backgroundColor = (state.G.cells[cellId].winning ? "fa4" : ((state.G.activePiece.id == cellId) ? "#44f" :
                (state.G.cells[cellId].valid ? "#4f4" : "#888")));
        });

        const player = this.rootElement.querySelector('.player');

        player.innerHTML = 'Current Player: ' + (state.ctx.currentPlayer == 0 ? 'white' : 'black');

        const stage = this.rootElement.querySelector('.stage');

        stage.innerHTML = state.G.stage;

        const messageEl = this.rootElement.querySelector('.winner');

        if (state.ctx.gameover) {
            messageEl.innerHTML =
                state.ctx.gameover.winner !== undefined
                    ? 'Winner: ' + state.ctx.gameover.winner
                    : 'Draw!';
        } else {
            messageEl.innerHTML = '';
        }
    }
}

const appElement = document.getElementById('app');
const playerIDs = ['0', '1'];
const clients = playerIDs.map(playerID => {
    const rootElement = document.createElement('div');
    appElement.append(rootElement);
    return new CheckTacToeClient(rootElement, { playerID });
});