// contact.js
const contactForm = document.querySelector('#contact-form'); // Update selector to match your form ID

async function handleSubmit(event) {
    event.preventDefault();
    
    // Get form elements
    const name = document.querySelector('input[name="name"]').value;
    const email = document.querySelector('input[name="email"]').value;
    const subject = document.querySelector('input[name="subject"]').value;
    const message = document.querySelector('textarea[name="message"]').value;
    
    // Basic validation
    if (!name || !email || !subject || !message) {
        showMessage('Please fill in all fields', 'error');
        return;
    }

    if (!isValidEmail(email)) {
        showMessage('Please enter a valid email address', 'error');
        return;
    }

    // Show loading state
    const submitButton = contactForm.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = 'Sending...';

    try {
        // Replace these with your EmailJS credentials
        emailjs.init("YOUR_USER_ID");
        
        const templateParams = {
            from_name: name,
            from_email: email,
            subject: subject,
            message: message,
            to_email: 'contact@cloudstrucc.com'
        };

        await emailjs.send(
            'YOUR_SERVICE_ID',
            'YOUR_TEMPLATE_ID',
            templateParams
        );

        // Success
        showMessage('Message sent successfully!', 'success');
        contactForm.reset();

    } catch (error) {
        console.error('Error:', error);
        showMessage('Failed to send message. Please try again later.', 'error');
    } finally {
        // Reset button state
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
    }
}

function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `alert alert-${type === 'success' ? 'success' : 'danger'}`;
    messageDiv.role = 'alert';
    messageDiv.innerHTML = message;

    // Find existing message and remove it
    const existingMessage = document.querySelector('.alert');
    if (existingMessage) {
        existingMessage.remove();
    }

    // Insert new message before the form
    contactForm.parentNode.insertBefore(messageDiv, contactForm);

    // Remove message after 5 seconds
    setTimeout(() => messageDiv.remove(), 5000);
}

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Add form submit handler
contactForm.addEventListener('submit', handleSubmit);