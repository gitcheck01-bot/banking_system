<?php
session_start();
include("../php/account.php");

$servername = "localhost";
$username = "root";
$password = "";
$database = "test";

$conn = mysqli_connect($servername, $username, $password, $database);

if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}

// ✅ get logged-in email from session
$email = $_SESSION['email'] ?? $admin_email;

// ✅ get user info
$sql_user = "SELECT id, username, email, phone FROM users WHERE email='$email'";
$result_user = mysqli_query($conn, $sql_user);

if (!$result_user || mysqli_num_rows($result_user) === 0) {
    echo "<script>
   window.location.href='../pages/signup.html';
   </script>";
}

$row_user = mysqli_fetch_assoc($result_user);
$user_id = $row_user['id'];
$name = $row_user['username'];
$current_email = $row_user['email'];
$current_phone = $row_user['phone'];

// ✅ Check if 'amounts' table exists
$check_table = "SHOW TABLES LIKE 'amounts'";
$table_exists = mysqli_query($conn, $check_table);

if (mysqli_num_rows($table_exists) === 0) {
    // Create amounts table if not exists
    $create_amounts = "
        CREATE TABLE amounts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            total_balance DECIMAL(10,2) DEFAULT 0.00,
            income DECIMAL(10,2) DEFAULT 0.00,
            expenses DECIMAL(10,2) DEFAULT 0.00,
            savings DECIMAL(10,2) DEFAULT 0.00,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )";
    if (mysqli_query($conn, $create_amounts)) {
        echo "✅ Table 'amounts' created successfully.<br>";
    } else {
        die("❌ Error creating 'amounts': " . mysqli_error($conn));
    }
}

// ✅ Check if user already has a row in amounts table
$sql_amount = "SELECT * FROM amounts WHERE user_id='$user_id'";
$result_amount = mysqli_query($conn, $sql_amount);

if (mysqli_num_rows($result_amount) > 0) {
    // ✅ Existing data — fetch it
    $amount_data = mysqli_fetch_assoc($result_amount);
    $total_balance = $amount_data['total_balance'];
    $savings = $amount_data['savings'];
    $income = $amount_data['income'];
    $expenses = $amount_data['expenses'];
} else {
    // 🚀 Initialize new amount record
    $init_sql = "INSERT INTO amounts (user_id, total_balance, income, expenses, savings)
                 VALUES ('$user_id', 1000.00, 0.00, 0.00, 500.00)"; // Default starting amounts
    mysqli_query($conn, $init_sql);

    $total_balance = 1000.00;
    $income = 0.00;
    $expenses = 0.00;
    $savings = 500.00;
}

// Handle Profile Update
if (isset($_POST["update_profile"])) {
    $setting_name = mysqli_real_escape_string($conn, $_POST["setting_name"]);
    $setting_email = mysqli_real_escape_string($conn, $_POST["setting_email"]);
    $setting_phone = mysqli_real_escape_string($conn, $_POST["setting_phone"]);

    $sql_setting_update = "UPDATE users 
                           SET username='$setting_name', email='$setting_email', phone='$setting_phone' 
                           WHERE id='$user_id'";

    if (mysqli_query($conn, $sql_setting_update)) {
        // Update session and current variables
        $_SESSION['email'] = $setting_email;
        $email = $setting_email;
        $name = $setting_name;
        $current_phone = $setting_phone;

        echo "<script>
         window.location.href='dashboard.php';
         </script>";
    } else {
        echo "<script>alert('❌ Error updating profile: " . mysqli_error($conn) . "');</script>";
    }
}

