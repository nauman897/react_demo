import React from 'react';
import {  Spinner } from 'react-bootstrap';
import './index.css'

// Loader to show on screen whenever response from an API is being fetched

const Loader: React.FC = () => {
    return (
      <div className="spinner-overlay">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    )
} 

export default Loader;