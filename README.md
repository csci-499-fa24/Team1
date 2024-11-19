# Restaurant and Bar Tracker
### Team 1: Benjamin Zhang, Jose Rojas, Hector Zhengliang, Guozhong Weng, Mohammad Ikbal

## Setting up postgreSQL 
### _(You can also reference config.json in the configuration folder, specifically in development)_
1. Download PostgreSQL and complete the installation process
   - Make sure you remember the password you created when installing postgresql
2. Open the default PostgreSQL server that is shown when opening pgadmin
   - Pgadmin will then tell you to input a password to open the server and this is where you put in the password you remembered during the installation process
3. Create a new user under Login/Group Role

   - In General, set the Name as *fall24user*
   - In Definition, set the Password as *fall24pass*
   - In Privilege, make sure you at least have these settings turned on (Note: I currently have an older version of Pgadmin, so if there are some settings that's already turned on that I didn't list, then you can just leave it alone):
        - Can login?
        - Superuser?
        - Create roles? 
        - Create databases? 
        - Inherit rights from the parent roles?
4. Under Databases, create a new database
    - Under General, set Database to *bar_and_restaurant_tracker* 


5. And now that you have that set up, after you run *npm run dev* in server, it will automatically create the tables for the respected model listed in the project

-----

## Credits and Attributions
   - Bar and restaurant markers
      - <a href="https://www.flaticon.com/free-icons/restaurant" title="restaurant icons">Restaurant icons created by asol_studio - Flaticon</a>
      - <a href="https://www.flaticon.com/free-icons/maps-and-location" title="maps and location icons">Maps and location icons created by DinosoftLabs - Flaticon</a>