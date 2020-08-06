let canvas;
let pointsDisplay;
let treesToPlantDisplay;
let roundDisplay;
let trees = [];
let nextRoundButton;
let startPlantingButton;
let startGameButton;
let gameAreaX = 500;
let gameAreaY = 500;
let canvasX = 1000;
let canvasY = 500;
let startTrees = 40;

const SIZE_SMALL = 0;
const SIZE_MEDIUM = 1;
const SIZE_LARGE = 2;
const SIZE_LARGE_WITH_ZAPFEN = 3;

let round = 1;
let treesToPlant = 0;
let harvestMode = true;
let points = 0;
let pointsHistory = [];

const SIZES = [
  30,
  70,
  110,
  110,
];

class Tree {
  constructor(size, posX, posY) {
    this.size = size;
    this.posX = posX;
    this.posY = posY;
  }

  get drawPosX() {
    return this.posX;
  }

  get drawPosY() {
    return this.posY;
  }

  get drawSize() {
    return SIZES[this.size];
  }

  get canBeHarvested() {
    return this.size > 0;
  }

  get mouseIsOver() {
    return dist(mouseX, mouseY, this.posX, this.posY) <= this.drawSize / 2;
  }

  get hasZapfen() {
    return this.size === SIZE_LARGE_WITH_ZAPFEN;
  }

  get canGrow() {
    return !trees.find(tree => {
      if (tree === this) return false;
      return dist(this.posX, this.posY, tree.posX, tree.posY) <= SIZES[this.nextGrowthStage]/2 + tree.drawSize / 2;
    });
  }

  get nextGrowthStage() {
    if (this.size === SIZE_LARGE_WITH_ZAPFEN) return SIZE_LARGE_WITH_ZAPFEN;
    return this.size + 1;
  }

  draw() {
    // noStroke();
    if (this.size >= SIZE_LARGE) {
      if (this.size === SIZE_LARGE_WITH_ZAPFEN) {
        fill(45,74,26);
      } else {
        fill(105,155,44);
      }
      ellipse(this.drawPosX, this.drawPosY, SIZES[SIZE_LARGE]);
    }
    if (this.size === SIZE_MEDIUM) {
      fill(105,155,44);
      ellipse(this.drawPosX, this.drawPosY, SIZES[SIZE_MEDIUM]);
    }
    if (this.size === SIZE_SMALL) {
      fill(184,207,105);
      ellipse(this.drawPosX, this.drawPosY, SIZES[SIZE_SMALL]);
    }
    if (this.size === SIZE_LARGE_WITH_ZAPFEN) {
      //TODO: draw zapfen
    }
  }

  grow() {
    if (this.canGrow) this.size = this.nextGrowthStage;
  }
}

function setup() {
  canvas = createCanvas(canvasX, canvasY);
  canvas.mouseClicked(onClick);
  startGameButton = createButton('Start Game');
  startGameButton.mousePressed(initGame);
}

function initGame() {
  pointsDisplay = createElement('strong', 'Points: 0');
  treesToPlantDisplay = createElement('strong', 'Saplings: 0');
  roundDisplay = createElement('strong', 'Year: 1');
  nextRoundButton = createButton('Next Round');
  nextRoundButton.mousePressed(endRound);
  startPlantingButton = createButton('Plant Trees');
  startPlantingButton.mousePressed(startPlanting);
  updateTreesToPlantDisplay();
  populateForest();
  startGameButton.remove();
}

function draw() {
  background(200);
  fill(255);
  noStroke();
  rect(SIZES[SIZE_LARGE_WITH_ZAPFEN]/2, SIZES[SIZE_LARGE_WITH_ZAPFEN]/2, gameAreaX - SIZES[SIZE_LARGE_WITH_ZAPFEN], gameAreaY - SIZES[SIZE_LARGE_WITH_ZAPFEN]);
  trees.forEach(tree => tree.draw());
  if (!harvestMode && treesToPlant > 0) drawMockTree();
  drawTreeSizeDistribution();
  drawPointsHistory();
}

