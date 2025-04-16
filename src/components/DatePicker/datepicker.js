import React, { useState, useRef, useEffect } from "react";
import "./datepicker.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarCheck,
  faChevronLeft,
  faChevronRight,
  faClock,
  faEnvelope,
  faEye,
  faEyeSlash,
  faLock,
} from "@fortawesome/free-solid-svg-icons";
import { json, Link } from "react-router-dom";
import apiModule from "../Api/apiModule";
import Modal from "react-modal";
import { Button, Container } from "react-bootstrap";
import {
  FormGroup,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@material-ui/core";
import Swal from "sweetalert2";
import { Amplify, Auth } from "aws-amplify";
import CircularProgress from "@mui/material/CircularProgress";
const DatePickerComponent = ({ propertyDetails }) => {
  const [dates, setDates] = useState([]);
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [selectedHour, setSelectedHour] = useState(8);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [hours, setHours] = useState([]);
  const [minutes, setMinutes] = useState([]);
  const hourScroll = useRef(null);
  const minuteScroll = useRef(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [offerValues, setOfferValues] = React.useState({
    password: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);

  const userJson = localStorage.getItem("userJson");

  // Parse the userJson if it exists
  const user = userJson ? JSON.parse(userJson) : null;

  // Access attributes from the user object
  const tenant_name = user?.tenant_name;
  const userDashboard = user ? user.user_auth_urls : null;

  if (user) {
    Amplify.configure({
      Auth: user.cognito,
    });
  }

  const generateDates = () => {
    const today = new Date();
    const newDates = [];
    for (let i = 0; i < 3; i++) {
      const date = new Date(today);

      date.setDate(today.getDate() + i); // Increment the day by i

      newDates.push(date);
    }

    setDates(newDates); // Update the dates state with the generated dates
  };

  const checkAndShiftDate = () => {
    const now = new Date();

    if (now.getHours() >= 21) {
      setDates((prevDates) => {
        const shiftedDates = prevDates.slice(1);

        const nextDate = new Date(shiftedDates[shiftedDates.length - 1]);
        nextDate.setDate(nextDate.getDate() + 1);

        return [...shiftedDates, nextDate];
      });
      setSelectedDateIndex(0);
    }
  };

  const generateTimes = () => {
    const startHour = 8;
    const endHour = 21;
    const newHours = [];
    const newMinutes = [];

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Generate available hours
    for (let hour = startHour; hour < endHour; hour++) {
      newHours.push(hour);
    }

    // Generate available minutes (in 15-minute increments)
    for (let minute = 0; minute < 60; minute += 15) {
      newMinutes.push(minute);
    }

    if (isTodaySelected()) {
      const filteredHours = newHours.filter(
        (hour) =>
          hour > currentHour ||
          (hour === currentHour &&
            newMinutes.some((minute) => minute > currentMinute))
      );
      setHours(filteredHours);
      setMinutes(newMinutes);
      if (
        selectedHour < currentHour ||
        (selectedHour === currentHour && selectedMinute <= currentMinute)
      ) {
        setSelectedHour(filteredHours[0]);
        setSelectedMinute(
          newMinutes.find((minute) => minute > currentMinute) || 0
        );
      }
    } else {
      setHours(newHours);
      setMinutes(newMinutes);
    }
  };

  // Check if today is selected
  const isTodaySelected = () => {
    const today = new Date();

    const selectedDate = dates[selectedDateIndex];

    return (
      selectedDate.getDate() === today.getDate() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getFullYear() === today.getFullYear()
    );
  };

  const scrollToSelected = () => {
    const hourIndex = hours.indexOf(selectedHour);
    const minuteIndex = minutes.indexOf(selectedMinute);

    if (hourScroll.current) {
      hourScroll.current.scrollTop = hourIndex * 40;
    }
    if (minuteScroll.current) {
      minuteScroll.current.scrollTop = minuteIndex * 40;
    }
  };

  const selectDate = (index) => {
    setSelectedDateIndex(index);
    generateTimes();
  };

  const adjustTime = (type, direction) => {
    if (type === "hour") {
      if (direction === "back" && selectedHour > hours[0]) {
        setSelectedHour(selectedHour - 1);
      } else if (
        direction === "forward" &&
        selectedHour < hours[hours.length - 1]
      ) {
        setSelectedHour(selectedHour + 1);
      }
    } else if (type === "minute") {
      if (direction === "back" && selectedMinute > minutes[0]) {
        setSelectedMinute(selectedMinute - 15);
      } else if (
        direction === "forward" &&
        selectedMinute < minutes[minutes.length - 1]
      ) {
        setSelectedMinute(selectedMinute + 15);
      }
    }
  };

  const nextDate = () => {
    const nextDate = new Date(dates[dates.length - 1]);
    nextDate.setDate(nextDate.getDate() + 1);
    setDates([...dates.slice(1), nextDate]);
    setSelectedDateIndex(0);
    generateTimes();
  };

  const previousDate = () => {
    const today = new Date();
    const previousDate = new Date(dates[0]);
    previousDate.setDate(previousDate.getDate() - 1);
    if (previousDate >= today) {
      setDates([previousDate, ...dates.slice(0, -1)]);
      setSelectedDateIndex(0);
      generateTimes();
    }
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleModalClose = () => {
    setShowPopup(false);
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleChange2 = (e) => {
    const { name, value } = e.target;
    setOfferValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const signIn = (user) => {
    console.log(Auth);
    return Auth.signIn(user.email, user.password);
  };

  const get_alias_id = async (email) => {
    const api = await apiModule;

    const response = await api.getUserAliasIdFromEmail(email);
    localStorage.setItem("userAliasID", response.UniqueAliasId);

    localStorage.setItem("userInfo", email);
  };

  const postCrossDomainMessage = (link, portal, data, IFrameId, login_type) => {
    let postURL;
    let iframeId;
    console.log(portal);
    console.log(link);
    console.log(data);
    console.log(IFrameId);
    console.log(login_type);

    if (portal) {
      postURL = "https://" + user?._auth_urls;
      iframeId = IFrameId;
    }
    const iframe = document.getElementById(iframeId);
    console.log(iframe);
    if (iframe == null) {
      return;
    }
    const iWindow = iframe.contentWindow;
    const storageData = { ...data, login_type: login_type };
    console.log(iWindow);
    console.log(storageData);
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
    e.preventDefault();
    setLoading(true);
    console.log(offerValues.email);
    console.log(offerValues.password);
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
        title: "Login Successfully",
        icon: "success",
        confirmButtonText: "Proceed",
      }).then((result) => {
        if (result.isConfirmed) {
          // Navigate to the specified URL
          window.location.reload();
        }
      });
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
          window.location.href = `/#/landing/tenant/${tenant_name}/property/${propertyDetails.property_descriptor.mls_name}/${propertyDetails.property_descriptor.id}`;
          setShowPopup(true);
        }
      });
    } finally {
      setLoading(false); // Stop spinner
    }
  };

  const onRequest = async (requestType) => {
    const selectedDate = dates[selectedDateIndex];
    const formattedDate = formatDate(selectedDate);
    const formattedDateTime = `${formattedDate}T${String(selectedHour).padStart(
      2,
      "0"
    )}:${String(selectedMinute).padStart(2, "0")}:00`;

    const userInfo = localStorage.getItem("userInfo");
    const userAliasID = localStorage.getItem("userAliasID");
    var url;

    if (userInfo && userAliasID) {
      const api = await apiModule;
      const response = await api.getLedgerDataFromPropertyIdAndAlias(
        propertyDetails.internal_unique_id
      );
      if (response?.data && response?.data[0]?.request_type === requestType) {
        return redirect_to_dashboard(
          requestType,
          response.data[0].ledger_item_id,
          formattedDateTime
        );
      } else {
        return redirect_to_dashboard(requestType, "", formattedDateTime);
      }
    } else {
      setShowPopup(true);
    }
  };

  const redirect_to_dashboard = (request_type, ledger_item_id, slot) => {
    let urlpath = "";
    let url = "";
    let base_url = userDashboard;

    if (ledger_item_id !== "") {
      var queryParams = {
        request_type: request_type,
        ledger_item_id: ledger_item_id,
        slot: slot,
      };

      const searchParams = new URLSearchParams(queryParams).toString();
      urlpath = `/main-forms/dynamic-forms?${searchParams}`;

      url = "https://" + base_url + "/#" + urlpath;
      console.log(url);
      window.open(url, "_blank");
    } else {
      let selectedProperty = {
        property_id:
          propertyDetails.property_descriptor.mls_name +
          "_" +
          propertyDetails.property_descriptor.id,
        property_address: propertyDetails?.address?.google_address,
        unit_number: propertyDetails?.address?.unit_number,
        city: propertyDetails?.address?.city,
        state: propertyDetails?.address?.state,
        zipcode: propertyDetails?.address?.zip_code,
      };

      if (request_type) {
        selectedProperty["request_type"] = request_type;
      }

      selectedProperty["user_id_alias"] = localStorage.getItem("userAliasID");
      selectedProperty["user_alias_email"] = localStorage.getItem("userInfo");
      selectedProperty["slot"] = slot;

      let extraObj = selectedProperty;

      selectedProperty["request_type"] = request_type;

      const searchParams = new URLSearchParams({ ...extraObj }).toString();
      urlpath = `/main-forms/dynamic-forms?${searchParams}`;

      url = "https://" + base_url + "/#" + urlpath;
      console.log(url);
      window.open(url, "_blank");
    }
  };

  useEffect(() => {
    generateDates();
  }, []);

  useEffect(() => {
    if (dates.length > 0) {
      generateTimes();
    }
  }, [dates]);

  useEffect(() => {
    checkAndShiftDate();

    scrollToSelected();
  }, []);

  return (
    <div className="date-picker-container">
      <div className="date-picker-header">
        <button className="btn" onClick={previousDate}>
          ❮
        </button>
        {dates.map((date, i) => (
          <button
            key={i}
            className={`date-button btn h-100 ${
              i === selectedDateIndex ? "selected-date" : ""
            }`}
            onClick={() => selectDate(i)}
          >
            <h4 className="m-0 fs-6 fw-bold">
              {date.toLocaleString("default", { month: "short" })}
            </h4>
            <h1 className="m-0 fs-1 fw-bold">{date.getDate()}</h1>
            <h4 className="m-0 fs-6 fw-bold">
              {date.toLocaleDateString("en-US", { weekday: "short" })}
            </h4>
          </button>
        ))}
        <button className="btn" onClick={nextDate}>
          ❯
        </button>
      </div>
      <div className="time-picker-container mt-3">
        <div className="time-display">
          <FontAwesomeIcon
            icon={faClock}
            className="font-size-x-large ml-2 visible-hide-content"
          ></FontAwesomeIcon>

          <button
            className="btn btn-direction"
            onClick={() => adjustTime("hour", "back")}
          >
            <FontAwesomeIcon icon={faChevronLeft}></FontAwesomeIcon>
          </button>

          <div className="time-column hour-selector">
            {hours.map((hour) => (
              <div
                key={hour}
                className={`time-value ${
                  hour === selectedHour ? "selected" : ""
                }`}
                onClick={() => setSelectedHour(hour)} // Select hour when clicked
              >
                {hour === selectedHour && (
                  <div>{String(hour).padStart(2, "0")}</div>
                )}
              </div>
            ))}
          </div>

          <button
            className="btn btn-direction"
            onClick={() => adjustTime("hour", "forward")}
          >
            <FontAwesomeIcon icon={faChevronRight}></FontAwesomeIcon>
          </button>

          <div className="separator">:</div>

          <button
            className="btn btn-direction"
            onClick={() => adjustTime("minute", "back")}
          >
            <FontAwesomeIcon icon={faChevronLeft}></FontAwesomeIcon>
          </button>

          <div className="time-column minute-selector">
            {minutes.map((minute) => (
              <div
                key={minute}
                className={`time-value ${
                  minute === selectedMinute ? "selected" : ""
                }`}
              >
                {minute === selectedMinute && (
                  <div>{String(minute).padStart(2, "0")}</div>
                )}
              </div>
            ))}
          </div>

          <button
            className="btn btn-direction"
            onClick={() => adjustTime("minute", "forward")}
          >
            {" "}
            <FontAwesomeIcon icon={faChevronRight}></FontAwesomeIcon>
          </button>

          <b>{selectedHour < 12 ? "A.M" : "P.M"}</b>
        </div>
      </div>

      <button
        className="btn btn-outline-primary my-2 p-2 text-center w-100 btn-new-top"
        onClick={() => onRequest("SCHEDULE_PROPERTY_VIEW")}
      >
        <FontAwesomeIcon icon={faCalendarCheck}></FontAwesomeIcon> Request
        Showing
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
              <form onSubmit={handleLogin} key={"SCHEDULE_PROPERTY_VIEW"}>
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
                  className="btn-new-top w-100"
                  sx={{ mt: 3, mb: 2 }}
                  disabled={loading} // Disable button when loading
                >
                  {loading && (
                    <CircularProgress
                      size={24}
                      color="inherit"
                      sx={{ mr: 1 }}
                    />
                  )}
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
      </button>
    </div>
  );
};

export default DatePickerComponent;
