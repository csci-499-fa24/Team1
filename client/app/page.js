'use client'

import styles from "./page.module.css";
import React, {useEffect, useState} from 'react'

export default function Home() {
  
   const [message, setMessage] = useState("Loading")
   const [title, setTitle] = useState("");
   const [description, setDescription] = useState("");
   const [feedback, setFeedback] = useState("");
   const [examples, setExamples] = useState([]);

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
      title,
      description
    };

    try {
      const response = await fetch(process.env.NEXT_PUBLIC_SERVER_URL + "/api/example", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const result = await response.json();
        setFeedback("Example added successfully!");
        console.log(title);
        console.log(description);
        setTitle("");
        setDescription("");
        fetchExamples();
      } else {
        setFeedback("Failed to add the example.");
      }
    } catch (error) {
      console.error("Error submitting form", error);
      setFeedback("An error occurred while submitting the form.");
    }
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div>Return message from servers</div>
        <div>{message}</div>

        {/* Adding New Example */}
         <h2>Add New Example</h2>
         <form onSubmit={handleSubmit} className={styles.form}>
           <div>
             <label htmlFor="title">Example:</label>
             <input 
              id="example"
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              required
            />
          </div>
          <div>
            <label htmlFor="description">Description:</label>
            <textarea 
              id="description"
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
            />
          </div>
          <button type="submit">Submit</button>
        </form>

        <div>{feedback}</div>

        {/* Displaying list of examples */}
        <h2>Examples List</h2>
        <ul>
          {examples.map((example) => (
            <li key={example.id}>
              <strong>{example.title}</strong>: {example.description}
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}