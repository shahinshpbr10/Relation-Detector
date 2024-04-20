document.addEventListener('DOMContentLoaded', () => {
    const loadingGif = document.querySelector('.loading-gif');
    const popupMessage = document.querySelector('.popup-message');
    const webcamCaptureButton = document.getElementById('webcamCaptureButton');
    const fileInput = document.getElementById('image');
    const addMessage = document.getElementById('add-message');
    const detectMessage = document.getElementById('detect-message');

    // Function to show loading GIF
    const showLoading = () => {
        loadingGif.style.display = 'block';
    };

    // Function to hide loading GIF
    const hideLoading = () => {
        loadingGif.style.display = 'none';
    };

    // Function to show pop-up message
    const showMessage = (message) => {
        popupMessage.textContent = message;
        popupMessage.style.display = 'block';
        
        // Hide message after 3 seconds
        setTimeout(() => {
            popupMessage.style.display = 'none';
        }, 3000);
    };

    // Event listener for the Add New Person form submission
    const addForm = document.getElementById('add-form');
    if (addForm) {
        addForm.addEventListener('submit', (e) => {
            e.preventDefault();

            showLoading();

            const formData = new FormData(addForm);

            fetch('/add', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                hideLoading();
                showMessage(data.message);

                // Clear the form
                addForm.reset();
            })
            .catch(error => {
                hideLoading();
                showMessage('An error occurred. Please try again.');
            });
        });
    }

    // Event listener for the Detect button
    const detectForm = document.getElementById('detect-form');
    if (detectForm) {
        detectForm.addEventListener('submit', (e) => {
            e.preventDefault();

            showLoading();

            const formData = new FormData(detectForm);

            fetch('/detect', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                hideLoading();
                
                // Display detection results
                const detectedPersons = data.detected_persons.map(person => `
                    <div>
                        <strong>Name:</strong> ${person.name}<br>
                        <strong>Details:</strong> ${person.details}
                    </div>
                `).join('');

                const faces = data.faces.map(face => `
                    <div>
                        <strong>Face Dimensions:</strong><br>
                        <strong>Height:</strong> ${face.height}<br>
                        <strong>Width:</strong> ${face.width}<br>
                        <strong>X:</strong> ${face.x}<br>
                        <strong>Y:</strong> ${face.y}
                    </div>
                `).join('');

                detectMessage.innerHTML = `
                    <h2>Detection Results</h2>
                    <div class="detected-persons">
                        ${detectedPersons}
                    </div>
                    <div class="detected-faces">
                        ${faces}
                    </div>
                `;
            })
            .catch(error => {
                hideLoading();
                showMessage('An error occurred. Please try again.');
            });
        });
    }

    // Event listener for the Webcam Capture button
    if (webcamCaptureButton) {
        webcamCaptureButton.addEventListener('click', () => {
            // Access the user's camera
            navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                const video = document.createElement('video');
                video.srcObject = stream;
                video.play();

                // Append video to the container
                const container = document.querySelector('.container');
                container.appendChild(video);

                // Capture button
                const captureButton = document.createElement('button');
                captureButton.textContent = 'Capture';
                container.appendChild(captureButton);

                // Capture a frame from the video stream
                captureButton.addEventListener('click', () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    
                    const context = canvas.getContext('2d');
                    context.drawImage(video, 0, 0, canvas.width, canvas.height);

                    // Convert the canvas to a data URL
                    const imageDataURL = canvas.toDataURL('image/png');

                    // Create an image element and display the captured image
                    const capturedImage = new Image();
                    capturedImage.src = imageDataURL;
                    capturedImage.style.width = '250px';
                    capturedImage.style.height = '250px';
                    container.appendChild(capturedImage);

                    // Stop the camera stream
                    stream.getTracks().forEach(track => track.stop());

                    // Remove video and capture button
                    video.remove();
                    captureButton.remove();
                });
            })
            .catch(error => {
                console.error('Error accessing the camera:', error);
                alert('Error accessing the camera. Please try again.');
            });
        });
    }

    // Event listener for the file input change
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            // Handle file upload here
            const file = e.target.files[0];
            if (file) {
                const imageUrl = URL.createObjectURL(file);
                const capturedImage = document.createElement('img');
                capturedImage.src = imageUrl;
                capturedImage.style.width = '250px';
                capturedImage.style.height = '250px';
                addMessage.appendChild(capturedImage);
            }
        });
    }
});
