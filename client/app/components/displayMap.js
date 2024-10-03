import React from 'react';

const GoogleMapEmbed = () => {
  const embedUrl = `https://www.google.com/maps/embed/v1/place?key=${process.env.GOOGLE_MAP_API_KEY}&q=New+York+City&zoom=14`;

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