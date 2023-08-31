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

const animationDelay = 100; // Adjust this value for slower/faster animation
let lastUpdateTime = 0;

function draw(timestamp) {
  if (timestamp - lastUpdateTime >= animationDelay) {
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

let mediaRecorder = null;

function resetAnimation() {
  currentChar = 0;
  yOffset = 30;
  cursorVisible = true;
}

startButton.addEventListener('click', async () => {
  if (mediaRecorder) {
    mediaRecorder.stop();
    cancelAnimationFrame(animationFrameId);
  }

  recordedChunks = [];
  canvas.style.visibility = 'visible'; // Show the canvas

  startButton.disabled = true;
  stopButton.disabled = false;

  resetAnimation(); // Reset animation variables

  const stream = canvas.captureStream();
  mediaRecorder = new MediaRecorder(stream);

  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      recordedChunks.push(event.data);
    }
  };

  mediaRecorder.onstop = () => {
    cancelAnimationFrame(animationFrameId);

    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const formData = new FormData();
    formData.append('video', blob);

    fetch('/upload', {
      method: 'POST',
      body: formData
    })
      .then(response => response.text())
      .then(filename => {
        downloadLink.href = `/download/${filename}`;
        downloadLink.style.display = 'block';
      });
  };

  mediaRecorder.start();
  resetAnimation(); // Reset animation variables
  animationFrameId = requestAnimationFrame(draw);
});

stopButton.addEventListener('click', () => {
    if (mediaRecorder) {
        mediaRecorder.stop();
    }
    stopButton.disabled = true;
    startButton.disabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    cancelAnimationFrame(animationFrameId);
});
