const video = document.querySelector("#webcam");
const startButton = document.querySelector("#start");
const stopButton = document.querySelector("#stop");
stopButton.disabled = true;

const canvas = document.querySelector('#canvas');
const canvasContext = canvas.getContext('2d');

let token = undefined;
const computerToken = document.querySelector("#computer-token")

let scoreC = 0;
const scoreComputer = document.querySelector("#score-computer");
let scoreP = 0;
const scorePlayer = document.querySelector("#score-player");


let width = 640;
let height = 480;

if(screen.width < 500 ||
 navigator.userAgent.match(/Android/i) ||
 navigator.userAgent.match(/webOS/i) ||
 navigator.userAgent.match(/iPhone/i) ||
 navigator.userAgent.match(/iPod/i)) {

  computerToken.hidden = true;
  video.hidden = true;
  startButton.disabled = true;
  stopButton.disabled = true;

  document.getElementById("mobile").hidden = false;

}


///////////////////////////////////////////////////////////////////////////
startButton.addEventListener("click", function() {
  navigator.getUserMedia({ 
            audio: false,  
            video: {
              mandatory: {
                maxWidth: width,
                maxHeight: height
              }
            }
          }, 
          successCallback, 
          errorCallback);
});

function successCallback(stream) {
  // Display the stream
  startButton.disabled = true;
  stopButton.disabled = false;

  video.srcObject = stream;

  // Stop video stream and timer 
  function stop() {
    var stream = video.srcObject;
    var tracks = stream.getTracks();

    for (var i = 0; i < tracks.length; i++) {
      var track = tracks[i];
      track.stop();
    }

    video.srcObject = null;
    startButton.disabled = false;
    stopButton.disabled = true;
  }
  stopButton.addEventListener("click", stop);

  game();
}

let errorCallback = function(e) {
  console.log("Something went wrong while acessing webcam")
};

///////////////////////////////////////////////////////////////////////////
function game() {
  let count = 3;
  let timer = setInterval(function() { handleTimer(count); }, 1000);

  function handleTimer() {
    if(video.srcObject == null) {
      clearInterval(timer);
      computerToken.src = "images/blank.png";
      return;
    }

    if(count === 0) {
      clearInterval(timer);

      // Show computer token // 1:'paper', 2:'rock', 3:'scissors'
      token = chance.integer({ min: 1, max: 3});

      if(token == 1)
        computerToken.src = "images/paper.png";
      else if(token == 2)
        computerToken.src = "images/rock.png";
      else
        computerToken.src = "images/scissors.png"
      
      // Get prediction
      canvasContext.drawImage(video, 0, 0, width, height);
      let pngUrl = canvas.toDataURL(); 

      const backendURL = "https://rps-vision.herokuapp.com/predict";
      // const backendURL = "http://127.0.0.1:5000/predict";

      axios.post(backendURL, {data: pngUrl})
            .then(response => {

              pred = response.data.predict;
              console.log(pred + "-" +token);

              if(pred == "['paper']") {
                switch(token) {
                  case 1: computerToken.src = "images/outcomes/paper-paper.png"; break;
                  case 2: computerToken.src = "images/outcomes/rock-paper.png"; break;
                  case 3: computerToken.src = "images/outcomes/scissors-paper.png"; break;
                }
                console.log("P");

                if(token == 2) scoreP += 1;
                if(token == 3) scoreC += 1;
                
                scorePlayer.innerText = scoreP;
                scoreComputer.innerText = scoreC;
              }

              else if(pred == "['rock']") {
                  switch(token) {
                  case 1: computerToken.src = "images/outcomes/paper-rock.png"; break;
                  case 2: computerToken.src = "images/outcomes/rock-rock.png"; break;
                  case 3: computerToken.src = "images/outcomes/scissors-rock.png"; break;
                }
                console.log("R");

                if(token == 3) scoreP += 1;
                if(token == 1) scoreC += 1;
                
                scorePlayer.innerText = scoreP;
                scoreComputer.innerText = scoreC;
              }
              else if(pred == "['scissors']" && token == 3) {
                switch(token) {
                  case 1: computerToken.src = "images/outcomes/paper-scissors.png"; break;
                  case 2: computerToken.src = "images/outcomes/rock-scissors.png"; break;
                  case 3: computerToken.src = "images/outcomes/scissors-scissors.png"; break;
                }
                console.log("S");

                if(token == 1) scoreP += 1;
                if(token == 2) scoreC += 1;
                
                scorePlayer.innerText = scoreP;
                scoreComputer.innerText = scoreC;
              }
              else {
                computerToken.src = "images/outcomes/none.png";
                console.log("N");
              }
              
            })
            .catch(error => {
                computerToken.src = "images/down.png";
                console.log(error);
            });

            // Restart game after 5 seconds
            setTimeout(function(){ game(); }, 5000);

    } else {
      computerToken.src = `images/${count}.png`;
      count--;
    }
  }
}
///////////////////////////////////////////////////////////////////////////