import pickle
import glob
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix

def train_model():
  l = []
  for each in glob.glob("dataset/landmarks/*.csv"):
    df = pd.read_csv(each, names = ["token", "src"] + [i for i in range(63)])
    l.append(df)

  landmarks = pd.concat(l, axis=0, ignore_index=True)
  print("> Class distribution")
  print(landmarks.value_counts('token'))

  X = landmarks.drop(["token", "src"], axis=1)
  y = landmarks['token']
  X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.30, random_state=101)

  rfc = RandomForestClassifier(n_estimators=50)
  rfc.fit(X_train,y_train)

  predictions = rfc.predict(X_test)
  print("\n> Classification Report")
  print(classification_report(y_test,predictions))

  print("> Confusion Matrix")
  print(confusion_matrix(y_test,predictions))

  pickle.dump(rfc, open("model.pkl", 'wb'))

if __name__ == "__main__":
  train_model()