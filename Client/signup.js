document.getElementById('signupForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const formData = {
        username: document.getElementById('username').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
    };

    fetch('https://task2-backend-contactform.onrender.com/auth/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Signup successful:', data);
        // Redirect to the homepage or perform other actions
        window.location.href = 'login.html';
    })
    .catch(error => {
        console.error('Error signing up:', error);
        // Handle error, e.g., display an error message
    });
});
