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
let access = undefined;
startButton.disabled = false;
stopButton.disabled = true;

const canvas = document.querySelector("#canvas");
const canvasContext = canvas.getContext("2d");

const helpButton = document.getElementById("help-button");
const aboutButton = document.getElementById("about-button");

//////////////////////////////////////////////////////////////////////////
// Size canvas & computerToken image dynamically

const imageSrcWidth = 620;
const imageSrcHeight = 460;
const navbarFooterHeight = 150;

canvas.width = (window.innerWidth * (8 / 12)) - 10;
canvas.height = window.innerHeight - navbarFooterHeight;


computerToken.width = (window.innerWidth * (4 / 12)) - 10;
computerToken.height = computerToken.width  * (imageSrcHeight / imageSrcWidth) ;

//////////////////////////////////////////////////////////////////////////
// Preload some of the images

function preloadImages() {
  let images = new Array();

  for (let i = 0; i < 10; i++) images[i] = new Image();

  images[1].src = "images/outcomes/paper-paper.svg";
  images[2].src = "images/outcomes/paper-rock.svg";
  images[3].src = "images/outcomes/paper-scissors.svg";

  images[4].src = "images/outcomes/rock-paper.svg";
  images[5].src = "images/outcomes/rock-rock.svg";
  images[6].src = "images/outcomes/rock-scissors.svg";

  images[7].src = "images/outcomes/scissors-paper.svg";
  images[8].src = "images/outcomes/scissors-rock.svg";
  images[9].src = "images/outcomes/scissors-scissors.svg";

  images[0].src = "images/outcomes/none.svg";
}

preloadImages();

//////////////////////////////////////////////////////////////////////////
// Generic modal

function displayMessageViaModal(messageTitle, messageContent) {
  document.getElementsByClassName('modal-title')[0].innerHTML = messageTitle;
  document.getElementsByClassName('modal-body')[0].innerHTML = messageContent;
  document.getElementById('show-modal').click();
}

aboutButton.addEventListener('click', () => {
  displayMessageViaModal(
    "About",
    `
      <p> A website to play a game of rock paper scissors against a computer using the magic of computer vision </p>
      <a target="_blank" href="https://github.com/InputBlackBoxOutput/Rock-Paper-Scissors"> See repository on GitHub</a>
      <p> Created by InputBlackBoxOutput </p>
    `
  );
})

helpButton.addEventListener('click', () => {
  displayMessageViaModal(
    "How to play?",
    `
    <p> Press the start button and wait until the game setup is complete </p>
    <p> When the 3-second timer starts, make a choice and show your hand to your webcam before the timer runs out </p>
    <p> The computer will show its choice and then compare it with your choice to find the winner </p>
    <p> Press the stop button anytime to stop the game </p>
    `
  );
})


//////////////////////////////////////////////////////////////////////////
// Setup camera
const camera = new Camera(video, {
  onFrame: async () => {
    await hands.send({ image: video });
  },
  width: canvas.width,
  height: canvas.height,
});

//////////////////////////////////////////////////////////////////////////
// Setup game control buttons
let displayHandLandmarks = false;

function getCameraErrorModalContent(error) {
  if (error && error.name === "NotFoundError") {
    return {
      title: '<i class="bi bi-exclamation-triangle mr-2" aria-hidden="true"></i>Camera not found!',
      content: `
        No camera was found on this device
        <br/><br/>
        Please check if your camera is properly connected
      `,
    };
  }

  if (error && error.name === "NotAllowedError") {
    return {
      title: '<i class="bi bi-exclamation-triangle mr-2" aria-hidden="true"></i>Permission required!',
      content: `
      Camera access is required to play the game. Please reload the page and allow camera access when prompted. 
      <br/><br/>
      If you accidentally denied access, you can change this in your browser settings.
    `,
    };
  }

  return {
    title: '<i class="bi bi-exclamation-triangle mr-2" aria-hidden="true"></i>Camera unavailable!',
    content: ` 
    The camera could not be started.
    <br/><br/>
    Check that it is connected, available, and not being used by another application, then try again.
    `,
  };
}

function startCameraAccess() {
  const originalAlert = window.alert;

  window.alert = (message) => {
    if (typeof message === "string" && message.startsWith("Failed to acquire camera feed:")) {
      return;
    }

    originalAlert.call(window, message);
  };

  try {
    const accessPromise = camera.start();

    if (accessPromise && typeof accessPromise.finally === "function") {
      return accessPromise.finally(() => {
        window.alert = originalAlert;
      });
    }

    window.alert = originalAlert;
    return Promise.resolve(accessPromise);
  } catch (error) {
    window.alert = originalAlert;
    throw error;
  }
}

