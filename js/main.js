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
    onReaction: (reactantIds, productIds, enthalpyKJ, points) => {
      ui.addReactionLog(reactantIds, productIds);
      ui.showReactionPopup(reactantIds, productIds, enthalpyKJ, points);
    },
    onFission: (targetId, neutronId, fragmentIds, neutronCount, energyKJ, points) => {
      ui.addFissionLog(targetId, neutronId, fragmentIds, neutronCount);
      ui.showFissionPopup(targetId, neutronId, fragmentIds, neutronCount, energyKJ, points);
    },
    onCapture: (targetId, neutronId, capturedId) => {
      ui.showNuclearChangePopup([targetId, neutronId], [capturedId], "中性子を捕まえたよ");
      ui.addNuclearChangeLog([targetId, neutronId], [capturedId]);
    },
    onDecay: (fromId, toId) => {
      ui.showNuclearChangePopup([fromId], [toId], "β崩壊で別の元素に変わったよ");
      ui.addNuclearChangeLog([fromId], [toId]);
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
