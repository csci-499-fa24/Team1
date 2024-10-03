<?php
  $firstname=$_POST['firstname'];
  $email=$_POST['email'];
  $password=$_POST['password'];

  //Database connection

  $conn=new mysqli('localhost','root','','test');
  if($conn->connect_error){
    die('Connection failed: '.$conn->connect_error);
  }else{
    $smt=$conn->prepare("insert into registration (firstname,email,password)
    values(?,?,?)");

    $smt->bind_param("sss",$firstname,$email,$password);
    $smt->execute();
    echo "Registration successfully...";
    $smt->close();
    $conn->close();
  }