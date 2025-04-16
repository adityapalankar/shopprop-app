import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserCircle,
  faEnvelope,
  faLock,
  faSignInAlt,
  faSignOutAlt,
  faEye,
  faEyeSlash,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import apiModule from "../Api/apiModule";
import Swal from "sweetalert2";
import {
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Link,
  Grid,
  Box,
  Typography,
  Container,
  IconButton,
  InputAdornment,
  FormGroup,
} from "@material-ui/core";
import Modal from "react-modal";
import "../../components/Login/login.css";
import { Amplify, Auth } from "aws-amplify";
import { CognitoHostedUIIdentityProvider } from "@aws-amplify/auth";
import { useNavigate } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import Cookies from "js-cookie";

Modal.setAppElement("#root");

const LoginPopup = ({
  setToggleStateToFalse = () => {},
  showLoginPopup,
  onLoginStatusChange = () => {},
}) => {
  const [showPopup, setShowPopup] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [offerValues, setOfferValues] = React.useState({
    password: "",
    email: "",
  });
  const navigate = useNavigate();
  const userJson = localStorage.getItem("userJson");
  const [loading, setLoading] = useState(false);

  // Parse the userJson if it exists
  const user = userJson ? JSON.parse(userJson) : null;
  const tenant_name = user?.tenant_name;
  if (user) {
    Amplify.configure({
      Auth: user.cognito,
    });
  }
  // Access attributes from the user object
  const userInfo = localStorage.getItem("userInfo");
  const userAliasID = localStorage.getItem("userAliasID");
  const userDashboard = user ? user.user_auth_urls : null;

  useEffect(() => {
    setShowPopup(showLoginPopup);
    // During component mount, check the presence of userInfo and userAliasID in local storage.
    const userInfo = localStorage.getItem("userInfo");
    const userAliasID = localStorage.getItem("userAliasID");

    // If both userInfo and userAliasID are present, set the isLoggedIn state to true; otherwise, set it to false.
    setIsLoggedIn(!!userInfo && !!userAliasID);
  }, [showLoginPopup]);

  const handleChange2 = (e) => {
    const { name, value } = e.target;
    setOfferValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const signIn = (user) => {
   
    return Auth.signIn(user.email, user.password);
  };

  const get_alias_id = async (email) => {
    const api = await apiModule;

    const response = await api.getUserAliasIdFromEmail(email);
    localStorage.setItem("userAliasID", response.UniqueAliasId);

    localStorage.setItem("userInfo", email);
   
  };

  const postCrossDomainMessage = (link, portal, data, IFrameId, login_type) => {
    var postURL;
    let iframeId;


    if (portal) {
      postURL = "https://" + user?._auth_urls;
      iframeId = IFrameId;
    }
    const iframe = document.getElementById(iframeId);
    
    if (iframe == null) {
      return;
    }
    const iWindow = iframe.contentWindow;
    const storageData = { ...data, login_type: login_type };
 
    setTimeout(function () {
      iWindow.postMessage(storageData, link);
      console.log("data sent");
    }, 10000);
  };

  const postUserData = (url, portal, iframeId) => {
    // Implement your postUserData function here or replace it with the actual implementation
    var credential = {
      email: offerValues.email,
      password: offerValues.password,
    };
    
    postCrossDomainMessage(url, portal, credential, iframeId, false);
  };

  const handleLogin = async (e) => {
    setToggleStateToFalse();
    e.preventDefault();
    setLoading(true);
    
    let user_details = {
      email: offerValues.email,
      password: offerValues.password,
      showPassword: false,
      code: "",
      name: "",
    };
 

    try {
      await signIn(user_details);
      await get_alias_id(user_details.email);

      if (user?.user_auth_urls) {
        const iframe1 = document.createElement("iframe");
        iframe1.id = "user-ifr";
        iframe1.style.display = "none";
        iframe1.src = "https://" + user.user_auth_urls;

        document.body.appendChild(iframe1);
        postUserData(
          "https://" + user.user_auth_urls,
          "user_dashboard_default_metricrealties_template",
          iframe1.id
        );
      }
      Swal.fire({
        title: "Logged in Successfully",
        icon: "success",
        confirmButtonText: "Proceed",
      }).then((result) => {
        if (result.isConfirmed) {
          // Navigate to the specified URL
          onLoginStatusChange(true);
          setIsLoggedIn(true);
        }
      });

      setShowPopup(false);
    } catch (err) {
      console.log(err);
      Swal.fire({
        title: "User Not Found",
        text: "Please enter valid credentials!!",
        icon: "error",
        confirmButtonText: "Proceed",
      }).then((result) => {
        if (result.isConfirmed) {
          // Navigate to the specified URL
          window.location.href = `/#/landing/tenant/${tenant_name}/home`;
          setShowPopup(true);
        }
      });
    } finally {
      setLoading(false); // Stop spinner
    }
  };

  const clearAllCookies = async () => {
    // Sign out user (removes authentication cookies)
    await Auth.signOut();

    // Manually clear cookies (for extra safety)
    document.cookie.split(";").forEach((cookie) => {
      const [name] = cookie.split("=");
      document.cookie = `${name}=; path=/; domain=${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
      document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
    });
   
    
  };

  const handleLogout = () => {
    Swal.fire({
      title: "Logout Confirmation",
      text: "Do you want to logout?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, logout",
      cancelButtonText: "No, stay logged in",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    }).then((result) => {
      if (result.isConfirmed) {
        const userJSON = localStorage.getItem("userJson");
        clearAllCookies();
        // Step 2: Clear the entire local storage
        localStorage.clear();

        // Step 3: Store the user JSON back into local storage

        localStorage.setItem("userJson", userJSON);

        Swal.fire({
          title: "Logged Out",
          text: "You have been successfully logged out.",
          icon: "success",
        }).then(() => {
          // Reload the page after showing the success message
          window.location.reload();
        });
      }
    });

    // Reload the page to reflect the logged-out state
  };

  async function signInWithGoogle(authObject) {
    // Configure Amplify with the given authObject
    Amplify.configure({
      Auth: authObject,
    });

    try {
      // Use federatedSignIn to sign in with the Google provider
      await Auth.federatedSignIn({
        provider: CognitoHostedUIIdentityProvider.Google,
      });
      // Now you can use the email to perform further actions as needed.
    } catch (error) {
      console.log("Error signing in with Google:", error);
      throw error;
    }
  }

  async function signInWith() {
    let location = window.location;
    let authObject = user.cognito;

    if (location.hostname !== "localhost") {
      let redirectSignIn = location.origin;
      let redirectSignOut = location.origin;
      authObject.oauth.redirectSignIn = redirectSignIn;
      authObject.oauth.redirectSignOut = redirectSignOut;
    } else {
      authObject.oauth.redirectSignIn = "http://localhost:3000";
      authObject.oauth.redirectSignOut = "http://localhost:3000";
    }
 

    try {
      await signInWithGoogle(authObject);
    } catch (error) {
      console.log(error);
      this.alert.showErrorAlertWithMessage("Unable to Login");
    }
  }

  const deleteAccount = () => {
    Swal.fire({
      title: "Delete Account",
      text: "Do you want to delete an account?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "No",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    }).then((result) => {
      if (result.isConfirmed) {
        const userJSON = localStorage.getItem("userJson");

        // Step 2: Clear the entire local storage
        localStorage.clear();

        // Step 3: Store the user JSON back into local storage

        localStorage.setItem("userJson", userJSON);

        Swal.fire({
          title: "Logged Out",
          text: "Your account have been successfully deleted.",
          icon: "success",
        }).then(() => {
          // Reload the page after showing the success message
          window.location.reload();
        });
      }
    });
  };

  const handleLoginClick = () => {
    setShowPopup(true);
  };

  const handleProfile = () => {
    setShowProfile(true);
  };

  const handleModalClose = () => {
    setShowPopup(false);
    setShowProfile(false);
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div>
      {isLoggedIn ? (
        <div>
          <a
            style={{
              color: "white",
              fontSize: "1.5rem",
            }}
            onClick={handleLogout}
          >
            <FontAwesomeIcon icon={faSignOutAlt} /> Logout
          </a>
          <div className="mt-5">
            <a
              style={{
                color: "white",
                fontSize: "1.5rem",
              }}
              onClick={handleProfile}
            >
              <FontAwesomeIcon icon={faUserCircle} /> My Profile
            </a>
          </div>
        </div>
      ) : (
        <div>
          <a
            style={{
              color: "white",
              fontSize: "1.5rem",
            }}
            onClick={handleLoginClick}
          >
            <FontAwesomeIcon icon={faUserCircle} /> Login
          </a>
        </div>
      )}

      <Modal
        isOpen={showPopup}
        onRequestClose={handleModalClose}
        contentLabel="Login Modal"
        style={{
          content: {
            height: "fit-content",
            top: "20%",
          },
        }}
      >
        <Container component="main" maxWidth="xs">
          <div className="text-center">
            <Typography component="h1" variant="h5">
              Sign in
            </Typography>
            <p className="mt-2" style={{ fontSize: "70%" }}>
              We're glad to see you here again.Please sign in
            </p>
            <form onSubmit={handleLogin}>
              <FormGroup>
                <TextField
                  label="Email"
                  name="email"
                  value={offerValues.email}
                  onChange={handleChange2}
                  required
                  type="email"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FontAwesomeIcon icon={faEnvelope} />
                      </InputAdornment>
                    ),
                  }}
                />
              </FormGroup>
              <FormGroup>
                <TextField
                  label="Password"
                  name="password"
                  value={offerValues.password}
                  type={showPassword ? "text" : "password"}
                  onChange={handleChange2}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FontAwesomeIcon icon={faLock} />
                      </InputAdornment>
                    ),
                    // Add the endAdornment for the password visibility toggle
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          edge="end"
                          onClick={handleTogglePasswordVisibility}
                          onMouseDown={(e) => e.preventDefault()} // Prevent focus change when clicking the toggle button
                        >
                          {showPassword ? (
                            <FontAwesomeIcon icon={faEyeSlash} />
                          ) : (
                            <FontAwesomeIcon icon={faEye} />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </FormGroup>
              <Grid item xs className="mb-2" style={{ float: "right" }}>
                <Link
                  href={`https://${userDashboard}/#/forgot-password`}
                  variant="body2"
                >
                  Forgot password?
                </Link>
              </Grid>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading} // Disable button when loading
              >
               {loading && <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />}
               {loading ? "Signing In..." : "Sign In"}
              </Button>

              <Grid container>
                <Grid item className="m-2">
                  <Link
                    href={`https://${userDashboard}/#/forgot-password`}
                    variant="body2"
                  >
                    {"Are you a new user? Sign Up"}
                  </Link>
                </Grid>
              </Grid>

              {/* <Box mt={2}>
                Or Sign in with :
                <Button fullWidth onClick={signInWith}>
                  <span style={{ fontSize: "x-large" }}>
                    {" "}
                    <FontAwesomeIcon icon={faGoogle} />
                  </span>
                </Button>
              </Box> */}
            </form>
          </div>
        </Container>
      </Modal>
      <Modal
        isOpen={showProfile}
        onRequestClose={handleModalClose}
        contentLabel="Login Modal"
        style={{
          content: {
            width: "100%", // Adjust the width as needed
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            position: "sticky",
            textAlign: "center",
          },
        }}
      >
        <button
          onClick={handleModalClose}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            fontSize: "24px",
            color: "#999",
          }}
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
        <div className="d-flex">
          <img
            src="https://dashboard.shopprop.com/assets/img/icons/avatar1.jpg"
            alt="User Profile"
            style={{ width: "80px", borderRadius: "50%" }}
          />
          <h1
            style={{
              margin: "1.5rem",
              color: "#333d79",
            }}
          >
            My Profile
          </h1>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            margin: "3rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "5px",
            }}
          >
            <FontAwesomeIcon
              icon={faEnvelope}
              style={{ fontSize: "18px", marginRight: "8px", color: "#f27474" }}
            />
            <span style={{ fontSize: "14px", color: "#2778c4" }}>Email ID</span>
          </div>
          <span
            style={{ fontSize: "16px", fontWeight: "bold", color: "#333d79" }}
          >
            {userInfo}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            margin: "3rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "5px",
            }}
          >
            <FontAwesomeIcon
              icon={faEnvelope}
              style={{ fontSize: "18px", marginRight: "8px", color: "#f27474" }}
            />
            <span style={{ fontSize: "14px", color: "#2778c4" }}>
              User Alias ID
            </span>
          </div>
          <span
            style={{ fontSize: "16px", fontWeight: "bold", color: "#333d79" }}
          >
            {userAliasID}
          </span>
        </div>
        <div style={{ background: "#dc3545" }}>
          <Button style={{ color: "white" }}>
            <a onClick={deleteAccount}>Delete Account</a>
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default LoginPopup;
