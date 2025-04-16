import { Component } from "react";
// import React from "react";
import classNames from "classnames";
import React, { useState, useEffect } from "react";
import "./../Footer/footer.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMap,
  faAddressBook,
  faHeart,
  faChartBar,
} from "@fortawesome/free-regular-svg-icons";

import {
  faHome,
  faMap as faSolidMap,
  faAddressBook as faSolidAddressBook,
  faHeart as faSolidHeart,
  faListUl,
  faChartSimple,
  faChartColumn,

} from "@fortawesome/free-solid-svg-icons";

import { NavLink, Route, Routes } from "react-router-dom";

const Footer = () => {
  const userJson = localStorage.getItem("userJson");

  // Parse the userJson if it exists
  const user = userJson ? JSON.parse(userJson) : "dashboard.shopprop.com";

  // Access attributes from the user object

  const tenant_name = user?.tenant_name;

  const userDashboard = user ? user.user_auth_urls : null;

  return (
    <div className="footer fixed-navigation">
      <div className="footer-icons">
        <div className="footer-item">
          <NavLink
            to={`/landing/tenant/${tenant_name}/map-search`}
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            {({ isActive }) => (
              <FontAwesomeIcon icon={isActive ? faSolidMap : faMap} />
            )}
          </NavLink>
        </div>
        <div className="footer-item">
          <NavLink
            to={`https://${userDashboard}/#/login`}
           
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            {({ isActive }) => (
              <FontAwesomeIcon
                icon={isActive ? faChartSimple : faChartSimple}
                style={
                  isActive
                    ? {
                        color: "#0e5eaa",
                       
                      } // Inactive styling
                    : { color: "transparent" , stroke: "#0e5eaa",
                      strokeWidth: "50px",} // Active styling
                }
              />
            )}
          </NavLink>
        </div>
        <div className="footer-item">
          <NavLink
            to={`/landing/tenant/${tenant_name}/favourites`}
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            {({ isActive }) => (
              <FontAwesomeIcon icon={isActive ? faSolidHeart : faHeart} />
            )}
          </NavLink>
        </div>

        <div className="footer-item">
          <NavLink
            to={`/landing/tenant/${tenant_name}/offer-listing`}
            className={({ isActive }) => (isActive ? "active" : "inactive")}
          >
            {({ isActive }) => (
              <FontAwesomeIcon
                icon={faListUl}
                style={
                  isActive
                    ? {
                        color: "#0e5eaa",
                        stroke: "#0e5eaa",
                        strokeWidth: "50px",
                      } // Inactive styling
                    : { color: "transparent" , stroke: "#0e5eaa",
                      strokeWidth: "50px",} // Active styling
                }
              />
            )}
          </NavLink>
        </div>

        <div className="footer-item">
          <NavLink
            to={`/landing/tenant/${tenant_name}/home`}
            className={({ isActive }) => (isActive ? "active" : "inactive")}
          >
            {({ isActive }) => (
              <FontAwesomeIcon
                icon={faHome}
                style={
                  isActive
                    ? { color: "#0e5eaa" } // Active styling
                    : {
                        color: "transparent",
                        stroke: "#0e5eaa",
                        strokeWidth: "50px",
                      } // Inactive styling
                }
              />
            )}
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default Footer;
