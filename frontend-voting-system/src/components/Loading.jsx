import React from "react";
import "./Loading.css";

function Loading({ isLoading, processing, neutral }) {
  return (
    <div className="loading-container">
      {isLoading ? (
        <div className="spinner-wrapper">
          <div className="spinner"></div>
          <p>{processing}</p>
        </div>
      ) : (
        <p>{neutral}</p>
      )}
    </div>
  );
}

export default Loading;
