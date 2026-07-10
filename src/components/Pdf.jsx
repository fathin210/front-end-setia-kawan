import React from "react";

const Pdf = ({ pdfURL, title }) => {
  return (
    <iframe
      src={pdfURL}
      width="100%"
      height="700vh"
      style={{ border: "none", display: "block" }}
      title={title}
    />
  );
};

export default Pdf;
