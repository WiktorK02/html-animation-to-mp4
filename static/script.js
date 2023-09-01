const startButton = document.getElementById('startBtn');
const stopButton = document.getElementById('stopBtn');

const downloadLink = document.getElementById('downloadLink');
const canvas = document.getElementById('animationCanvas');
canvas.width = 640;
canvas.height = 480;
const ctx = canvas.getContext('2d');
let animationFrameId;

const code = `
# Python3 program to add two numbers
num1 = 15
num2 = 12

# Adding two nos
sum = num1 + num2

# printing values
print("Sum of", num1, "and", num2 , "is", sum)
`;

let cursorVisible = true;
let yOffset = 30;
let currentChar = 0;

// Adjust this value for slower/faster animation
const animationDelay = 100;
let animationSpeed = animationDelay; // Added animationSpeed variable
let lastUpdateTime = 0;

function draw(timestamp) {
  if (timestamp - lastUpdateTime >= animationSpeed) { // Use animationSpeed here
    lastUpdateTime = timestamp;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw code editor background
    ctx.fillStyle = "#272822";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw text
    ctx.font = "18px Consolas, monospace";
    ctx.fillStyle = "#F8F8F2";

    const visibleCode = code.substring(0, currentChar);
    const lines = visibleCode.split('\n');
    lines.forEach((line, index) => {
      ctx.fillText(line, 20, yOffset + (index * 30));
    });

    // Draw cursor
    ctx.fillStyle = cursorVisible ? "#F8F8F2" : "transparent";
    const cursorLine = lines.length - 1;
    ctx.fillText("_", 20 + ctx.measureText(lines[cursorLine]).width, yOffset + (cursorLine * 30));

    cursorVisible = !cursorVisible;

    if (currentChar < code.length) {
      currentChar++;
    } else {
      currentChar = 0;
      yOffset = 30;
    }
  }

  requestAnimationFrame(draw);
}

draw();

const frames = []; // Array to store captured frames

function captureFrame() {
  html2canvas(canvas).then((canvas) => {
    const frame = canvas.toDataURL('image/jpeg', 0.8); // Convert the canvas to an image
    frames.push(frame);

    if (currentChar < code.length) {
      currentChar++;
      requestAnimationFrame(captureFrame);
    } else {
      // All frames captured, send them to the server
      fetch('/convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ frames }),
      })
        .then(response => response.text())
        .then(filename => {
          downloadLink.href = `/download/${filename}`;
          downloadLink.style.display = 'block';
        });
    }
  });
}

startButton.addEventListener('click', () => {
  frames.length = 0; // Clear frames array
  resetAnimation(); // Reset animation variables
  animationSpeed = animationDelay; // Set animation speed
  captureFrame(); // Start capturing frames
});

stopButton.addEventListener('click', () => {
  frames.length = 0; // Clear frames array
  resetAnimation(); // Reset animation variables
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  cancelAnimationFrame(animationFrameId);
});

function resetAnimation() {
  currentChar = 0;
  yOffset = 30;
  cursorVisible = true;
  animationSpeed = animationDelay; // Reset animation speed
}

