import React from "react";

const Pdf = ({ pdfURL, title }) => {
  return pdfURL ? (
    <iframe src={pdfURL} width="100%" height="500px" title={title} />
  ) : (
    <Typography variant="body2">Gagal menampilkan PDF</Typography>
  );
};

export default Pdf;
