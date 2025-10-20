 const toggleButtons = document.querySelectorAll('.toggle-password');

        toggleButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetId = button.getAttribute('data-target');
                const passwordInput = document.getElementById(targetId);

                const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordInput.setAttribute('type', type);

                const icon = button.querySelector('i');
                icon.classList.toggle('fa-eye');
                icon.classList.toggle('fa-eye-slash');
            });
        });

        // const signupForm = document.getElementById('signup-form');
        // signupForm.addEventListener('submit', (e) => {
        //     e.preventDefault();

        //     const fullname = document.getElementById('fullname').value;
        //     const email = document.getElementById('email').value;
        //     const phone = document.getElementById('phone').value;
        //     const password = document.getElementById('password').value;
        //     const confirmPassword = document.getElementById('confirm-password').value;
        //     const terms = document.getElementById('terms').checked;

        //     if (password !== confirmPassword) {
        //         alert('Passwords do not match!');
        //         return;
        //     }

        //     if (!terms) {
        //         alert('Please agree to the Terms & Conditions');
        //         return;
        //     }

        // });