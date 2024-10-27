// Initialize variables
let balance = 1000;
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
    width: 300,
    height: 400,
    wireframes: false,
    background: "#222",
  },
});

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
        { isStatic: true, restitution: 0.6, render: { fillStyle: "#ffeb3b" } }
      );
      World.add(world, peg);
    }
  }
}

// Create slots at the bottom
function createSlots() {
  const slotWidth = render.options.width / slotMultipliers.length;

  for (let i = 0; i < slotMultipliers.length; i++) {
    const x = i * slotWidth + slotWidth / 2;
    
    const slotBoundary = Bodies.rectangle(
      x,
      render.options.height - 10,
      slotWidth,
      20,
      { isStatic: true, label: `slot-${slotMultipliers[i]}`, render: { fillStyle: "#555" } }
    );
    
    World.add(world, slotBoundary);

    const multiplierText = document.createElement("div");
    multiplierText.classList.add("slot");
    multiplierText.textContent = `${slotMultipliers[i]}x`;
    multiplierText.style.left = `${i * slotWidth + 5}px`;
    multiplierText.style.bottom = "0px";
    multiplierText.style.width = `${slotWidth - 10}px`;
    multiplierText.setAttribute("data-multiplier", slotMultipliers[i]);
    board.appendChild(multiplierText);
  }
}

// Create boundary walls to prevent the ball from going off-screen
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

// Play game with physics and multiple balls
function playGame() {
  const betAmount = parseInt(document.getElementById("betAmount").value, 10);
  if (isNaN(betAmount) || betAmount < 1 || betAmount > balance) {
    alert("Invalid bet amount.");
    return;
  }

  balance -= betAmount;
  balanceDisplay.textContent = balance;

  // Randomize initial ball position and add slight horizontal velocity for randomness
  const startX = render.options.width / 2 + (Math.random() * 40 - 20);
  const ball = Bodies.circle(startX, 0, 8, {
    restitution: 0.6,
    friction: 0,
    label: "ball",
    render: { fillStyle: "#03a9f4" }
  });

  ball.betAmount = betAmount; // Attach the bet amount to the ball for calculation
  World.add(world, ball);

  // Set initial velocity for varied motion
  Body.setVelocity(ball, { x: Math.random() * 2 - 1, y: 0 });
}

// Detect collision of each ball with a slot individually
Events.on(engine, "collisionStart", function (event) {
  event.pairs.forEach(({ bodyA, bodyB }) => {
    const ball = bodyA.label === "ball" ? bodyA : (bodyB.label === "ball" ? bodyB : null);
    const slotBody = bodyA.label.startsWith("slot-") ? bodyA : (bodyB.label.startsWith("slot-") ? bodyB : null);
    
    if (ball && slotBody) {
      const multiplier = parseInt(slotBody.label.split("-")[1], 10);
      const winnings = multiplier * ball.betAmount;

      // Update balance and display result
      balance += winnings;
      balanceDisplay.textContent = balance;
      resultDisplay.textContent = `You won $${winnings}`;

      // Remove only the specific ball that landed in a slot
      World.remove(world, ball);
    }
  });
});

// Initialize board and run the engine
createPegs();
createSlots();
createBoundaryWalls(); // Add boundary walls
Engine.run(engine);
Render.run(render);
