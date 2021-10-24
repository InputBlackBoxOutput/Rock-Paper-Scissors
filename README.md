#  Rock 👊 Paper ✋ Scissors ✌

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
3. Hand pose detection was performed on all the images and the landmarks were stored in CSV files

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
