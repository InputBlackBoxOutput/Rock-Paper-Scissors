# Rock 👊 Paper ✋ Scissors ✌

Play the game at https://rock-paper-scissor-cv.netlify.app/

## How it works?

Once the page is loaded, the game requests access to your web camera when you press the play button and begins taking snapshots. The snapshots are passed to the Mediapipe Hands Solution to obtain hand landmarks. When the 3-second timer runs out, a Random Forest Classifier will use the obtained hand landmarks and try its best to predict your token. The predicted token is compared with the choice simultaneously made by the computer, and the scoreboard is updated accordingly

![](www/images/process.drawio.png)

## Building the classifier

### Dataset

1. Images were collected from the sources tabulated below

| Source # | Link                                                              |
| -------- | ----------------------------------------------------------------- |
| 1        | http://www.laurencemoroney.com/rock-paper-scissors-dataset/       |
| 2        | https://www.kaggle.com/drgfreeman/rockpaperscissors               |
| 3        | https://www.kaggle.com/alishmanandhar/rock-scissor-paper          |
| 4        | https://www.kaggle.com/glushko/rock-paper-scissors-dataset        |
| 5        | https://www.kaggle.com/anirudhabhagwat/rock-paper-scissors-images |

2. Images having more than 98% percent similarity were removed
3. Hand landmarks were obtained using the MediaPipe's hands solution and then stored in seperate CSV files as per source

```text
> Class distribution
rock        3611
scissors    3250
paper       3102
```

### Model

A Random Forest Classifier model was trained on the collected landmarks to classify hand pose into either paper, rock or scissors. The evaluation metrics for the classifier are shown below. Other classification models performed with about 2 per cent less accuracy than Random Forest Classifier.

```text
> Confusion Matrix
[[ 918   17   19]
 [  10 1069    6]
 [  21   21  908]]
```

```text
> Classification Report
              precision    recall  f1-score   support

       paper       0.97      0.96      0.96       954
        rock       0.97      0.99      0.98      1085
    scissors       0.97      0.96      0.96       950

    accuracy                           0.97      2989
   macro avg       0.97      0.97      0.97      2989
weighted avg       0.97      0.97      0.97      2989

```

### Made with lots of ⏱️, 📚 and ☕ by InputBlackBoxOutput
