const video = document.querySelector("#webcam");
const startButton = document.querySelector("#start");
const stopButton = document.querySelector("#stop");
startButton.disabled = true;
stopButton.disabled = true;

const canvas = document.querySelector("#canvas");
const canvasContext = canvas.getContext("2d");

let token = undefined;
const computerToken = document.querySelector("#computer-token");

const scoreBoard = document.getElementById("score-board");
let scoreC = 0;
const scoreComputer = document.querySelector("#score-computer");
let scoreP = 0;
const scorePlayer = document.querySelector("#score-player");

///////////////////////////////////////////////////////////////////////////
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

///////////////////////////////////////////////////////////////////////////
// Establish connection with the backend

const backendURL = "https://rps-vision.herokuapp.com";
// const backendURL = "http://127.0.0.1:5000";

function connectWithBackend() {
  computerToken.src = "images/connect.png";
  axios
    .get(backendURL)
    .then((response) => {
      computerToken.src = "images/blank.png";
      startButton.disabled = false;
    })
    .catch((error) => {
      computerToken.src = "images/down.png";
      console.log(error);
    });
}

connectWithBackend();

///////////////////////////////////////////////////////////////////////////
// Preload some of the images

function preload() {
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

preload();

///////////////////////////////////////////////////////////////////////////
startButton.addEventListener("click", function () {
  navigator.getUserMedia(
    {
      audio: false,
      video: {
        mandatory: {
          maxWidth: width,
          maxHeight: height,
        },
      },
    },
    successCallback,
    errorCallback
  );
});

function successCallback(stream) {
  // Display the stream
  startButton.disabled = true;
  stopButton.disabled = false;

  video.srcObject = stream;

  function stop() {
    // Stop video stream and timer
    var stream = video.srcObject;
    if (stream != null) {
      var tracks = stream.getTracks();

      for (var i = 0; i < tracks.length; i++) {
        var track = tracks[i];
        track.stop();
      }
    }

    video.srcObject = null;
    startButton.disabled = false;
    stopButton.disabled = true;

    // Reset score board
    scoreP = 0;
    scoreC = 0;
    scorePlayer.innerText = scoreP;
    scoreComputer.innerText = scoreC;
  }
  stopButton.addEventListener("click", stop);

  game();
}

let errorCallback = function (e) {
  console.log("Something went wrong while acessing webcam");
};

///////////////////////////////////////////////////////////////////////////
function game() {
  let count = 3;
  let timer = setInterval(function () {
    handleTimer(count);
  }, 1000);
  const roundWait = 5000;

  function handleTimer() {
    if (video.srcObject == null) {
      clearInterval(timer);
      computerToken.src = "images/blank.png";
      return;
    }

    if (count === 0) {
      clearInterval(timer);

      // Show computer token // 1:'paper', 2:'rock', 3:'scissors'
      token = chance.integer({ min: 1, max: 3 });

      if (token == 1) computerToken.src = "images/paper.png";
      else if (token == 2) computerToken.src = "images/rock.png";
      else computerToken.src = "images/scissors.png";

      // Get prediction
      canvasContext.drawImage(video, 0, 0, width, height);
      let pngUrl = canvas.toDataURL();

      axios
        .post(backendURL + "/predict", { data: pngUrl })
        .then((response) => {
          pred = response.data.predict;
          console.log(pred + "-" + token);

          if (pred == "['paper']") {
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
            setTimeout(function () {
              game();
            }, roundWait);
          } else if (pred == "['rock']") {
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
            setTimeout(function () {
              game();
            }, roundWait);
          } else if (pred == "['scissors']" && token == 3) {
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
            setTimeout(function () {
              game();
            }, roundWait);
          } else {
            computerToken.src = "images/outcomes/none.png";
            setTimeout(function () {
              game();
            }, roundWait);
          }
        })
        .catch((error) => {
          clearInterval(timer);
          computerToken.src = "images/down.png";
          console.log(error);
        });
    } else {
      computerToken.src = `images/${count}.png`;
      count--;
    }
  }
}
///////////////////////////////////////////////////////////////////////////
