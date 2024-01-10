document.getElementById('signupLink').addEventListener('click', function () {
    window.location.href = 'signup.html';
});

document.getElementById('logoutLink').addEventListener('click', function () {
    // Your logout logic goes here
    // For now, let's just remove the token from localStorage and reload the page
    localStorage.removeItem('userDataToken');
    window.location.href = 'index.html';
});

document.getElementById('contactForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        message: document.getElementById('message').value
    };

    fetch('https://task2-backend-contactform.onrender.com/contact', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
        .then(response => response.json())
        .then(data => {
            console.log('Contact form submitted successfully:', data);

            // Display a popup message
            alert('Contact form submitted successfully!');

            // Reset the form
            document.getElementById('contactForm').reset();
        })
        .catch(error => {
            console.error('Error submitting contact form:', error);
            // Handle error, e.g., show an error message
        });
});

// Function to check if the user is logged in and display user info
function checkLoggedInUser() {
    let token = localStorage.getItem("userDataToken"); // Retrieve the token from localStorage
    console.log("Get token:", token);
    if (token) {
        // Verify the token on the server
        fetch('https://task2-backend-contactform.onrender.com/verifyToken', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            })
            .then(response => response.json())
            .then(data => {
                console.log("data is:", data);
                if (data.status===201) {
                    // Token is valid, display user information
                    document.getElementById('loginLink').style.display = 'none';
                    document.getElementById('signupLink').style.display = 'none';
                    document.getElementById('logoutLink').style.display = 'inline';

                    // Fetch user data and display their name
                    const user = {
                        name: data.validUserOne.username
                    };
                    //window.location.href = 'index.html';
                    document.getElementById('loggedInUser').textContent = `Welcome, ${user.name}!`;
                    document.getElementById('loggedInUser').style.display = 'block';
                } 
                else {
                    //window.location.href = 'index.html';
                    console.log('Token verification failed:', data.message);
                }
                
            })
            .catch(error => {
                console.error('Error verifying token:', error);
            });
    }
    else{
        //window.location.href='signup.html'
    }
}

// Call the function to check if the user is logged in when the page loads
checkLoggedInUser();