function endRound() {
  trees.forEach(tree => tree.grow());
  harvestMode = true;
  round++;
  pointsHistory.push(points);
  resetPoints();
  updateRoundDisplay();
  enableButton(startPlantingButton);
}

function addPoint() {
  points++;
  updatePointsDisplay();
}

function resetPoints() {
  points = 0;
  updatePointsDisplay();
}

function addTreesToPlant() {
  treesToPlant++;
  updateTreesToPlantDisplay();
}

function removeTreesToPlant() {
  treesToPlant--;
  updateTreesToPlantDisplay();
}

function updatePointsDisplay() {
  pointsDisplay.html(`Points this round: ${points} Points overall: ${pointsOverall()}`);
}

function updateTreesToPlantDisplay() {
  treesToPlantDisplay.html(`Saplings: ${treesToPlant}`);
}

function updateRoundDisplay() {
  roundDisplay.html(`Year: ${round}`);
}

function onClick() {
  if (harvestMode) {
    let tree = trees.find(tree => tree.mouseIsOver);
    if (tree && tree.canBeHarvested) {
      const index = trees.indexOf(tree);
      trees.splice(index, 1);
      addPoint();
      if (tree.hasZapfen) addTreesToPlant();
    }
  } else {
    if (!positionIsOutOufBounds(mouseX, mouseY)) {
      if(treesToPlant === 0) return;
      if(trees.find(tree => treeIsTooClose(tree, mouseX, mouseY))) return;
      addTree(new Tree(0, mouseX, mouseY));
      removeTreesToPlant();
    }
  }
}

function addTree(tree) {
  trees.push(tree);
}

function startPlanting() {
  harvestMode = false;
  disableButton(startPlantingButton);
}

function disableButton(button) {
  button.attribute('disabled', '');
}

function enableButton(button) {
  button.removeAttribute('disabled');
}

function treeIsTooClose(tree, x, y) {
  return treeIsTooCloseSize(tree, x, y, SIZE_SMALL);
}

function treeIsTooCloseSize(tree, x, y, size) {
  return dist(x, y, tree.posX, tree.posY) <= SIZES[size]/2 + tree.drawSize / 2;
}

function positionIsOutOufBounds(x, y) {
  return x <= SIZES[SIZE_LARGE_WITH_ZAPFEN]/2
    || x >= gameAreaX - SIZES[SIZE_LARGE_WITH_ZAPFEN]/2
    || y <= SIZES[SIZE_LARGE_WITH_ZAPFEN]/2
    || y >= gameAreaY - SIZES[SIZE_LARGE_WITH_ZAPFEN]/2;
}

function drawMockTree() {
  noStroke();
  if (!trees.find(tree => treeIsTooClose(tree, mouseX, mouseY)) && !positionIsOutOufBounds(mouseX, mouseY)) {
    fill(184,207,105);
  } else {
    fill(255,51,51);
  }
  ellipse(mouseX, mouseY, SIZES[0], SIZES[0]);
}

function populateForest() {
  for (let i = 0; i < startTrees; i++) {
    let searched = 0;
    let size = Math.floor(random(SIZE_SMALL, SIZE_LARGE_WITH_ZAPFEN + 1));
    let x;
    let y;
    do {
      x = Math.floor(random(0, gameAreaX));
      y = Math.floor(random(0, gameAreaY));
      if (searched > 1000) return;
      searched++;
    } while(!!trees.find(tree => treeIsTooCloseSize(tree, x, y, size)) || positionIsOutOufBounds(x, y))
    addTree(new Tree(size, x, y));
  }
}

function getAllTreeCount() {
  return trees.length;
}

function getTreeCountBySize(size) {
  return trees.filter(tree => tree.size === size).length;
}

function getSmallTreeCount() {
  return getTreeCountBySize(SIZE_SMALL);
}

function getMediumTreeCount() {
  return getTreeCountBySize(SIZE_MEDIUM);
}

function getLargeTreeCount() {
  return getTreeCountBySize(SIZE_LARGE);
}

function getLargeWithZapfenTreeCount() {
  return getTreeCountBySize(SIZE_LARGE_WITH_ZAPFEN);
}

