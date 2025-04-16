import { Component } from "react";
// import React from "react";
import React, { useState, useEffect } from "react";
import "./../Listing/Listing.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRightToBracket,
  faEnvelope,
  faPhone,
  faChevronUp,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import Routing from "../../components/routing";
import Footer from "../../components/Footer/footer";
import { faAndroid } from "@fortawesome/free-brands-svg-icons";
import office from "../../assets/office.png"; // Update the path if necessary
// import "bootstrap/dist/css/bootstrap.min.css"
import LoginPopup from "../Login/login";
import { Amplify, Auth } from "aws-amplify";
import { NavLink } from "react-router-dom";
import Calculator from "../Calculator/calculator";

const Listing = () => {
  const userJson = localStorage.getItem("userJson");

  // Parse the userJson if it exists
  const user = userJson ? JSON.parse(userJson) : null;

  // Access attributes from the user object
  const logo = user ? user.logo : null;
  const text = user ? user.home_slider[0].title : null;
  const contactNo = user ? user.contact.phone1 : null;
  const email = user ? user.contact.email1 : null;
  const agentDashboard = user ? user.agent_auth_urls : null;
  const userDashboard = user ? user.user_auth_urls : null;
  const primaryColor = user?.colors_of_theme?.header_color;
  const jsonColor = {
    background: "#0e5eaa",
  };
  const currentYear = 2024;

  const [isToggleChecked, setIsToggleChecked] = useState(false);
  const [dropdownMenuMobile, setDropdownMenuMobile] = useState(false);

  const urlToOpenIUser = `https://${userDashboard}?referrer=${encodeURIComponent(
    window.location.host
  )}`;

  function openNewBrowserUser() {
    window.location.href = urlToOpenIUser;

    setToggleStateToFalse();
  }

  // Function to toggle the checkbox and update the variable

  // Function to set the toggle state explicitly to false in LoginPopup component
  const setToggleStateToFalse = () => {
    console.log("here or not");
    setIsToggleChecked(false);
  };

  const handleCheckboxChange = (event) => {
    setIsToggleChecked(event.target.checked);
  };

  const showDropDownMenu = () => {
    setDropdownMenuMobile(!dropdownMenuMobile);
  };

  return (
    <div className="body2">
      <div id="card" className="mb-5">
        <div className="rect" style={jsonColor}></div>

        <div className="section top-section" style={jsonColor}>
          <span>
            {" "}
            <img
              src={logo}
              className=" img-style  rounded-4 bg-white"
              alt="logo"
            />
          </span>
          <h1 className="white-text">{text}</h1>
        </div>
        <div className="section bottom-section">
          <div className="menu-wrap">
            <input
              type="checkbox"
              className="toggler"
              checked={isToggleChecked}
              onChange={handleCheckboxChange}
            />
            <div className="hamburger">
              <div></div>
            </div>
            <div className="menu">
              <div>
                <div>
                  <ul>
                    <li>
                      {" "}
                      <LoginPopup
                        setToggleStateToFalse={setToggleStateToFalse}
                      />
                    </li>
                    {/* <li><a onClick={() => openNewBrowserAgent(urlToOpenAgent)} rel="noopener noreferrer">Agent Dashboard </a></li> */}
                    <li>
                      <a onClick={() => openNewBrowserUser()}>User dashboard</a>
                    </li>
                    <li>
                      <a className="nav-link" onClick={showDropDownMenu}>
                        Tools{" "}
                        <FontAwesomeIcon
                          icon={
                            dropdownMenuMobile ? faChevronUp : faChevronDown
                          }
                          className="arrow"
                        />
                      </a>
                      {dropdownMenuMobile && (
                        <div className="dropdown-mobile">
                          <a
                            className="dropdown-link-mobile"
                            href="https://journey.shopprop.com"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Home Journey
                          </a>
                          <a
                            className="dropdown-link-mobile"
                            href="https://momentum.shopprop.com"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Market Momentum
                          </a>
                          <a
                            className="dropdown-link-mobile"
                            href="https://analyzer.shopprop.com"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Property Analyzer
                          </a>
                        </div>
                      )}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-12 col-sm-12 row">
            <div className="width-section1">
              <img src={office} alt="Example" className="img-style2" />
            </div>
            <div className="width-section2">
              <div className="button-section text-center">
                <button
                  target="_blank"
                  className="btn-home demo-btn-new-top text-center button-1"
                  style={jsonColor}
                >
                  <a href>
                    <div className="icon-class icon-color-home">
                      <FontAwesomeIcon icon={faRightToBracket} />
                    </div>
                  </a>
                </button>

                <button
                  className="btn-home demo-btn-new-top text-center mx-2 button-1"
                  style={jsonColor}
                >
                  <a href="https://tawk.to/chat/64077df931ebfa0fe7f138d9/1gquk85qm">
                    <div className="icon-class icon-color-home">
                      <FontAwesomeIcon icon={faAndroid} />
                    </div>
                  </a>
                </button>

                <button
                  className="btn-home demo-btn-new-top text-center button-1"
                  style={jsonColor}
                >
                  <a href={"mailto:" + email} target="_blank">
                    <div className="icon-class icon-color-home">
                      <FontAwesomeIcon icon={faEnvelope} />
                    </div>
                  </a>
                </button>

                <button
                  target="_blank"
                  className="btn-home demo-btn-new-top text-center mx-2 button-1"
                  style={jsonColor}
                >
                  <a href={"tel:" + contactNo} target="_blank">
                    <div className="icon-class icon-color-home">
                      <FontAwesomeIcon icon={faPhone} />
                    </div>
                  </a>
                </button>
              </div>
            </div>
          </div>
          <div className="m-4 mt-1 text-center">
            <h2 style={{ color: "#0e5eaa" }} className="text-center fw-bold">
              Find Your Dream Home or Sell for Top Value
            </h2>
            <p>
              Use our calculators to see how much you can save when buying or
              selling with ShopProp.
            </p>
            <Calculator></Calculator>
          </div>

          <section
            className="p-4"
            style={{ background: " rgb(14 94 170)", color: "white" }}
          >
            <div className="container text-center">
              <p className="fw-bold mb-4 display-6">
                Experience Premium Service at Unbeatable Rates
              </p>
              <p className="mb-4 fs-5">
                Don't compromise on service or savings. Let ShopProp show you
                how we deliver both.
              </p>
              <div>
                <a
                  href="https://dashboard.shopprop.com"
                  className="btn btn-light px-4 py-2 rounded-pill"
                  style={{ transition: "all 0.3s", transform: "scale(1)" }}
                >
                  Start Your Journey Today
                </a>
              </div>
            </div>
          </section>

          <div className=" border-top text-center small">
            <p className="text-secondary small pt-4">
              &copy; 2024 ShopProp. All rights reserved.
            </p>
            <a
              href="https://www.trec.texas.gov/forms/consumer-protection-notice"
              className="text-secondary text-decoration-none hover-text-primary m-1"
            >
              TREC: Info About Brokerage Services, Consumer Protection Notice
            </a>
          </div>

          <div className="m-3 mb-1 text-center small">
            <ul className="list-unstyled">
              <li>
                <a
                  href="#"
                  className="text-secondary text-decoration-none hover-text-primary"
                >
                  Do Not Sell My Personal Information
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-secondary text-decoration-none hover-text-primary"
                >
                  Digital Millennium Copyright Act of 1998
                </a>
              </li>
              <li>
                WE ARE COMMITTED TO THE FAIR HOUSING AND EQUAL OPPORTUNITIES ACT
              </li>
              <li>
                <a
                  href="#"
                  className="text-secondary text-decoration-none hover-text-primary"
                >
                  Fair Housing
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-secondary text-decoration-none hover-text-primary"
                >
                  Equal Opportunity Act
                </a>
              </li>
            </ul>
          </div>

          <div className=" text-center small text-secondary">
            <p className="m-0">
              If you are using a screen reader or having trouble reading this
              website, please call 888-821-2556 for help.
            </p>
          </div>

          <Footer />
        </div>
      </div>
    </div>
  );
};
export default Listing;
