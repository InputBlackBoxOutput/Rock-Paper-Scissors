import pickle
import sklearn

import cv2
import numpy as np
import mediapipe as mp

import matplotlib.pyplot as plt

with open("./model.pkl", "rb") as model_file:
	model = pickle.load(model_file)

mp_drawing = mp.solutions.drawing_utils
mp_hands = mp.solutions.hands

def rps_predict(image, show=False):
  with mp_hands.Hands(min_detection_confidence=0.5, min_tracking_confidence=0.5, max_num_hands=1) as hands:
      results = hands.process(image)
      
      pred = None
      if results.multi_hand_landmarks != None:
        landmarks = []
        for l in results.multi_hand_landmarks:
          for data_point in l.landmark:
            landmarks.append(data_point.x)
            landmarks.append(data_point.y)
            landmarks.append(data_point.z)
      
        pred = model.predict(np.array(landmarks).reshape(1, -1))

      if show and results.multi_hand_landmarks:
        for num, hand in enumerate(results.multi_hand_landmarks):
            mp_drawing.draw_landmarks(image, hand, mp_hands.HAND_CONNECTIONS, 
                                    mp_drawing.DrawingSpec(color=(121, 22, 76), thickness=2, circle_radius=4),
                                    mp_drawing.DrawingSpec(color=(250, 44, 250), thickness=2, circle_radius=2),
                                      )
  if show:
    return (pred, image)
  else:
    return pred
  

def test_webcam():
  vid = cv2.VideoCapture(0)    
  while(True):
    ret, frame = vid.read()
    frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    (pred, frame) = rps_predict(frame, show=True)

    print(pred)

    frame = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)
    cv2.imshow('frame', frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
      break
      
  vid.release()
  cv2.destroyAllWindows()

def test_images():
  import glob
  for img_path in glob.glob("./test-images/*.jpg"):
    print(img_path)
    img = cv2.imread(img_path)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB) 

    (pred, img) = rps_predict(img, show=True)

    plt.imshow(img)
    plt.title(pred)
    plt.show() 

if __name__ == '__main__':
  test_images()
  # test_webcam()
      