function sizeDistributionGraphWidth() {
  return canvasX - gameAreaX;
}

function calcBarWidth(width, count, allCount) {
  return width / allCount * count;
}

function drawPointsHistory() {
  const x0 = gameAreaX;
  const y = 30;
  const h = 30;
  const bottom = y + h;
  const width = sizeDistributionGraphWidth();
  let max = 1;
  const pointsToDraw = [];
  pointsHistory.forEach((item, i) => {
    if (item > max) max = item;
  });
  if (points > max) max = points;
  const count = pointsHistory.length + 1
  fill(255);
  rect(gameAreaX, y, width, h);
  stroke(0, 0, 0);
  if (count == 0) {
    line(x0, bottom, x0 + width, bottom - (h / max * points));
  } else {
    line(
      x0,
      bottom,
      x0 + width / count * 1,
      bottom - (h / max * pointsHistory[0]));
    if (pointsHistory.length > 1) {
      for(let i = 0; i < pointsHistory.length - 1; i++) {
        line(
          x0 + width / count * (i + 1),
          bottom - (h / max * pointsHistory[i]),
          x0 + width / count * (i + 2),
          bottom - (h / max * pointsHistory[i + 1])
        );
      }
    }
    line(
      x0 + width / count * (pointsHistory.length),
      bottom - (h / max * pointsHistory[pointsHistory.length - 1]),
      x0 + width,
      bottom - (h / max * points));
  }
  noStroke();
}

function drawTreeSizeDistribution() {
  const y = 0;
  const h = 30;
  const width = sizeDistributionGraphWidth();
  const allCount = getAllTreeCount();
  const smallCount = getSmallTreeCount();
  const mediumCount = getMediumTreeCount();
  const largeCount = getLargeTreeCount();
  const largeWithZapfenCount = getLargeWithZapfenTreeCount();
  rect(gameAreaX, y, width, h);

  let smallTreesBar = {
    x: gameAreaX,
    y,
    w: calcBarWidth(width, smallCount, allCount),
    h,
  };
  let mediumTreesBar = {
    x: smallTreesBar.x + smallTreesBar.w,
    y,
    w: calcBarWidth(width, mediumCount, allCount),
    h,
  };
  let largeTreesBar = {
    x: mediumTreesBar.x + mediumTreesBar.w,
    y,
    w: calcBarWidth(width, largeCount, allCount),
    h,
  };
  let largeWithZapfenTreesBar = {
    x: largeTreesBar.x + largeTreesBar.w,
    y,
    w: largeTreesBar.x + largeTreesBar.w,
    h,
  };
  //Small
  fill(184,207,105);
  rect(smallTreesBar.x, smallTreesBar.y, smallTreesBar.w, smallTreesBar.h);
  fill(0);
  text(smallCount, smallTreesBar.x, smallTreesBar.y, smallTreesBar.w, smallTreesBar.h);
  //Medium
  fill(105,155,44);
  rect(mediumTreesBar.x, mediumTreesBar.y, mediumTreesBar.w, mediumTreesBar.h);
  fill(0);
  text(mediumCount, mediumTreesBar.x, mediumTreesBar.y, mediumTreesBar.w, mediumTreesBar.h);
  //Large
  fill(105,155,44);
  rect(largeTreesBar.x, largeTreesBar.y, largeTreesBar.w, largeTreesBar.h);
  fill(0);
  text(largeCount, largeTreesBar.x, largeTreesBar.y, largeTreesBar.w, largeTreesBar.h);
  //Large with Zapfen
  fill(45,74,26);
  rect(largeWithZapfenTreesBar.x, largeWithZapfenTreesBar.y, largeWithZapfenTreesBar.w, largeWithZapfenTreesBar.h);
  fill(0);
  text(largeWithZapfenCount, largeWithZapfenTreesBar.x, largeWithZapfenTreesBar.y, largeWithZapfenTreesBar.w, largeWithZapfenTreesBar.h);
}

function pointsOverall() {
  let all = points;
  pointsHistory.forEach(item => {
    all += item;
  });
  return all;
}
