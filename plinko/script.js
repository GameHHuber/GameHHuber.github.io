// Initialize variables
let balance = 0;
let totalAddedAmount = 0;
const maxAllowedAmount = 10000;
const slotMultipliers = [0, 2, 5, 10, 15, 5, 2, 0];
const board = document.getElementById("plinko-board");
const balanceDisplay = document.getElementById("balance");
const resultDisplay = document.getElementById("result");

// Matter.js engine setup
const { Engine, Render, World, Bodies, Body, Events } = Matter;
const engine = Engine.create();
const world = engine.world;
world.gravity.y = 1; // Set gravity for a realistic fall

const render = Render.create({
  element: board,
  engine: engine,
  options: {
    width: 320,
    height: 450,
    wireframes: false,
    background: "#1c1c1e",
  },
});

// Function to open the Add Money modal
function openAddMoneyModal() {
  document.getElementById("modal-overlay").style.display = "flex";
}

// Function to close the Add Money modal
function closeAddMoneyModal() {
  document.getElementById("modal-overlay").style.display = "none";
}

// Function to add money (accepts any card number)
function addMoney() {
  const addAmount = parseInt(document.getElementById("addAmount").value, 10);

  if (totalAddedAmount + addAmount > maxAllowedAmount) {
    alert("Transaction Declined: Maximum limit of $10,000 reached.");
    closeAddMoneyModal();
    return;
  }

  totalAddedAmount += addAmount;
  balance += addAmount;
  balanceDisplay.textContent = `$${balance}`;
  closeAddMoneyModal();
}

// Create pegs
function createPegs() {
  const rows = 8;
  const pegsPerRow = 7;
  const pegSpacingX = render.options.width / (pegsPerRow + 1);
  const pegSpacingY = render.options.height / (rows + 1);

  for (let y = 1; y <= rows; y++) {
    for (let x = 0; x < pegsPerRow; x++) {
      const xOffset = (y % 2 === 0) ? pegSpacingX / 2 : 0;
      const peg = Bodies.circle(
        x * pegSpacingX + xOffset + pegSpacingX,
        y * pegSpacingY,
        5,
        { isStatic: true, restitution: 0.6, render: { fillStyle: "#f5f5f7" } }
      );
      World.add(world, peg);
    }
  }
}

// Create slots within slot container
function createSlots() {
  const slotContainer = document.createElement("div");
  slotContainer.classList.add("slot-container");

  for (let i = 0; i < slotMultipliers.length; i++) {
    const multiplierText = document.createElement("div");
    multiplierText.classList.add("slot");
    multiplierText.textContent = `${slotMultipliers[i]}x`;
    multiplierText.setAttribute("data-multiplier", slotMultipliers[i]);

    slotContainer.appendChild(multiplierText);
  }

  board.appendChild(slotContainer);
}

// Boundary walls
function createBoundaryWalls() {
  const leftWall = Bodies.rectangle(-10, render.options.height / 2, 20, render.options.height, {
    isStatic: true,
    render: { fillStyle: "#444" }
  });

  const rightWall = Bodies.rectangle(render.options.width + 10, render.options.height / 2, 20, render.options.height, {
    isStatic: true,
    render: { fillStyle: "#444" }
  });

  World.add(world, [leftWall, rightWall]);
}

// Play game with multiple balls
function playGame() {
  const betAmount = parseInt(document.getElementById("betAmount").value, 10);
  if (isNaN(betAmount) || betAmount < 1 || betAmount > balance) {
    alert("Invalid bet amount.");
    return;
  }

  balance -= betAmount;
  balanceDisplay.textContent = `$${balance}`;

  const startX = render.options.width / 2 + (Math.random() * 40 - 20);
  const ball = Bodies.circle(startX, 0, 8, {
    restitution: 0.6,
    friction: 0,
    label: "ball",
    render: { fillStyle: "#0a84ff" }
  });

  ball.betAmount = betAmount;
  World.add(world, ball);
  Body.setVelocity(ball, { x: Math.random() * 2 - 1, y: 0 });
}

// Collision detection for individual balls
Events.on(engine, "collisionStart", function (event) {
  event.pairs.forEach(({ bodyA, bodyB }) => {
    const ball = bodyA.label === "ball" ? bodyA : (bodyB.label === "ball" ? bodyB : null);
    const slotBody = bodyA.label.startsWith("slot-") ? bodyA : (bodyB.label.startsWith("slot-") ? bodyB : null);

    if (ball && slotBody) {
      const multiplier = parseInt(slotBody.label.split("-")[1], 10);
      const winnings = multiplier * ball.betAmount;

      if (multiplier === 0) {
        resultDisplay.textContent = `You lost $${ball.betAmount}`;
      } else {
        resultDisplay.textContent = `You won $${winnings}`;
        balance += winnings;
      }

      balanceDisplay.textContent = `$${balance}`;
      World.remove(world, ball);
    }
  });
});

// Initialize and run the engine
createPegs();
createSlots();
createBoundaryWalls();
Engine.run(engine);
Render.run(render);
