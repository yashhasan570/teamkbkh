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

$result = $conn->query("SELECT * FROM users");
$users = [];
while ($row = $result->fetch_assoc()) {
    $users[] = [
        "id" => $row['id'],
        "uniqueCode" => $row['unique_code'],
        "nameEn" => $row['name_en'],
        "nameBn" => $row['name_bn'],
        "email" => $row['email'],
        "role" => $row['role'],
        "team" => $row['team'],
        "status" => $row['status'],
        "mobile" => $row['mobile'],
        "dob" => $row['dob'],
        "presentAddress" => $row['present_address'],
        "permanentAddress" => $row['permanent_address'],
        "profilePic" => $row['profile_pic']
    ];
}
echo json_encode(["success" => true, "users" => $users]);
?>
