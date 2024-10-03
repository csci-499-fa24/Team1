'use client'

import styles from "./page.module.css";
import React, {useEffect, useState} from 'react'

export default function Home() {
  
   const [message, setMessage] = useState("Loading")
   const [userType, setUserType] = useState("");
   const [userName, setUserName] = useState("");
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [confirmPassword, setCpassword] = useState("");
   const [feedback, setFeedback] = useState("");
   const [examples, setExamples] = useState([]);
   const [feedback2, setFeedback2] = useState("");

   const [lEmail, setLemail] = useState("");
   const [lPassword, setLpassword] = useState("");

  console.log(process.env.NEXT_PUBLIC_SERVER_URL + "/api/home")
  useEffect(() => {
    fetch(process.env.NEXT_PUBLIC_SERVER_URL + "/api/home").then(
      response => response.json()
    ).then(
      data => {
        console.log(data)
        setMessage(data.message)
      }
    )
  }, [])
  
  // Fetch all examples from the server
  const fetchExamples = async () => {
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_SERVER_URL + "/api/example");
      if (response.ok) {
        const data = await response.json();
        setExamples(data);
      } else {
        console.error("Failed to fetch examples");
      }
    } catch (error) {
      console.error("Error fetching examples", error);
    }
  };


  // Handler to submit the form
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    const data = {
      userType,
      userName,
      password,
      email,
      confirmPassword
    };

    try {
      const response = await fetch(process.env.NEXT_PUBLIC_SERVER_URL + "/api/v1/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      
      if (response.ok) {
        //const result = await response.json();
        setFeedback("signup successfully!");
        setUserName("");
        setEmail("");
        setPassword("");
        setCpassword("");
        setUserType("");
        //fetchExamples();
      } else {
        //setFeedback("Failed to add the example.");
        //console.error( err.message);
        //setFeedback(error);
        //const errorData = await response.json();
        throw new Error(result.message);
      }
    } catch (error) {
      //console.error("Error submitting form", error);
      //console.log( error.message);
     // document.getElementById('error').textContent = error.message;
      //setFeedback("An error occurred while submitting the form.");
      setFeedback(error.message);
    };
  };



   // Handler to login
   const handleLogin = async (event) => {
    event.preventDefault();
    
    const data = {
      
      lPassword,
      lEmail,
    };

    try {
      const response = await fetch(process.env.NEXT_PUBLIC_SERVER_URL + "/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({email:lEmail, password:lPassword})
      });
      const result = await response.json();
      
      if (response.ok) {
        //const result = await response.json();
        setFeedback2("login successfully!");
       
        setLemail("");
       
        setLpassword("");
        
        //fetchExamples();
      } else {
        //setFeedback("Failed to add the example.");
        //console.error( err.message);
        //setFeedback(error);
        //const errorData = await response.json();
        throw new Error(result.message);
      }
    } catch (error) {
      //console.error("Error submitting form", error);
      //console.log( error.message);
     // document.getElementById('error').textContent = error.message;
      //setFeedback("An error occurred while submitting the form.");
      setFeedback2(error.message);
    };
  };








  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div>Return message from server</div>
        <div>{message}</div>

        {/* Adding New Example */}
         <h2>Sign up</h2>
         <form onSubmit={handleSubmit} className={styles.form}>
           <div>
             <label htmlFor="UserName">userName:</label>
             <input 
              id="example"
              type="text" 
              value={userName} 
              onChange={(e) => setUserName(e.target.value)} 
              required
            />
          </div>      

          <div>
             <label htmlFor="email">email:</label>
             <input 
              id="example"
              type="text" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required
            />
          </div>

          <div>
            <label htmlFor="password">password:</label>
            <input
              id="sPassword"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>

          <div>
             <label htmlFor="cPassword">confirm password:</label>
             <input 
              id="example"
              type="text" 
              value={confirmPassword} 
              onChange={(e) => setCpassword(e.target.value)} 
              required
            />
          </div>

          <button type="submit">Submit</button>
        </form>

        <div >{feedback}</div>






         {/* Adding New Example */}
         <h2>Login </h2>
         <form onSubmit={handleLogin} className={styles.form}>
          <div>
             <label htmlFor="lEmail">email:</label>
             <input 
              id="lEmail"
              type="text" 
              value={lEmail} 
              onChange={(e) => setLemail(e.target.value)} 
              required
            />
          </div>

          <div>
            <label htmlFor="lPassword">password:</label>
            <input
              id="lPassword"
              value={lPassword} 
              onChange={(e) => setLpassword(e.target.value)} 
            />
          </div>
          <button type="submit">Submit</button>
        </form>

        <div >{feedback2}</div>



        {/* Displaying list of examples */}
        <h2>Examples List</h2>
        <ul>
          {examples.map((example) => (
            <li key={example.id}>
              <strong>{example.userName}</strong>: {example.password}
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}