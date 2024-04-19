import cv2

class FaceDetector:
    def __init__(self, cascade_file):
        self.face_cascade = cv2.CascadeClassifier(cascade_file)

    def detect_faces(self, image_path):
        image = cv2.imread(image_path)

        if image is None:
            raise ValueError(f"Image not found at {image_path}")

        gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        faces = self.face_cascade.detectMultiScale(
            gray_image,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(30, 30),
            flags=cv2.CASCADE_SCALE_IMAGE
        )

        for (x, y, w, h) in faces:
            cv2.rectangle(image, (x, y), (x+w, y+h), (0, 255, 0), 2)

        return faces, image

# Example Usage:
if __name__ == "__main__":
    detector = FaceDetector("haarcascade_frontalface_default.xml")
    faces, image = detector.detect_faces("example.jpg")

    cv2.imshow("Detected Faces", image)
    cv2.waitKey(0)
    cv2.destroyAllWindows()
