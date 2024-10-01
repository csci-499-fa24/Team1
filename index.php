<?php
require_once('config/db.php');
$query = "select dba,cuisine_description,street,zipcode,phone,grade_date,grade from nyc_restaurants where cuisine_description='$_GET[cartype]' and zipcode='$_GET[firstname]' and grade_date!='';";
$result = mysqli_query($con,$query);

?>



<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <link rel="preconnect" href="https://fonts.gstatic.com" />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap"
      rel="stylesheet"
    />

    <link rel="stylesheet" href="style.css" />
    <title>Take me to a good place</title>
  </head>

  


  <div style="display:flex; justify-content:center; align-items:center;
  width:150px;height:150px;position:absolute; left:50%; top:0; margin-left:-75px; ">
    <img src="LOGO2.jfif" />
  </div>
  <br><br><br><br><br><br>



  <body>
    <div class="container">
      <header>
        <div class="header-text-box">
          <h1>Let me show you the nearby places to eat or drink and their certification.</h1>
          <p class="header-text">
            In New York Certification helps prevent foodborne illnesses that can affect customers and protect the business from negative consequences.
          </p>
          <a class="btn btn--big" href="login/login.php">Login</a>
        </div>
        <img src="hero5.webp" alt="Photo" />
      </header>

      <section>
        <h2>What makes our info valuable?</h2>
        <div class="grid-3-cols">
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="features-icon"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
              />
            </svg>
            <p class="features-title"><strong>Visit a clean place</strong></p>
            <p class="features-text">
              Cleanliness is a key part of the dining experience and can impact customer satisfaction and loyalty.
              
            </p>
          </div>

          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="features-icon"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p class="features-title">
              <strong>Leave a good impression</strong>
            </p>
            <p class="features-text">
              Leaving a good impression is important because it can have a lasting impact on how others perceive you.
              
            </p>
          </div>

          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="features-icon"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <p class="features-title">
              <strong>Eat well, be happy.</strong>
            </p>
            <p class="features-text">
              Nutrition directly affects our mental and emotional well-being, so...
              
            </p>
          </div>
        </div>
      </section>

      <section class="testimonial-section">
        <div class="grid-3-cols">
          <img src="customers3.jfif" alt="People sitting on chairs" />
          <div class="testimonial-box">
            <h2>"We couldn't eat well outside without those places"</h2>
            <blockquote class="testimonial-text">
              The most common reason why people love to go to restaurants even though it involves spending money is food. It could be the greatest motivator. People love having the delectable dishes conjured up by highly talented and creative chefs.
              
            </blockquote>
            <p class="testimonial-author">&mdash; The team with no name</p>
          </div>
        </div>
      </section>

      <section>
        <h2>Our recommendations of the week</h2>


        <!--
        <div class="grid-3-cols">
          <figure class="chair">
            <img src="pollomario.jfif" alt="Chair" />
            <div class="chair-box">
              <h3>Meat-Seafood</h3>
              <ul class="chair-details">
                <li>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="chair-icon"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                    />
                  </svg>
                  
                  <span>Pollos Mario</span>
                </li>
                <li>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="chair-icon"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Open 10:00- 22:00 hr</span>
                </li>
                <li>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="chair-icon"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Bandeja paisa</span>
                </li>
                <li>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="chair-icon"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                  <span>Delivery</span>
                </li>
              </ul>
              <div class="chair-price">
                <strong>$30</strong>
                <a href="#" class="btn btn--small">Button2</a>
              </div>
            </div>
          </figure>

          <figure class="chair">
            <img src="daiquiri.jfif" alt="Chair" />
            <div class="chair-box">
              <h3>Drink</h3>
              <ul class="chair-details">
                <li>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="chair-icon"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                    />
                  </svg>
                  <span>The Rum House</span>
                </li>
                <li>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="chair-icon"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Open 16:00 - 2:00 hr</span>
                </li>
                <li>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="chair-icon"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Dark daiquiri</span>
                </li>
                <li>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="chair-icon"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                  <span>No delivery</span>
                </li>
              </ul>
              <div class="chair-price">
                <strong>$25</strong>
                <a href="#" class="btn btn--small">Button3</a>
              </div>
            </div>
          </figure>

          <figure class="chair">
            <img src="bangbang.jfif" alt="Chair" />
            <div class="chair-box">
              <h3>Vegetarian</h3>
              <ul class="chair-details">
                <li>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="chair-icon"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                    />
                  </svg>
                  <span>Planta Queen</span>
                </li>
                <li>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="chair-icon"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Open 11:00 - 22:00 hr</span>
                </li>
                <li>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="chair-icon"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Bang Bang Broccoli</span>
                </li>
                <li>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="chair-icon"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                  <span>Delivery</span>
                </li>
              </ul>
              <div class="chair-price">
                <strong>$40</strong>
                <a href="#" class="btn btn--small">Button4</a>
              </div>
            </div>
          </figure>
        </div>
