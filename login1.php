<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <link rel="preconnect" href="https://fonts.gstatic.com" />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap"
      rel="stylesheet"
    />

    <link rel="stylesheet" href="style.css" />
    <title>Login page</title>
</head>
<body>
    <h1>Enter your username and password</h1>
    <section class="wrapper-main">
        <form action="login.php" method="get">
          
          <label for="username">Username</label>
          <br>
          <input type="text" id="username" name="username" placeholder="Username">
          <br><br>
          <label for="password">Password</label>
          <br>
          <input type="password" id="password" name="password" placeholder="Password">
          <br><br>
          <button type="submit" value="submit" href="private.php">Submit</button>
          <br><br><br><br>


        </form>
    </section>  

    <a class="btn btn--big" href="index.php">Home</a>
    <br><br>
</body>
</html>