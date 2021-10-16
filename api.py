import base64
from io import BytesIO

import cv2
import numpy as np
from PIL import Image

from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin

import model

api = Flask(__name__)
cors = CORS(api)

@api.route('/predict',methods=['POST'])
@cross_origin()
def predict():
	image_data = str(request.data).split(",")[-1]
	img = Image.open(BytesIO(base64.b64decode(image_data)))
	img = np.array(img)[:,:,:3]

	pred_classes = {"none": 0, "paper": 1, "rock": 2, "scissors":3}
	pred = model.rps_predict(img, show=False)
	
	return jsonify({"predict": str(pred).lower()})	

@api.route('/',methods=['GET'])
@cross_origin()
def root():
	return jsonify({"success": 1})	

if __name__ == '__main__':
    api.run(port=5000, debug=True)