// Handle Money Transfer
if (isset($_POST["transfer"])) {
    $transfer_email = mysqli_real_escape_string($conn, $_POST["transfer_email"]);
    $transfer_amount = floatval($_POST["transfer_amount"]);
    $transfer_description = mysqli_real_escape_string($conn, $_POST["transfer_description"]);
    $from_account = mysqli_real_escape_string($conn, $_POST["from_account"]);

    // Validate amount
    if ($transfer_amount <= 0) {
        echo "<script>alert('❌ Please enter a valid amount!');</script>";
    } else {
        // Get sender's current balances
        $sql_sender_amount = "SELECT total_balance, savings FROM amounts WHERE user_id='$user_id'";
        $result_sender_amount = mysqli_query($conn, $sql_sender_amount);
        $row_sender_amount = mysqli_fetch_assoc($result_sender_amount);

        $sender_balance = $row_sender_amount['total_balance'];
        $sender_savings = $row_sender_amount['savings'];

        // Check if recipient exists
        $sql_recipient = "SELECT id FROM users WHERE email='$transfer_email'";
        $result_recipient = mysqli_query($conn, $sql_recipient);

        if (mysqli_num_rows($result_recipient) > 0) {
            // Recipient exists - transfer between users
            $row_recipient = mysqli_fetch_assoc($result_recipient);
            $recipient_id = $row_recipient['id'];

            // Check sufficient balance based on selected account
            if ($from_account == 'Checking Account') {
                if ($sender_balance >= $transfer_amount) {
                    // Deduct from sender's checking account
                    $new_balance = $sender_balance - $transfer_amount;
                    $sql_sender_update = "UPDATE amounts 
                                           SET total_balance = $new_balance, 
                                               expenses = expenses + $transfer_amount 
                                           WHERE user_id='$user_id'";

                    // Add to recipient's checking account
                    $sql_recipient_update = "UPDATE amounts 
                                              SET total_balance = total_balance + $transfer_amount, 
                                                  income = income + $transfer_amount 
                                              WHERE user_id='$recipient_id'";

                    if (mysqli_query($conn, $sql_sender_update) && mysqli_query($conn, $sql_recipient_update)) {
                        echo "<script> window.location.href='dashboard.php';</script>";
                    } else {
                        echo "<script>alert('❌ Transfer failed!');</script>";
                    }
                } else {
                    echo "<script>alert('❌ Insufficient checking account balance!');</script>";
                }
            } elseif ($from_account == 'Savings Account') {
                if ($sender_savings >= $transfer_amount) {
                    // Deduct from sender's savings account
                    $new_savings = $sender_savings - $transfer_amount;
                    $sql_sender_update = "UPDATE amounts 
                                           SET savings = $new_savings, 
                                               expenses = expenses + $transfer_amount 
                                           WHERE user_id='$user_id'";

                    // Add to recipient's checking account
                    $sql_recipient_update = "UPDATE amounts 
                                              SET total_balance = total_balance + $transfer_amount, 
                                                  income = income + $transfer_amount 
                                              WHERE user_id='$recipient_id'";

                    if (mysqli_query($conn, $sql_sender_update) && mysqli_query($conn, $sql_recipient_update)) {
                        echo "<script>alert('✅ Transfer successful!'); window.location.href='dashboard.php';</script>";
                    } else {
                        echo "<script>alert('❌ Transfer failed!');</script>";
                    }
                } else {
                    echo "<script>alert('❌ Insufficient savings account balance!');</script>";
                }
            }
        } else {
            // Recipient doesn't exist - transfer to admin
            $admin_id = 1; // Assuming admin has ID 1

            // Check sufficient balance based on selected account
            if ($from_account == 'Checking Account') {
                if ($sender_balance >= $transfer_amount) {
                    // Deduct from sender's checking account
                    $new_balance = $sender_balance - $transfer_amount;
                    $sql_sender_update = "UPDATE amounts 
                                           SET total_balance = $new_balance, 
                                               expenses = expenses + $transfer_amount 
                                           WHERE user_id='$user_id'";

                    // Add to admin's account
                    $sql_admin_update = "UPDATE amounts 
                                          SET total_balance = total_balance + $transfer_amount, 
                                              income = income + $transfer_amount 
                                          WHERE user_id='$admin_id'";

                    if (mysqli_query($conn, $sql_sender_update) && mysqli_query($conn, $sql_admin_update)) {
                        echo "<script>alert('✅ Transfer to admin successful!'); window.location.href='dashboard.php';</script>";
                    } else {
                        echo "<script>alert('❌ Transfer failed!');</script>";
                    }
                } else {
                    echo "<script>alert('❌ Insufficient checking account balance!');</script>";
                }
            } elseif ($from_account == 'Savings Account') {
                if ($sender_savings >= $transfer_amount) {
                    // Deduct from sender's savings account
                    $new_savings = $sender_savings - $transfer_amount;
                    $sql_sender_update = "UPDATE amounts 
                                           SET savings = $new_savings, 
                                               expenses = expenses + $transfer_amount 
                                           WHERE user_id='$user_id'";

                    // Add to admin's account
                    $sql_admin_update = "UPDATE amounts 
                                          SET total_balance = total_balance + $transfer_amount, 
                                              income = income + $transfer_amount 
                                          WHERE user_id='$admin_id'";

                    if (mysqli_query($conn, $sql_sender_update) && mysqli_query($conn, $sql_admin_update)) {
                        echo "<script>alert('✅ Transfer to admin successful!'); window.location.href='dashboard.php';</script>";
                    } else {
                        echo "<script>alert('❌ Transfer failed!');</script>";
                    }
                } else {
                    echo "<script>alert('❌ Insufficient savings account balance!');</script>";
                }
            }
        }
    }
}

// Refresh data after updates
$sql_amount = "SELECT * FROM amounts WHERE user_id='$user_id'";
$result_amount = mysqli_query($conn, $sql_amount);
if (mysqli_num_rows($result_amount) > 0) {
    $amount_data = mysqli_fetch_assoc($result_amount);
    $total_balance = $amount_data['total_balance'];
    $savings = $amount_data['savings'];
    $income = $amount_data['income'];
    $expenses = $amount_data['expenses'];
}

mysqli_close($conn);
