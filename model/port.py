import pickle
import sklearn
import numpy as np

with open("./model.pkl", "rb") as model_file:
	model = pickle.load(model_file)

def port():
  feature_names = [str(i) for i in range(64)]
  
  for i, tree in enumerate(model.estimators_):
    print(f"function decisionTree{i}(x) " + '{')  
    left      = tree.tree_.children_left
    right     = tree.tree_.children_right
    threshold = tree.tree_.threshold
    features  = [feature_names[i] for i in tree.tree_.feature]
    value = tree.tree_.value

    def recurse(left, right, threshold, features, node):
      if (threshold[node] != -2):
        print("if ( x[" + features[node] + "] <= " + str(threshold[node]) + " ) {", end="")
        if left[node] != -1:
          recurse (left, right, threshold, features,left[node])
        print("} else {", end="")
        if right[node] != -1:
          recurse (left, right, threshold, features,right[node])
        print("}", end="")
      else:
          print("return " + str(np.argmax(value[node][0])) + ";", end="")

    recurse(left, right, threshold, features, 0)
    print()
    print("}")  

if __name__ == '__main__':
  port()