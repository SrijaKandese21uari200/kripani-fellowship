document.getElementById('applicationForm').addEventListener('submit', async function (event) {
    event.preventDefault();  // Prevent default form submission

    const submitButton = event.target.querySelector('button');
    submitButton.disabled = true;  // Disable button to prevent multiple submissions
    submitButton.textContent = 'Submitting...';

    // Get form values
    const fullName = document.getElementById('full_name').value.trim();
    const email = document.getElementById('email').value.trim();
    const mobile = document.getElementById('mobile').value.trim();
    const degree = document.getElementById('degree').value.trim();
    const college = document.getElementById('college').value.trim();
    const videoAssessment = document.getElementById('video_assessment').value.trim();
    const resume = document.getElementById('resume').files[0];

    // Basic form validation
    if (!fullName || !email || !mobile || !degree || !college || !videoAssessment || !resume) {
        showMessage('Please fill in all fields and upload a resume.', 'error');
        submitButton.disabled = false;
        submitButton.textContent = 'Submit Application';
        return;
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showMessage('Please enter a valid email address.', 'error');
        submitButton.disabled = false;
        submitButton.textContent = 'Submit Application';
        return;
    }

    // Validate mobile number (basic check for digits only, min 10 digits)
    if (!/^\d{10,}$/.test(mobile)) {
        showMessage('Please enter a valid mobile number.', 'error');
        submitButton.disabled = false;
        submitButton.textContent = 'Submit Application';
        return;
    }

    // Prepare FormData
    const formData = new FormData();
    formData.append('full_name', fullName);
    formData.append('email', email);
    formData.append('mobile', mobile);
    formData.append('degree', degree);
    formData.append('college', college);
    formData.append('video_assessment', videoAssessment);
    formData.append('resume', resume);

    try {
        const response = await fetch('http://localhost:5000/apply', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error('Server Error!');

        const result = await response.json();
        showMessage(result.message, 'success');
    } catch (error) {
        showMessage('Error submitting application. Please try again.', 'error');
    }

    submitButton.disabled = false;
    submitButton.textContent = 'Submit Application';
});

// Function to show messages
function showMessage(message, type) {
    let messageBox = document.getElementById('messageBox');
    if (!messageBox) {
        messageBox = document.createElement('div');
        messageBox.id = 'messageBox';
        document.body.insertBefore(messageBox, document.body.firstChild);
    }
    messageBox.textContent = message;
    messageBox.style.padding = '10px';
    messageBox.style.margin = '10px auto';
    messageBox.style.maxWidth = '400px';
    messageBox.style.textAlign = 'center';
    messageBox.style.borderRadius = '5px';

    if (type === 'success') {
        messageBox.style.backgroundColor = '#4CAF50';
        messageBox.style.color = 'white';
    } else {
        messageBox.style.backgroundColor = '#ff5733';
        messageBox.style.color = 'white';
    }

    setTimeout(() => {
        messageBox.remove();
    }, 5000);
}
