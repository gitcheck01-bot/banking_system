  const togglePassword = document.querySelector('.toggle-password');
        const passwordInput = document.getElementById('password');

        togglePassword.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);

            const icon = togglePassword.querySelector('i');
            icon.classList.toggle('fa-eye');
            icon.classList.toggle('fa-eye-slash');
        });

        // const loginForm = document.getElementById('login-form');
        // loginForm.addEventListener('submit', (e) => {
        //     e.preventDefault();
        //     const email = document.getElementById('email').value;
        //     const password = document.getElementById('password').value;

        //     if (email && password) {
        //         alert('Login functionality will be connected to backend');
        //     }
        // });