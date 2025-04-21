import React from "react";

const Pdf = ({ pdfURL, title }) => {
  return <iframe src={pdfURL} width="100%" height="500px" title={title} />;
};

export default Pdf;
