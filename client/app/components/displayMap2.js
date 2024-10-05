import React from 'react';

const GoogleMapEmbed = () => {
  const embedUrl = `https://www.google.com/maps/d/embed?mid=1jqb3EQH5UwXbTG2F87dcf6-GUhxrtHE&ehbc=2E312F`;

  return (
    <div 
      style={{
        display: 'flex',
        justifyContent: 'center',
        marginTop: '40px', 
        height: '600px',
        width: '100%',
      }}
    >
      <iframe
        width="90%"
        height="100%"
        style={{ border: 0 }}
        src={embedUrl}
        allowFullScreen=""
        aria-hidden="false"
        tabIndex="0"
      />
    </div>
  );
};

export default GoogleMapEmbed;
