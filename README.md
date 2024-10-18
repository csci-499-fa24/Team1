# Restaurant and Bar Tracker
### Team 1: 

## Setting up postgreSQL 
### _(You can also reference config.json in the configuration folder, specifically in development)_
1. Download PostgreSQL and complete the installation process
2. In Pgadmin, create a new user under Login/Group Role

   - In General, set the Name as *fall24user*
   - In Definition, set the Password as *fall24pass*
   - In Privilege, make sure you at least have these settings turned on (Note: I currently have an older version of Pgadmin, so if there are some settings that's already turned on that I didn't list, then you can just leave it alone):
        - Can login?
        - Superuser?
        - Create roles? 
        - Create databases? 
        - Inherit rights from the parent roles?
3. Under Databases, create a new database
    - Under General, set Database to *bar_and_restaurant_tracker* 


4. And now that you have that set up, after you run *npm run dev* in server, it will automatically create the tables for the respected model listed in the project

-----
    