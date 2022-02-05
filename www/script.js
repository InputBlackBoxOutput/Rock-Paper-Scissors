// DOM linking
let token = undefined;
const computerToken = document.querySelector("#computer-token");

const scoreBoard = document.getElementById("score-board");
let scoreC = 0;
const scoreComputer = document.querySelector("#score-computer");
let scoreP = 0;
const scorePlayer = document.querySelector("#score-player");

const video = document.querySelector("#webcam");
const startButton = document.querySelector("#start");
const stopButton = document.querySelector("#stop");
startButton.disabled = false;
stopButton.disabled = true;

const canvas = document.querySelector("#canvas");
const canvasContext = canvas.getContext("2d");
// canvas.hidden = false;

// ///////////////////////////////////////////////////////////////////////////
// Check if device is a mobile device

let width = 640;
let height = 480;

function isMobileDevice() {
  if (
    screen.width < 500 ||
    navigator.userAgent.match(/Android/i) ||
    navigator.userAgent.match(/webOS/i) ||
    navigator.userAgent.match(/iPhone/i) ||
    navigator.userAgent.match(/iPod/i)
  ) {
    return true;
  }
  return false;
}

if (isMobileDevice()) {
  computerToken.hidden = true;
  video.hidden = true;

  startButton.hidden = true;
  startButton.disabled = true;
  stopButton.hidden = true;
  stopButton.disabled = true;
  scoreBoard.hidden = true;

  document.getElementById("mobile").hidden = false;
}

//////////////////////////////////////////////////////////////////////////
// Preload some of the images

function preloadImages() {
  let images = new Array();

  for (let i = 0; i < 10; i++) images[i] = new Image();

  images[1].src = "images/outcomes/paper-paper.png";
  images[2].src = "images/outcomes/paper-rock.png";
  images[3].src = "images/outcomes/paper-scissors.png";

  images[4].src = "images/outcomes/rock-paper.png";
  images[5].src = "images/outcomes/rock-rock.png";
  images[6].src = "images/outcomes/rock-scissors.png";

  images[7].src = "images/outcomes/scissors-paper.png";
  images[8].src = "images/outcomes/scissors-rock.png";
  images[9].src = "images/outcomes/scissors-scissors.png";

  images[0].src = "images/outcomes/none.png";
}

preloadImages();

//////////////////////////////////////////////////////////////////////////
// Setup camera
const camera = new Camera(video, {
  onFrame: async () => {
    await hands.send({ image: video });
  },
  width: 640,
  height: 480,
});

//////////////////////////////////////////////////////////////////////////
// Setup game control buttons
startButton.addEventListener("click", () => {
  startButton.disabled = true;
  stopButton.disabled = false;
  access = camera.start();

  access
    .then((e) => {
      computerToken.src = "images/setup.png";
      setTimeout(function () {
        game();
      }, 7000);
    })
    .catch((e) => {
      alert("Camera access is required to play the game");
    });
});

stopButton.addEventListener("click", () => {
  location.reload();
});

//////////////////////////////////////////////////////////////////////////
// Setup hand pose estimation
let landmarks = undefined;

function onResultsHands(results) {
  //   canvasContext.save();
  //   canvasContext.clearRect(0, 0, canvas.width, canvas.height);
  //   canvasContext.drawImage(results.image, 0, 0, canvas.width, canvas.height);

  landmarks = undefined;
  if (results.multiHandLandmarks && results.multiHandedness) {
    for (let index = 0; index < results.multiHandLandmarks.length; index++) {
      landmarks = results.multiHandLandmarks[index];

      //   const classification = results.multiHandedness[index];
      //   const isRightHand = classification.label === "Right";

      //   drawConnectors(canvasContext, landmarks, HAND_CONNECTIONS, {
      //     color: isRightHand ? "#00FF00" : "#FF0000",
      //   }),
      //     drawLandmarks(canvasContext, landmarks, {
      //       color: isRightHand ? "#00FF00" : "#FF0000",
      //       fillColor: isRightHand ? "#FF0000" : "#00FF00",
      //       radius: (x) => {
      //         return lerp(x.from.z, -0.15, 0.1, 10, 1);
      //       },
      //     });
    }
  }
  canvasContext.restore();
}

const hands = new Hands({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.1/${file}`;
  },
});
hands.onResults(onResultsHands);

// Controls
new ControlPanel(document.createElement("div"), {
  selfieMode: true,
  maxNumHands: 1,
  minDetectionConfidence: 0.75,
  minTrackingConfidence: 0.75,
}).on((options) => {
  video.classList.toggle("selfie", options.selfieMode);
  // console.log(options);
  hands.setOptions(options);
});

//////////////////////////////////////////////////////////////////////////

function game() {
  let count = 3;
  let timer = setInterval(function () {
    handleTimer(count);
  }, 1000);
  const roundWait = 3000;

  function handleTimer() {
    if (count === 0) {
      clearInterval(timer);

      // Show computer token // 1:'paper', 2:'rock', 3:'scissors'
      token = chance.integer({ min: 1, max: 3 });

      if (token == 1) computerToken.src = "images/paper.png";
      else if (token == 2) computerToken.src = "images/rock.png";
      else computerToken.src = "images/scissors.png";

      // Get prediction
      if (landmarks != undefined) {
        pred = randomForestClassifier(landmarks);
        console.log(pred);

        if (pred === "P") {
          switch (token) {
            case 1:
              computerToken.src = "images/outcomes/paper-paper.png";
              break;
            case 2:
              computerToken.src = "images/outcomes/rock-paper.png";
              break;
            case 3:
              computerToken.src = "images/outcomes/scissors-paper.png";
              break;
          }

          if (token == 2) scoreP += 1;
          if (token == 3) scoreC += 1;

          scorePlayer.innerText = scoreP;
          scoreComputer.innerText = scoreC;
        } else if (pred === "R") {
          switch (token) {
            case 1:
              computerToken.src = "images/outcomes/paper-rock.png";
              break;
            case 2:
              computerToken.src = "images/outcomes/rock-rock.png";
              break;
            case 3:
              computerToken.src = "images/outcomes/scissors-rock.png";
              break;
          }

          if (token == 3) scoreP += 1;
          if (token == 1) scoreC += 1;

          scorePlayer.innerText = scoreP;
          scoreComputer.innerText = scoreC;
        } else if (pred == "S") {
          switch (token) {
            case 1:
              computerToken.src = "images/outcomes/paper-scissors.png";
              break;
            case 2:
              computerToken.src = "images/outcomes/rock-scissors.png";
              break;
            case 3:
              computerToken.src = "images/outcomes/scissors-scissors.png";
              break;
          }

          if (token == 1) scoreP += 1;
          if (token == 2) scoreC += 1;

          scorePlayer.innerText = scoreP;
          scoreComputer.innerText = scoreC;
        }
      } else {
        clearInterval(timer);
        computerToken.src = "images/outcomes/none.png";
      }

      // Restart counter
      setTimeout(function () {
        game();
      }, roundWait);
    } else {
      computerToken.src = `images/${count}.png`;
      count--;
    }
  }
}
//////////////////////////////////////////////////////////////////////////
