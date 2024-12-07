import React from "react";

const Contact = () => {
  return (
    <div className="contact-page-wrapper">
      <h1 className="primary-heading">Have Question In Mind?</h1>
      <h1 className="primary-heading">Let Us Help You</h1>
      <div className="contact-form-container">
        {/* <input type="text" placeholder="fa24capstoneproj@gmail.com" /> */}
        <address>fa24capstoneproj@gmail.com</address>
        <a
          href="mailto:fa24capstoneproj@gmail.com"
          className="secondary-button"
        >
          Submit
        </a>
      </div>
    </div>
  );
};

export default Contact;
