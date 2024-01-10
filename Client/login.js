document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const formData = {
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
    };

    fetch('https://task2-backend-contactform.onrender.com/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        //console.log(response)
        if(data.status===201){
            console.log('Login successful:', data.response.token);
            // Redirect to the homepage or perform other actions
            localStorage.setItem("userDataToken",data.response.token);
            //console.log(response);
            window.location.href = 'index.html';
            document.getElementById('logoutLink').style.display='inline-block';
        }
        else{
            window.location.href = 'signup.html';
        }
        
    })
    .catch(error => {
        console.error('Error logging in:', error);
        // Handle error, e.g., display an error message
    });
});
