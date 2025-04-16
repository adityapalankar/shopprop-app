import React, { useState, useEffect } from "react";
import MapComponent from "../Map/map";
import logo from "../../assets/metricrealties-logo.png";
import '../Landing/landing.css';
import axios from "axios";
import Swal from "sweetalert2";

const LandingComponent = () => {
  const [tenant, setTenant] = useState("");
  const [showMap, setShowMap] = useState(false);

  const handleTenantChange = (event) => {
    setTenant(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const storedUserJson = localStorage.getItem('userJson');
    if (storedUserJson) {
      const userJson = JSON.parse(storedUserJson);
      if (userJson.tenant_name === tenant) {
        setShowMap(true);
        return;
      }
    }

    axios.get(`https://54jpl1ouol.execute-api.us-east-1.amazonaws.com/prod/tenant/${tenant}/config/tenant-details/user`)
      .then(response => {
        const userJson = response.data;
        if (userJson.tenant_name) {
          localStorage.setItem('userJson', JSON.stringify(userJson));
          setShowMap(true);
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Invalid Tenant',
            text: 'Invalid tenant name. Please enter a valid tenant.',
          });
        }
      })
      .catch(error => {
        console.error('Error retrieving user data:', error);
      });
  };

  // useEffect(() => {
  //   const storedUserJson = localStorage.getItem('userJson');
  //   if (storedUserJson) {
  //     const userJson = JSON.parse(storedUserJson);
  //     if (userJson.tenant_name === tenant) {
  //       setShowMap(true);
  //     }
  //   }
  // }, [tenant]);

  return (
    <div className="landing-page-container">
      <div className="background-image"></div>
      <div className="popup-container">
        <img src={logo} alt="Logo" className="logo" />
        <form onSubmit={handleSubmit} className="form-class">
          <div className="form-field">
            <input type="text" placeholder="Enter Company Name" className="popup-bar-input" value={tenant} onChange={handleTenantChange} />
          </div>
          <button className="submit-button" type="submit">Submit</button>
        </form>
      </div>
      {showMap && <MapComponent />}
    </div>
  );
};

export default LandingComponent;
