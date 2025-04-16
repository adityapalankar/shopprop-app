import React from "react";
import Footer from "../Footer/footer";
import { useEffect, useState } from "react";
import apiModule from "../Api/apiModule";
import ErrorImg from "../../assets/error-1.png";
import NoImage from "../../assets/No-image-available.jpeg";
import { useNavigate } from "react-router-dom";
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  LinkedinShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon,
  LinkedinIcon,
} from "react-share";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBed,
  faBath,
  faAreaChart,
  faClose,
  faShare,
  faHeart as faSolidHeart,
} from "@fortawesome/free-solid-svg-icons";

import { faHeart } from "@fortawesome/free-regular-svg-icons";
import Loader from "../Loader/loader";
import LoginPopup from "../Login/login";

const FavouritesComponent = () => {
  const [favoriteProperties, setFavoriteProperties] = useState(new Set());
  const [properties, setProperties] = useState([]);
  const navigate = useNavigate();
  const storedUserJson = localStorage.getItem("userJson");
  let user = storedUserJson ? JSON.parse(storedUserJson) : null;
  let tenant_name = user.tenant_name;
  const [isLoading, setIsLoading] = useState(false);

  const [showDialog, setShowDialog] = useState(false);
  const [currentShareUrl, setCurrentShareUrl] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);  // Modal visibility

  const getFavoriteProperties = async () => {
    setIsLoading(true);
    const api = await apiModule; // Assuming apiModule is correctly imported or available
    try {
      // Fetch the list of favorite properties
      const favorites = await api.getFavorites();
      setFavoriteProperties(new Set(favorites));

      // Create an array to store the responses
      const propertyDetails = [];

      // Loop through the favorites array to extract mls and id
      for (const favorite of favorites) {
        // Extracting mls and id from the string, assuming it follows the format "NWMLS_12345"
        const mls = favorite.split("_")[0]; // Extract the "NWMLS" part
        const id = favorite.split("_")[1]; // Extract the "12345" part

        // Fetch the property details for each favorite
        const response = await api.getPropertyByMLS(mls, id); // Assuming the correct API function and arguments
        if (response && response[0]) {
          const item = response[0];
          propertyDetails.push({
            imageUrl: item.image_url?.[0] || "",
            address: item.address || "",
            area: item.area?.finished || "",
            price: item.price?.current || "",
            bedrooms: item.bedroom?.count || 0,
            bathrooms: item.bathroom?.count || 0,
            property_descriptor: item.property_descriptor?.id,
            property_descriptor_mls: item.property_descriptor?.mls_name,
            hoa: item.hoa?.per_month || "N/A",
            propertyType: item.property_type?.value || "N/A",
            status: item.status?.value || "N/A",
          });
        }
      }

      console.log(propertyDetails);

      // Set the favorite properties using the array of responses
      setProperties(propertyDetails);
      setIsLoading(false);
      console.log(properties.length);
    } catch (err) {
      setIsLoading(false);
      console.error("Error fetching favorites:", err);
    }
  };
  
  const handleLoginStatusChange = (status) => {
    console.log(status)
    setIsLoggedIn(status); // Update login status after login
  };

  const openLogin = () =>{
    setShowLoginPopup(true); 
  }

  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");
    const userAliasID = localStorage.getItem("userAliasID");

    // If both userInfo and userAliasID are present, set the isLoggedIn state to true; otherwise, set it to false.
    setIsLoggedIn(!!userInfo && !!userAliasID);
    if(isLoggedIn){
    getFavoriteProperties();
    console.log("isloggedin")
    }
   
  }, [isLoggedIn]);

  const closeDialog = () => {
    setShowDialog(false);
    setCurrentShareUrl("");
  };

  const openDialog = (shareUrl) => {
    setCurrentShareUrl(shareUrl);
    setShowDialog(true);
  };

  const handleCardClick = (property) => {
    navigate(
      `/landing/tenant/${tenant_name}/property/${property.property_descriptor_mls}/${property.property_descriptor}`
    );
  };

  const handleFavourites = async (property) => {
    const api = await apiModule;
    const id = `${property.property_descriptor_mls}_${property.property_descriptor}`;
    const payload = { set: [id] };

    try {
      if (favoriteProperties.has(id)) {
        await api.removeFavorite(payload);
        toast.success("Deleted from favorites.");
        setFavoriteProperties((prev) => {
          const updated = new Set(prev);
          updated.delete(id);
          return updated;
        });
      } else {
        await api.addFavorite(payload);
        toast.success("Added to favorites.");
        setFavoriteProperties((prev) => new Set(prev).add(id));
      }
    } catch (err) {
      toast.error("Failed to update favorites.");
      console.error("Error updating favorites:", err);
    }
  };

  return (
    <div>
    
        <h3 className="p-4 offer-listing-header text-center">Favourite Properties</h3>
        {isLoading && <Loader />}
        {isLoggedIn ? (
        <div style={{ display: isLoading ? "none" : "block" }}>
        <div className="mb-5">
          {properties.length === 0 ? (
            <div className="no-property-found text-center">
              <img
                src={ErrorImg}
                className="error-img"
                alt="No properties found"
              />
              <h2>No favourite properties found!</h2>
              <p>We weren't able to find any favourite properties.</p>
            </div>
          ) : (
            properties.map((property, index) => (
              <div
                onClick={() => handleCardClick(property)}
                key={index}
                style={{
                  margin: "20px",
                  borderRadius: "10px",
                  boxShadow:
                    "0px 0px 10px 0px rgba(0, 0, 0, 0.2), 0px 0px 10px 0px rgba(0, 0, 0, 0.2)",
                  color: "black",
                  textDecoration: "none",
                  display: "block",
                  position: "relative",
                }}
              >
                {property.imageUrl ? (
                  <img
                    src={property.imageUrl}
                    alt="Property"
                    style={{
                      height: "100%",
                      width: "100%",
                      borderRadius: "10px 10px 0px 0px",
                    }}
                    onError={(e) => {
                      e.target.onerror = null; // Prevents infinite loop in case fallback image also fails
                      e.target.src = NoImage;
                    }}
                  />
                ) : (
                  <img
                    src={NoImage}
                    alt="No images available"
                    style={{ height: "100%", width: "100%" }}
                  />
                )}
                <button
                  style={{
                    position: "absolute",
                    top: "10px",
                    left: "10px",
                    backgroundColor:
                      property.status === "SALE" ? "green" : "red",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    padding: "5px 10px",
                    fontWeight: "bold",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                  }}
                >
                  {property.status === "SALE" ? "Active" : property.status}
                </button>
                <div
                  className="d-flex justify-content-between align-items-center text-decoration-none text-black"
                  style={{ cursor: "pointer" }}
                >
                  <p
                    style={{ margin: "10px", fontWeight: "bold" }}
                    className="fs-4"
                  >
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(property.price)}
                  </p>
                  <div>
                    <button
                      className="bg-white border-0 fs-4 m-2"
                      onClick={(event) => {
                        event.stopPropagation(); // Prevents <a> click
                        openDialog(
                          `https://www.shopprop.com/#/search/property/${property.property_descriptor_mls}/${property.property_descriptor}`
                        );
                      }}
                    >
                      <FontAwesomeIcon
                        icon={faShare}
                        style={{
                          color: "#0e5eaa",
                        }}
                      />
                    </button>
                    <button
                      className="bg-white border-0 fs-4 m-2"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleFavourites(property);
                      }}
                    >
                      <FontAwesomeIcon
                        icon={
                          favoriteProperties.has(
                            `${property.property_descriptor_mls}_${property.property_descriptor}`
                          )
                            ? faSolidHeart
                            : faHeart
                        }
                        style={{
                          color: favoriteProperties.has(
                            `${property.property_descriptor_mls}_${property.property_descriptor}`
                          )
                            ? "#0e5eaa"
                            : "black",
                        }}
                      ></FontAwesomeIcon>
                    </button>
                  </div>
                </div>
                <ToastContainer
                  position="top-right"
                  autoClose={3000}
                  limit={1}
                />
                <div style={{ display: "flex", alignItems: "center" }}>
                  <p style={{ margin: "10px" }}>
                    <FontAwesomeIcon icon={faBed} className="mx-1" />
                    {property.bedrooms || "N/A"} Beds
                  </p>
                  <p style={{ margin: "10px" }}>
                    <FontAwesomeIcon icon={faBath} className="mx-1" />
                    {property.bathrooms || "N/A"} Baths
                  </p>
                  <p style={{ margin: "10px" }}>
                    <FontAwesomeIcon icon={faAreaChart} className="mx-1" />
                    {property.area || "N/A"} sqft
                  </p>
                </div>
                <h2
                  style={{ fontSize: "0.82rem" }}
                  className="text-uppercase p-2"
                >
                  {property.address.google_address}
                </h2>
              </div>
            ))
          )}

          {showDialog && (
            <div
              style={{
                position: "fixed",
                top: "30%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                backgroundColor: "white",
                padding: "15px",
                borderRadius: "10px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                zIndex: 1000,
                width: "80%",
              }}
            >
              <div className="d-flex justify-content-between">
                <h3 className="m-0">Share this Property</h3>
                <button
                  onClick={closeDialog}
                  style={{
                    backgroundColor: "#EEEEEE",
                    color: "black",
                    border: "none",
                    padding: "0px 5px",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  <FontAwesomeIcon icon={faClose}></FontAwesomeIcon>
                </button>
              </div>
              <div style={{ display: "flex", gap: "10px", margin: "15px 0px" }}>
                <FacebookShareButton url={currentShareUrl}>
                  <FacebookIcon size={40} round />
                </FacebookShareButton>
                <TwitterShareButton url={currentShareUrl}>
                  <TwitterIcon size={40} round />
                </TwitterShareButton>
                <WhatsappShareButton url={currentShareUrl}>
                  <WhatsappIcon size={40} round />
                </WhatsappShareButton>
                <LinkedinShareButton url={currentShareUrl}>
                  <LinkedinIcon size={40} round />
                </LinkedinShareButton>
              </div>
            </div>
          )}
        </div>
        {showDialog && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              zIndex: 999,
            }}
            onClick={closeDialog}
          ></div>
        )}
      </div>):(
        <div className="no-property-found text-center">
        <img
          src={ErrorImg}
          className="error-img"
          alt="No properties found"
        />
        <h2>No favourite properties found!</h2>
        <button className="btn-new-top mt-4 w-50" onClick={() => openLogin()}>Login</button>
      </div>
      )}
      {showLoginPopup && <LoginPopup showLoginPopup={showLoginPopup}  onLoginStatusChange={handleLoginStatusChange} />}
      <Footer></Footer>
    </div>
  );
};

export default FavouritesComponent;
