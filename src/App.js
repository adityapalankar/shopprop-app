import "./App.css";
import {
  HashRouter as Router,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import React, { useEffect } from "react";
import LandingComponent from "./components/Landing/landing";
import Listing from "./components/Listing/Listing";
import MapComponent from "./components/Map/map";
import OfferListing from "./components/Offer-listing/offer-listing";
import PropertyDetails from "./components/Property-details/property-details";
import Contacts from "./components/Contacts/contacts";
import ErrorPage from "./components/ErrorPage/error";
import FavouritesComponent from "./components/Favourites/favourites";
import axios from "axios";
import DashboardComponent from "./components/Dashboard/dashboard";
import Calculations from "./components/Calculator/calculator";
import { Amplify } from "aws-amplify";

function App() {
  const path = window.location.href;
  const tenantParam = path.split("/tenant").pop();
  const tenantName = tenantParam.split("/")[1];

  const storedUserJson = localStorage.getItem("userJson");
  let user = storedUserJson ? JSON.parse(storedUserJson) : null;
  let logo = user ? user.logo : null;
  let tenant_name = user ? user.tenant_name : tenantName;

  if (user) {
    let domain = "";
    const domain_url = window.location.hostname;
    
    if (domain_url == "mobile.shopprop.com") {
      domain = ".shopprop.com";
    } else if (domain_url == "localhost") {
      domain = "localhost";
    } else {
      domain = ".metricrealties.com";
    }

    Amplify.configure({
      Auth: user.cognito,
      cookieStorage: {
        domain: domain,
        secure: false,
        path: "/",
        expires: 365,
      },
    });
  }
  // const LoginWithGoogle = async () => {
  //     let location = window.location;
  //     let authObject = user.cognito;

  //     // if (location.hostname !== "localhost") {
  //         let redirectSignIn = location.origin;
  //         let redirectSignOut = location.origin;
  //         authObject.oauth.redirectSignIn = redirectSignIn;
  //         authObject.oauth.redirectSignOut = redirectSignOut;
  //     // } else {
  //     //     authObject.oauth.redirectSignIn = "/";
  //     //     authObject.oauth.redirectSignOut = "/";
  //     // }

  //     Amplify.configure({
  //         Auth: authObject,
  //     });

  //     console.log("fetch here");
  //     if (!localStorage.getItem("userAliasID")) {
  //         console.log("fetching ......");
  //         fetchData();
  //     }
  // };

  // const get_alias_id = async (email) => {
  //     const api = await apiModule;
  //     const response = await api.getUserAliasIdFromEmail(email);
  //     localStorage.setItem("userAliasID", response.UniqueAliasId);
  //     localStorage.setItem("userInfo", email);
  // };

  // const getCurrentUserEmail = async () => {
  //     try {
  //         const user = await Auth.currentUserInfo();
  //         const email = user.attributes.email;
  //         return email;
  //     } catch (error) {
  //         console.error("Error fetching user email:", error);
  //         // Handle the error gracefully, if needed
  //     }
  // };

  // const fetchData = async () => {
  //     try {
  //         // Assuming Auth.currentUserInfo(), getCurrentUserEmail(), and get_alias_id() return promises
  //         await Auth.currentUserInfo();
  //         const userEmail = await getCurrentUserEmail();

  //         if (userEmail) {
  //             await get_alias_id(userEmail);
  //             // window.location.reload();

  //             window.location.href = "/#/landing/tenant/"+tenant_name+"/home";
  //             Swal.fire({
  //               title: "Login Successfully",
  //               icon: "success",
  //             });
  //         }
  //     } catch (error) {
  //         console.error("Error occurred:", error);
  //     }
  // };

  // if (user) {
  //     LoginWithGoogle();
  // } // Add '/#/' before the route

  if (!user) {
    // User JSON not found in local storage
    if (tenantName) {
      // Tenant name extracted from the URL
      axios
        .get(
          `https://54jpl1ouol.execute-api.us-east-1.amazonaws.com/prod/tenant/${tenantName}/config/tenant-details/user`
        )
        .then((response) => {
          const newUser = response.data;
          console.log(newUser);
          localStorage.setItem("userJson", JSON.stringify(newUser));
          user = newUser;
          logo = user ? user.logo : null;
          tenant_name = user?.tenant_name;
          if (user.tenant_name === tenantName) {
            window.location.reload();
          }
          // Reload the page with the updated URL
        })
        .catch((error) => {
          console.error("Error retrieving user data:", error);
          window.location.href = `/#/landing/error`; // Replace '/your-new-page' with the desired URL
        });
    }
  } else {
    // User JSON found in local storage
    if (user.tenant_name === tenantName) {
      // Existing user JSON matches the extracted tenant name
      logo = user.logo;
      tenant_name = user.tenant_name;
    } else if (tenantName) {
      localStorage.removeItem("userJson");
      // Tenant name extracted from the URL, but it's different from the existing user JSON
      axios
        .get(
          `https://54jpl1ouol.execute-api.us-east-1.amazonaws.com/prod/tenant/${tenantName}/config/tenant-details/user`
        )
        .then((response) => {
          const newUser = response.data;
          localStorage.setItem("userJson", JSON.stringify(newUser));
          user = newUser;
          logo = user ? user.logo : null;
          tenant_name = user?.tenant_name;

          window.location.reload();
        })
        .catch((error) => {
          console.error("Error retrieving user data:", error);
          window.location.href = `/#/landing/error`;
        });
    }
  }

  return (
    <Router>
      <Routes>
        <Route path="/landing" element={<LandingComponent />} />
        <Route path="/landing/tenant/:tenant/home" element={<Listing />} />
        <Route
          path="/landing/tenant/:tenant/calculations"
          element={<Calculations />}
        />
        <Route path="/landing/tenant/:tenant/contacts" element={<Contacts />} />
        <Route
          path="/landing/tenant/:tenant/offer-listing"
          element={<OfferListing />}
        />
        <Route
          path="/landing/tenant/:tenant/favourites"
          element={<FavouritesComponent />}
        />
        <Route
          path="/landing/tenant/:tenant/user"
          element={<DashboardComponent />}
        />
        <Route
          path="/landing/tenant/:tenant/map-search"
          element={<MapComponent />}
        />
        <Route
          path="/landing/tenant/:tenant/map-search/viewport"
          element={<MapComponent />}
        />
        <Route
          path="/landing/tenant/:tenant/map-search/citystate"
          element={<MapComponent />}
        />
        <Route
          path="/landing/tenant/:tenant/map-search/zipcode"
          element={<MapComponent />}
        />
        <Route
          path="/landing/tenant/:tenant/map-search/address"
          element={<MapComponent />}
        />
        <Route
          path="/landing/tenant/:tenant/property/:mls/:descriptor"
          element={<PropertyDetails />}
        />
        <Route path="/property-details" element={<PropertyDetails />} />
        <Route path="/landing/error" element={<ErrorPage />} />

        {/* Redirect the root URL to the landing page */}
        <Route path="/" element={<LandingRedirect />} />
      </Routes>
    </Router>
  );
}

function LandingRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/landing"); // Add '/#/' before the route
  }, [navigate]);

  return null;
}

export default App;
