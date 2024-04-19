from flask import Flask, request, jsonify, render_template, redirect, url_for
from face_detect import FaceDetector
import os
import cv2
import json

app = Flask(__name__)

UPLOAD_FOLDER = 'uploads'
DATA_FOLDER = 'data'
STATIC_FOLDER = 'static'

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

if not os.path.exists(DATA_FOLDER):
    os.makedirs(DATA_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['DATA_FOLDER'] = DATA_FOLDER
app.config['STATIC_FOLDER'] = STATIC_FOLDER

face_detector = FaceDetector("haarcascade_frontalface_default.xml")

def save_image_and_data(image_file, name, details):
    filename = os.path.join(app.config['UPLOAD_FOLDER'], image_file.filename)
    image_file.save(filename)

    with open(os.path.join(app.config['DATA_FOLDER'], f"{name}.txt"), "w") as f:
        f.write(details)

    return filename

def load_data():
    data = {}
    for file_name in os.listdir(app.config['DATA_FOLDER']):
        if file_name.endswith(".txt"):
            name = file_name.split(".")[0]
            with open(os.path.join(app.config['DATA_FOLDER'], file_name), "r") as f:
                data[name] = f.read().strip()
    return data

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/add', methods=['GET', 'POST'])
def add_person():
    if request.method == 'POST':
        name = request.form['name']
        details = request.form['details']
        image_file = request.files['image']

        filename = save_image_and_data(image_file, name, details)

        return jsonify({"message": "Person added successfully", "filename": filename}), 200
    return render_template('add.html')

@app.route('/detect', methods=['GET', 'POST'])
def detect_faces():
    if request.method == 'POST':
        if 'image' not in request.files:
            return jsonify({"error": "No image uploaded"}), 400

        image_file = request.files['image']
        if image_file.filename == '':
            return jsonify({"error": "No selected image"}), 400

        filename = os.path.join(app.config['UPLOAD_FOLDER'], image_file.filename)
        image_file.save(filename)

        faces, image = face_detector.detect_faces(filename)
        data = load_data()

        detected_faces = []

        for (x, y, w, h) in faces:
            face_image = image[y:y+h, x:x+w]
            face_gray = cv2.cvtColor(face_image, cv2.COLOR_BGR2GRAY)

            detected_faces.append({
                "x": int(x),
                "y": int(y),
                "width": int(w),
                "height": int(h)
            })

        detected_persons = []

        for name, details in data.items():
            for face in detected_faces:
                if (face['x'] >= x and face['y'] >= y and
                    face['x'] + face['width'] <= x + w and
                    face['y'] + face['height'] <= y + h):

                    detected_persons.append({
                        "name": name,
                        "details": details
                    })

        return jsonify({"faces": detected_faces, "detected_persons": detected_persons}), 200

    return render_template('detect.html')

if __name__ == '__main__':
    app.run(debug=True)
