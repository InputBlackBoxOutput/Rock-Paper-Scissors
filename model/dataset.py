import os, glob, csv
import PIL
import cv2
import mediapipe
import imagehash
import numpy as np

def get_hash(img_path):
  img = PIL.Image.open(img_path)

  hashes = [
      imagehash.average_hash,
      imagehash.phash,
      imagehash.dhash,
      imagehash.whash,
  ]

  combined_hash = np.array([h(img).hash for h in hashes]).flatten()
  combined_hash = np.where(combined_hash==True, 1, 0)

  return combined_hash

def compare_hash(hash1, hash2):
  assert len(hash1) == len(hash2)

  count = 0
  for i in range(len(hash1)):
    if hash1[i] == hash2[i]:
      count +=1

  return count/len(hash1)

def remove_similar_images(path, similarity_threshold=0.98):
  file_list = glob.glob(path)

  unique = []
  for file in file_list:
    filehash = get_hash(file)

    flag = False
    for each in unique:
      similarity = compare_hash(each, filehash)

      if similarity >= similarity_threshold:
        flag = True
        break

    if flag:
      print(f"Similar image: {file}")
      os.remove(file)
    else:
      unique.append(filehash)

def extract_landmarks():
    mp_drawing = mediapipe.solutions.drawing_utils
    mp_hands = mediapipe.solutions.hands

    for src in range(1, 6):
        for token in ["paper", "rock", "scissors"]:
            with mp_hands.Hands(min_detection_confidence=0.5, min_tracking_confidence=0.5, max_num_hands=1) as hands:
                with open(f'dataset/landmarks/{src}.csv', 'a', newline='') as csvfile:
                    writer = csv.writer(csvfile, delimiter=',')

                    for img_file in glob.glob(f"dataset/images/{src}/{token}/*"):
                        img = cv2.imread(img_file)
                        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

                        # img = cv2.flip(img, 1) # Flip on horizontal

                        img.flags.writeable = False
                        results = hands.process(img)

                        if results.multi_hand_landmarks != None:
                            landmarks = []
                            for l in results.multi_hand_landmarks:
                                for data_point in l.landmark:
                                    landmarks.append(data_point.x)
                                    landmarks.append(data_point.y)
                                    landmarks.append(data_point.z)
                                    
                            writer.writerow([token] + [src] + landmarks)
                        else:
                            print(f"Could not detect palm in image: {img_file}")

if __name__ == "__main__":
    # Remove similar images
    for i in range(1, 6):
        for token in ["paper", "rock", "scissors"]:
            path = f"dataset/images/{i}/{token}/*"
            remove_similar_images(path, similarity_threshold=0.98)

    # Extract hand pose estimation landmarks
    extract_landmarks()