<?php
session_start();
include("../php/account.php"); // optional if you have shared variables like $admin_email

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
$sql_user = "SELECT id, username FROM users WHERE email='$email'";
$result_user = mysqli_query($conn, $sql_user);

if (!$result_user || mysqli_num_rows($result_user) === 0) {
    die("❌ User not found.");
}

$row_user = mysqli_fetch_assoc(result: $result_user);
$user_id = $row_user['id'];
$name = $row_user['username'];

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
                 VALUES ('$user_id', 0.00, 0.00, 0.00, 0.00)";
    mysqli_query($conn, $init_sql);

    $total_balance = $income = $expenses = $savings = 0.00;
}


# for account 
 if (isset($_POST["setting_form"])) {
    $setting_name = $_POST["setting_name"];
    $setting_email = $_POST["setting_email"];
    $setting_phone = $_POST["setting_phone"];
    
    $sql_setting_update = "UPDATE users 
                           SET username='$setting_name', email='$setting_email', phone='$setting_phone' 
                           WHERE id='$user_id'";

 }

 if(isset($_POST["transfer"])) {
    $transfer_email = $_POST["transfer_email"];
    $transfer_amount = $_POST["transfer_amount"];
    $transfer_description = $_POST["transfer_description"];

    // Check if recipient exists
    $sql_recipient = "SELECT id FROM users WHERE email='$transfer_email'";
    $result_recipient = mysqli_query($conn, $sql_recipient);

   if (mysqli_num_rows($result_recipient) > 0) {
    $row_recipient = mysqli_fetch_assoc($result_recipient);
    $recipient_id = $row_recipient['id'];

    $sql_sender_amount = "SELECT total_balance , savings FROM amounts WHERE user_id='$recipient_id'";
    $result_sender_amount = mysqli_query($conn, $sql_sender_amount);
    $row_sender_amount = mysqli_fetch_assoc($result_sender_amount);

    $sender_balance = $row_sender_amount['total_balance'];
    $total_balance = $sender_balance;
    $sender_savings = $row_sender_amount['savings'];
    $savings = $sender_savings;

    if($sender_balance >= $transfer_amount) {
        if($_POST['from_account'] == 'Checking Account') {
            // Deduct from total_balance
            $new_balance = $sender_balance - $transfer_amount;
            $sql_sender_update = "UPDATE amounts 
                                   SET total_balance = $new_balance, 
                                       expenses = expenses + $transfer_amount 
                                   WHERE user_id='$user_id'";
                                   mysqli_query($conn, $sql_sender_update);
        } elseif($_POST['from_account'] == 'Savings Account') {
            // Deduct from savings
            if($sender_savings >= $transfer_amount) {
                $new_savings = $sender_savings - $transfer_amount;
                $sql_sender_update = "UPDATE amounts 
                                       SET savings = $new_savings, 
                                           expenses = expenses + $transfer_amount 
                                       WHERE user_id='$user_id'";
                                        mysqli_query($conn, $sql_sender_update);
            } else {
                echo "<script>alert('❌ Insufficient savings balance!');</script>";
                exit;
            }
        }
       
   }
   else {
    $recipient_id = 1;
    $sql_admin_update = "UPDATE amounts 
                           SET total_balance = total_balance + $transfer_amount, 
                               income = income + $transfer_amount 
                           WHERE user_id='$recipient_id'";
   }


 }

mysqli_close($conn);
?>
