#  Rock 👊 Paper ✋ Scissors ✌

Play the game at https://inputblackboxoutput.github.io/Rock-Paper-Scissors

## How it works?
When the page loads, a connection to the server running the computer vision model is established. The game requests access to your web camera when you press the play button and sends a snapshot to the server every time the 3 second timer runs out. At the server, the model will try its best to predict what token you showed and then send the outcome back to the webpage. The results are compared with the choice which the computer simultaneously made with you and the score board is updated accordingly

The server predicts the token selected by the user by using the following steps:
1. The image is passed to MediaPipe hands solution after the image is decoded from Base64 to obtain the hand landmarks
1. The hand landmarks are passed to a machine learning based classifier which predicts the token chosen by the user

![](docs/images/process.drawio.png)

## Building the classifier
### Dataset
1. Images were collected from the sources tabulated below

|Source #|Link|
|--|--|
|1|http://www.laurencemoroney.com/rock-paper-scissors-dataset/|
|2|https://www.kaggle.com/drgfreeman/rockpaperscissors|
|3|https://www.kaggle.com/alishmanandhar/rock-scissor-paper|
|4|https://www.kaggle.com/glushko/rock-paper-scissors-dataset|
|5|https://www.kaggle.com/anirudhabhagwat/rock-paper-scissors-images|

2. Images having more than 98% percent similarity were removed 
3. Hand landmarks were obtained using the MediaPipe's hands solution and then stored in seperate CSV files as per source

```text
> Class distribution
class
rock        3063
paper       2756
scissors    2683
```

### Model
A Random Forest Classifier model was trained on the collected landmarks to classify hand pose into either paper, rock or scissors. The evaluation metrics for the classifier are shown below. Other classification models performed with about 2 per cent less accuracy than Random Forest Classifier. 

```text
> Confusion Matrix
[[788  29  10]
 [ 23 895   4]
 [ 11  18 773]]
```
```text
> Classification Report
              precision    recall  f1-score   support

       paper       0.96      0.95      0.96       827
        rock       0.95      0.97      0.96       922
    scissors       0.98      0.96      0.97       802

    accuracy                           0.96      2551
   macro avg       0.96      0.96      0.96      2551
weighted avg       0.96      0.96      0.96      2551

```

### Made with lots of ⏱️, 📚 and ☕ by InputBlackBoxOutput