function start() {
  access = startCameraAccess();

  access
    .then((e) => {
      computerToken.src = "images/setup.svg";
      setTimeout(function () {
        game();
      }, 7000);
    })
    .catch((error) => {
      startButton.disabled = false;
      stopButton.disabled = true;

      const modalContent = getCameraErrorModalContent(error);
      displayMessageViaModal(modalContent.title, modalContent.content);
    });

  startButton.disabled = true;
  stopButton.disabled = false;

  handNotDetectedCount = 0;
}

startButton.addEventListener("click", () => {
  start();
});
stopButton.addEventListener("click", () => {
  location.reload();
});


//////////////////////////////////////////////////////////////////////////
// Setup hand pose estimation
let landmarks = undefined;

function onResultsHands(results) {
  canvasContext.save();
  canvasContext.clearRect(0, 0, canvas.width, canvas.height);
  canvasContext.drawImage(results.image, 0, 0, canvas.width, canvas.height);

  landmarks = undefined;
  if (results.multiHandLandmarks && results.multiHandedness) {
    for (let index = 0; index < results.multiHandLandmarks.length; index++) {
      landmarks = results.multiHandLandmarks[index];

      const classification = results.multiHandedness[index];
      const isRightHand = classification.label === "Right";

      drawConnectors(canvasContext, landmarks, HAND_CONNECTIONS, {
        color: isRightHand ? "#00FF00" : "#FF0000",
      }),
        drawLandmarks(canvasContext, landmarks, {
          color: isRightHand ? "#00FF00" : "#FF0000",
          fillColor: isRightHand ? "#FF0000" : "#00FF00",
          radius: (x) => {
            return lerp(x.from.z, -0.15, 0.1, 10, 1);
          },
        });
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
  hands.setOptions(options);
});

//////////////////////////////////////////////////////////////////////////
let handNotDetectedCount = 0;
const roundWaitDelay = 3000;
const timerDelay = 1000;

function game() {
  let count = 3;
  let timer = setInterval(function () {
    handleTimer();
  }, timerDelay);

  function handleTimer() {
    if (count === 0) {
      clearInterval(timer);

      // Show computer token // 1:'paper', 2:'rock', 3:'scissors'
      token = chance.integer({ min: 1, max: 3 });

      if (token == 1) computerToken.src = "images/paper.svg";
      else if (token == 2) computerToken.src = "images/rock.svg";
      else computerToken.src = "images/scissors.svg";

      // Get prediction
      if (landmarks != undefined) {
        handNotDetectedCount = 0;

        prediction = randomForestClassifier(landmarks);
        console.log(`Random forest classifier prediction: ${prediction}`);

        if (prediction === "P") {
          switch (token) {
            case 1:
              computerToken.src = "images/outcomes/paper-paper.svg";
              break;
            case 2:
              computerToken.src = "images/outcomes/rock-paper.svg";
              break;
            case 3:
              computerToken.src = "images/outcomes/scissors-paper.svg";
              break;
          }

          if (token == 2) scoreP += 1;
          if (token == 3) scoreC += 1;

          scorePlayer.innerText = scoreP;
          scoreComputer.innerText = scoreC;
        } else if (prediction === "R") {
          switch (token) {
            case 1:
              computerToken.src = "images/outcomes/paper-rock.svg";
              break;
            case 2:
              computerToken.src = "images/outcomes/rock-rock.svg";
              break;
            case 3:
              computerToken.src = "images/outcomes/scissors-rock.svg";
              break;
          }

          if (token == 3) scoreP += 1;
          if (token == 1) scoreC += 1;

          scorePlayer.innerText = scoreP;
          scoreComputer.innerText = scoreC;
        } else if (prediction == "S") {
          switch (token) {
            case 1:
              computerToken.src = "images/outcomes/paper-scissors.svg";
              break;
            case 2:
              computerToken.src = "images/outcomes/rock-scissors.svg";
              break;
            case 3:
              computerToken.src = "images/outcomes/scissors-scissors.svg";
              break;
          }

          if (token == 1) scoreP += 1;
          if (token == 2) scoreC += 1;

          scorePlayer.innerText = scoreP;
          scoreComputer.innerText = scoreC;
        }
      } else {
        clearInterval(timer);
        computerToken.src = "images/outcomes/none.svg";

        // Stop if hand is not detected for 3 tries
        handNotDetectedCount++;

        if (handNotDetectedCount === 3) {
          displayMessageViaModal(
            '<i class="bi bi-exclamation-triangle mr-2" aria-hidden="true"></i>Unable to detect your hand!',
            `
              We couldn't detect your hand because of the current camera, lighting, or background conditions.
              <br/><br/>
              Move to a well-lit area, keep your hand clearly visible, and try again.
            `,
          );
          computerToken.src = "images/blank.svg";
          startButton.disabled = false;
          stopButton.disabled = true;
        }
      }

      // Restart counter
      if (handNotDetectedCount !== 3) {
        setTimeout(function () {
          game();
        }, roundWaitDelay);
      }

    } else {
      computerToken.src = `images/${count}.svg`;
      count--;
    }
  }
}
//////////////////////////////////////////////////////////////////////////