-->


      </section>
      
      
      <center>
      <a target="_blank" href="https://sargesdeli.com">
        <video width="750px;" controls mute loop>
          <source src="Top5.mp4" type="video/mp4">
        </video>
      </a>
      </center>
      <br><br>


      <p style="text-align:center;">
      <iframe src="https://www.google.com/maps/d/embed?mid=1jqb3EQH5UwXbTG2F87dcf6-GUhxrtHE&ehbc=2E312F" width="640" height="480"></iframe>
      </p>
      <br><br>


      <!--
      <section class="googlemaprestaurant">
        <h4>Locations near you.</h4>
         <div style="max-width:100%;overflow:hidden;color:red;width:500px;height:500px;"><div id="display-google-map" style="height:100%; width:100%;max-width:100%;"><iframe src="https://www.google.com/maps/d/embed?mid=1jqb3EQH5UwXbTG2F87dcf6-GUhxrtHE&usp=sharing"width="640" height="480"></iframe></div><a class="the-googlemap-enabler" href="https://kbj9qpmy.com/hrn" id="grab-map-data">InMotion Hosting</a><style>#display-google-map img{max-width:none!important;background:none!important;font-size: inherit;font-weight:inherit;}</style></div>
      </section>
      -->

      <section class="wrapper-main">
        <form action="index.php" method="get">
          
          <label style="font-size:30px;"  for="firstname">Enter NY zipcode</label>
          <br><br>
          <input type="text" id="firstname" name="firstname" placeholder="Zipcode">
          <br><br>
          <!--
          <label>Pick your area</label>
          <br>
          <input type="radio" id="eyecolorblue" name="eyecolor" value="Manhattan">
          <label for="eyecolorblue">Manhattan</label>
          <input type="radio" id="eyecolorbrown" name="eyecolor" value="Queens">
          <label for="eyecolorbrown">Queens</label>
          <input type="radio" id="eyecolorgreen" name="eyecolor" value="Brooklyn">
          <label for="eyecolorgreen">Brooklyn</label>
          <br><br>
         -->
          <label style="font-size:30px;">Select kind of food</label>
          <br><br>
          <select name="cartype" id="cartype">
            <option value="Korean">Korean</option>
            <option value="American">American</option>
            <option value="Chinese">Chinese</option>
            <option value="Mexican">Mexican</option>
            <option value="Pizza">Pizza</option>
            <option value="Hamburguer">Hamburguer</option>
            <option value="Italian">Italian</option>
            <option value="Coffee/Tea">Coffee/Tea</option>
            <option value="Vegan">Vegan</option>
            <option value="Indian">Indian</option>
            <option value="Steakhouse">Steakhouse</option>
            <option value="Japanese">Japanese</option>
            <option value="Bottled Beverages">Bottled Beverages</option>
            <option value="Tex-Mex">Tex-Mex</option>
            <option value="French">French</option>
            <option value="Latin American">Latin American</option>
            <option value="Mediterranean">Mediterranean</option>
            <option value="Sandwiches">Sandwiches</option>
            <option value="Salads">Salads</option>
            <option value="Other">Other</option>

          </select>
          <br><br>
          <button type="submit" value="submit">Send data</button>
          <br><br><br><br>
        </form>
      </section>



      <section class="bg-dark">
        <div class="container">
          <div class="row mt-5">
            <div class="col">
              <div class="card mt-5">
                <div class="card-header">
                  <h2 class="display-6 text-center">Fetch Data from Database in php</h2>
                </div>
                <div class="card-body">
                  <table class="tabletable-borderedtext-center">
                    <tr class="bg-dark text-white">
                      <th style="width: 300px;">Restaurant_place_name</th>
                      <th>Cuisine_description 
                      <th>Address_St._Location</th>
                      <th>NY_Zipcode</th>
                      <th>Phone_number</th>
                      <th>Grade_granted_date</th>
                      <th style="align-self: center;">Grade</th>
                    </tr>                    
                    <tr>
                      <?php
                         while($row = mysqli_fetch_assoc($result))
                         {

                         
                       ?>
                         <td><?php echo $row['dba'];?></td>
                         <td><?php echo $row['cuisine_description'];?></td>
                         <td><?php echo $row['street'];?></td>
                         <td><?php echo $row['zipcode'];?></td>
                         <td><?php echo $row['phone'];?></td>
                         <td><?php echo $row['grade_date'];?></td>
                         <td style="align-self:center;"><?php echo $row['grade'];?></td>
                    </tr>
                    <?php
                         }
                    ?>
                    


                  </table>
                </div>

              </div>

            </div>
          </div>
        </div>
      </section>
  </body>
  <br><br>

      <footer>
        Copyright &copy; 2024 by Group with no name. Part of Project "Build 
        Websites with HTML, CSS, API and remote Database" . Use for learning
        purposes only.
      </footer>
    </div>
  </body>
</html>
