<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

$host = "localhost"; 
$user = "b31_41660135"; 
$pass = "Test@KBKh@Test@321"; 
$db   = "b31_41660135_wp31"; 

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Database connection failed"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if (!empty($data['email']) && !empty($data['password'])) {
    $email = $conn->real_escape_string($data['email']);
    $password = $conn->real_escape_string($data['password']);

    $result = $conn->query("SELECT * FROM users WHERE email='$email'");
    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        
        if ($password === $user['password']) {
            echo json_encode([
                "success" => true, 
                "user" => [
                    "id" => $user['id'],
                    "nameEn" => $user['name_en'],
                    "nameBn" => $user['name_bn'],
                    "email" => $user['email'],
                    "role" => $user['role'],
                    "team" => $user['team'],
                    "status" => $user['status'],
                    "mobile" => $user['mobile'],
                    "dob" => $user['dob'],
                    "presentAddress" => $user['present_address'],
                    "permanentAddress" => $user['permanent_address'],
                    "profilePic" => $user['profile_pic']
                ]
            ]);
            exit;
        }
    }
}

echo json_encode(["success" => false, "message" => "ভুল ইমেইল অথবা পাসওয়ার্ড!"]);
?>
