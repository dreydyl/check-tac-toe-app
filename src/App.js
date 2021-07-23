import { Client } from 'boardgame.io/client';
import { TicTacToe } from './Game';

class TicTacToeClient {
  constructor() {
    this.client = Client({ game: TicTacToe });
    this.client.start();
    this.rootElement = document.getElementById("app");
    this.createBoard();
    this.attachListeners();
    this.client.subscribe(state => this.update(state));
  }

  createBoard() {
    const rows = [];
    for(let i = 0;i < 3;i++) {
        const cells = [];
        for(let j = 0;j < 3;j++) {
            const id = 3 * i + j;
            cells.push(`<td class="cell" data-id="${id}"></td>`);
        }
        rows.push(`<tr>${cells.join('')}</tr>`);
    }

    this.rootElement.innerHTML = `
        <table>${rows.join('')}</table>
        <p class="winner"></p>
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
  }

  update(state) {
      const cells = this.rootElement.querySelectorAll('.cell');

      cells.forEach(cell => {
          const cellId = parseInt(cell.dataset.id);
          const cellValue = state.G.cells[cellId];
          cell.innerHTML = cellValue !== null ? cellValue : '';
      });

      const messageEl = this.rootElement.querySelector('.winner');

      if(state.ctx.gameover) {
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
const app = new TicTacToeClient(appElement);