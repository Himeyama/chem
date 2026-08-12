import { Game } from "./game.js";
import { UI } from "./ui.js";

const canvas = document.getElementById("gameCanvas");
const ui = new UI();
let game = null;

function startGame() {
  ui.hideGameOver();
  ui.updateScore(0);
  ui.clearReactionLog();

  game = new Game(canvas, {
    onScoreChange: (delta, total) => {
      ui.updateScore(total);
      ui.flashScore(delta);
    },
    onReaction: (substanceIdA, substanceIdB, productId, enthalpyKJ, points) => {
      ui.addReactionLog(substanceIdA, substanceIdB, productId);
      ui.showReactionPopup(substanceIdA, substanceIdB, productId, enthalpyKJ, points);
    },
    onNextChange: (substanceId) => {
      ui.updateNext(substanceId);
    },
    onGameOver: (score) => {
      ui.showGameOver(score);
    },
  });

  game.start();
}

document.getElementById("retryButton").addEventListener("click", () => {
  startGame();
});

startGame();
