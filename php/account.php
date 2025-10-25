<?php

session_start();

$admin_email = "void@gmail.com";


$servername = "localhost";
$username = "root";
$xampp_password = "";
$database = "test";

$conn = mysqli_connect($servername, $username, $xampp_password, $database);

if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    /* ----------- SIGNUP FORM ----------- */
    if (isset($_POST["signup"])) {
        $name = $_POST["name"];
        $sign_email = $_POST["sign-email"];
        $number = $_POST["number"];
        $login_password = $_POST["login_password"];
        $confirm_password = $_POST["con-pass"];

        if ($login_password == $confirm_password) {
            // check if email already exists
            $check_sql = "SELECT * FROM users WHERE email='$sign_email'";
            $check_result = mysqli_query($conn, $check_sql);

            if (mysqli_num_rows($check_result) > 0) {
                echo "<script>alert('⚠️ Email already registered!');</script>";
            } else {
                // insert user
                $sql = "INSERT INTO users (username, phone, email, password) 
                        VALUES ('$name', '$number', '$sign_email', '$login_password')";

                if (mysqli_query($conn, $sql)) {
                    echo "<script>
                            window.location.href = '../pages/login.html';
                          </script>";
                } else {
                    echo "<script>alert('❌ Error: " . mysqli_error($conn) . "');</script>";
                }
            }
        } else {
            echo "<script>alert('⚠️ Passwords do not match!');</script>";
        }
    }

    /* ----------- LOGIN FORM ----------- */
    if (isset($_POST["login"])) {
        $email = $_POST["email"];
        $password = $_POST["password"];

        $sql = "SELECT * FROM users WHERE email='$email' AND password='$password'";
        $result = mysqli_query($conn, $sql);

        if (mysqli_num_rows($result) > 0) {
            $_SESSION['email'] = $email;
            echo "<script>
                 window.location.href = 'dashboard.php';
                  </script>";
        } 
    }
}

mysqli_close($conn);

?>


