document.addEventListener('DOMContentLoaded', () => {
    const loadingGif = document.querySelector('.loading-gif');
    const popupMessage = document.querySelector('.popup-message');

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
            })
            .catch(error => {
                hideLoading();
                showMessage('An error occurred. Please try again.');
            });
        });
    }

    // Event listener for the Detect button
    const detectButton = document.querySelector('.options a[href="/detect"]');
    if (detectButton) {
        detectButton.addEventListener('click', (e) => {
            showLoading();
        });
    }
});
