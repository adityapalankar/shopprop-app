import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MLS from "../../assets/MLS.png";
import NoImage from "../../assets/No-image-available.jpeg";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Swal from "sweetalert2";
import {
  faEnvelope,
  faMapMarkerAlt,
  faCheckCircle,
  faTimesCircle,
  faPlay,
  faList,
  faClipboardList,
  faCalendarCheck,
  faFileArrowUp,
  faComments,
  faClipboardCheck,
  faPhoneVolume,
  faLock,
  faEye,
  faEyeSlash,
  faShare,
  faHeart as faSolidHeart,
  faBuilding,
  faCalendarAlt,
  faCar,
  faSwimmer,
  faSnowflake,
  faFireBurner,
  faDroplet,
  faWater,
  faBed,
  faBath,
  faBathtub,
  faShareAltSquare,
  faSquareArrowUpRight,
  faAreaChart,
  faClose,
  faListDots,
  faCircle,
  faPhotoFilm,
  faImage,
  faVideo,
  faArrowCircleLeft,
  faArrowLeft,
  faArrowLeftLong,
  faChevronLeft,
} from "@fortawesome/free-solid-svg-icons";
import { faHeart } from "@fortawesome/free-regular-svg-icons";
import Modal from "react-modal";
import { AddToCalendarButton } from "add-to-calendar-button-react";

import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import {
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  Typography,
  Select,
  MenuItem,
  TextField,
  FormControl,
  InputLabel,
  FormGroup,
  TextareaAutosize,
  Button,
} from "@material-ui/core";
import apiModule from "../Api/apiModule";
import Footer from "../Footer/footer";
import "./property-details.css";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import {
  FormControlLabel,
  Checkbox,
  Grid,
  Box,
  Container,
  IconButton,
  InputAdornment,
} from "@material-ui/core";
import "react-tabs/style/react-tabs.css";
import { Amplify, Auth } from "aws-amplify";
import { CognitoHostedUIIdentityProvider } from "@aws-amplify/auth";
import { GoogleLogin } from "react-google-login";
import NoProperty from "../../assets/no_property_details.png";
import {
  FacebookIcon,
  FacebookShareButton,
  LinkedinIcon,
  LinkedinShareButton,
  TwitterIcon,
  TwitterShareButton,
  WhatsappIcon,
  WhatsappShareButton,
} from "react-share";
import { ToastContainer, toast } from "react-toastify";
import LoginPopup from "../Login/login";
import DatePickerComponent from "../DatePicker/datepicker";
import Lightbox from "react-image-lightbox";
import "react-image-lightbox/style.css";
import { useNavigate } from "react-router-dom";
import { ArrowBack } from "@material-ui/icons";
import CircularProgress from "@mui/material/CircularProgress";

const PropertyDetails = () => {
  const { mls, descriptor } = useParams();
  const [propertyData, setPropertyData] = useState(null);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    countryCode: "+1",
    message: "",
    subject: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [offerValues, setOfferValues] = React.useState({
    password: "",
    email: "",
  });
  const [showPopup, setShowPopup] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [highlightBadges, sethighlightBadges] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [currentShareUrl, setCurrentShareUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const userJson = localStorage.getItem("userJson");

  // Parse the userJson if it exists
  const user = userJson ? JSON.parse(userJson) : null;

  // Access attributes from the user object
  const logo = user ? user.logo : null;
  const tenant_name = user?.tenant_name;
  const userDashboard = user ? user.user_auth_urls : null;

  const userInfo = localStorage.getItem("userInfo");
  const userAliasID = localStorage.getItem("userAliasID");

  const [showMore, setShowMore] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Assume user is not logged in by default
  const [showLoginPopup, setShowLoginPopup] = useState(false); // Modal visibility

  const [favoriteProperties, setFavoriteProperties] = useState(new Set());
  const [OpenHouseData, setOpenHouseData] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleContent = () => setIsExpanded(!isExpanded);

  const [isExpandedDetails, setIsExpandedDetails] = useState(false);

  const togglePropertyDetails = () => setIsExpandedDetails(!isExpandedDetails);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [BuyerRebate, setBuyerRebate] = useState(0);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const openVideoModal = () => setIsVideoModalOpen(true);
  const closeVideoModal = () => setIsVideoModalOpen(false);
  const navigate = useNavigate(); // Initialize navigation hook

  const openLightbox = (index, images) => {
    console.log(index);
    console.log(images[index]);
    if (index >= 0 && index < images.length) {
      setCurrentImageIndex(index);
      setIsLightboxOpen(true);
    }
  };

  const toggleShowMore = () => {
    setShowMore(!showMore);
  };

  const MAX_LENGTH = 150;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const api = await apiModule;

        const response = await api.getPropertyByMLS(mls, descriptor);
        console.log(response);
        setPropertyData(response);
        createHighlightBadges(response[0]);
        getOpenHouseData(mls, descriptor);
        if (response?.length > 0 && response[0].price.current) {
          calculateRebate(response[0]?.price?.current);
        }
      } catch (error) {
        console.error(error);
        throw error;
      }
    };

    fetchData();
  }, [mls, descriptor]);

  const filterUpcomingOpenHouseData = (data) => {
    const now = new Date(); // Get current date and time

    const filteredData = data.filter((item) => {
      const eventYear = parseInt(item.year, 10);
      const eventMonth = parseInt(item.month, 10) - 1; // Convert to 0-based index for JavaScript Date
      const eventDate = parseInt(item.date, 10);
      const eventEndTime = item.end_time * 1000; // Convert to milliseconds

      // Create event date object (year, month (0-based), day)
      const eventDateTime = new Date(eventYear, eventMonth, eventDate);

      // Check if the event's date and start_time are in the future
      return eventDateTime > now && eventEndTime > Date.now();
    });

    return filteredData;
  };

  const getOpenHouseData = async (mls, descriptor) => {
    const api = await apiModule;
    try {
      const openHouseData = await api.getOpenHouseData(mls, descriptor);

      const filteredData = filterUpcomingOpenHouseData(openHouseData);
      // Sort the data by start_time in ascending order (earliest first)
      // Filter duplicates and sort the data by start_time in ascending order
      const sortedAndFilteredOpenHouseData = filteredData
        .filter(
          (house, index, self) =>
            index ===
            self.findIndex(
              (h) =>
                h.start_time === house.start_time &&
                h.end_time === house.end_time
            )
        )
        .sort((a, b) => a.start_time - b.start_time);

      setOpenHouseData(sortedAndFilteredOpenHouseData);
      console.log(sortedAndFilteredOpenHouseData);
    } catch (err) {
      console.error("Error fetching favorites:", err);
    }
  };

  const getFavoriteProperties = async () => {
    const api = await apiModule;
    try {
      const favorites = await api.getFavorites();
      setFavoriteProperties(new Set(favorites));
    } catch (err) {
      console.error("Error fetching favorites:", err);
    }
  };
  const handleLoginStatusChange = (status) => {
    setIsLoggedIn(status); // Update login status after login
  };

  useEffect(() => {
    // During component mount, check the presence of userInfo and userAliasID in local storage.
    const userInfo = localStorage.getItem("userInfo");
    const userAliasID = localStorage.getItem("userAliasID");

    // If both userInfo and userAliasID are present, set the isLoggedIn state to true; otherwise, set it to false.
    setIsLoggedIn(!!userInfo && !!userAliasID);

    if (isLoggedIn) {
      console.log(isLoggedIn);
      getFavoriteProperties();
    }
  }, [isLoggedIn]);

  if (user) {
    Amplify.configure({
      Auth: user.cognito,
    });
  }

  const createHighlightBadges = (p) => {
    console.log(p);
    const highlightBadgesData = [];
    if (p?.property_type?.info) {
      highlightBadgesData.push({
        icon: faBuilding,
        label: p?.property_type?.info,
      });
    }
    if (p?.year_built) {
      highlightBadgesData.push({
        icon: faCalendarAlt,
        label: "Built in " + p?.year_built,
      });
    }
    if (p?.hoa?.per_month) {
      const hoaFees = Number.isInteger(p?.hoa.per_month)
        ? p?.hoa.per_month
        : p?.hoa.per_month.toFixed(2);
      highlightBadgesData.push({
        icon: faCalendarAlt,
        label: "HOA Fees $" + hoaFees + "/month",
      });
    }
    if (p?.garage?.count) {
      highlightBadgesData.push({
        icon: faCar,
        label: p?.garage?.count + " Garage Space",
      });
    }
    if (p?.pool?.value) {
      highlightBadgesData.push({
        icon: faSwimmer,
        label: "Has Pool",
      });
    }
    if (p?.cooling?.value) {
      highlightBadgesData.push({ icon: faSnowflake, label: "Has AC" });
    }
    if (p?.heating?.value) {
      highlightBadgesData.push({
        icon: faFireBurner,
        label: "Central Heating",
      });
    }
    if (p?.water_source?.value) {
      highlightBadgesData.push({
        icon: faDroplet,
        label: "Has Water Source",
      });
    }
    if (p?.water_front?.info) {
      highlightBadgesData.push({ icon: faWater, label: "Water Front" });
    }

    sethighlightBadges(highlightBadgesData);
  };

  const handleChange2 = (e) => {
    const { name, value } = e.target;
    setOfferValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const requestTypes = [
    {
      title: "Start an Offer",
      description: "Submit an offer made by the user",
      request_type: "MAKE_AN_OFFER",
      icon: faPlay,
    },

    {
      title: "Request Disclosure",
      description: "Request a disclosure",
      request_type: "REQUEST_DISCLOSURE",
      icon: faClipboardCheck,
    },

    {
      title: "Q & A",
      description: "Ask questions related to the property",
      request_type: "QA",
      icon: faComments,
    },
  ];

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

  const getRequestTypeURL = async (request, formattedTimeandDate = "") => {
    if (isLoggedIn) {
      const api = await apiModule;
      const response = await api.getLedgerDataFromPropertyIdAndAlias(
        propertyData[0].internal_unique_id
      );
      if (response?.data && response?.data[0]?.request_type === request) {
        return redirect_to_dashboard(
          request,
          response.data[0].ledger_item_id,
          formattedTimeandDate
        );
      } else {
        return redirect_to_dashboard(request, "", formattedTimeandDate);
      }
    } else {
      setShowPopup(true);
    }
  };

  const redirect_to_dashboard = (
    request_type,
    ledger_item_id,
    formattedTimeandDate = ""
  ) => {
    let urlpath = "";
    let url = "";
    let base_url = userDashboard;

    if (ledger_item_id !== "") {
      var queryParams = {
        request_type: request_type,
        ledger_item_id: ledger_item_id,
        slot: formattedTimeandDate,
      };

      const searchParams = new URLSearchParams(queryParams).toString();
      urlpath = `/main-forms/dynamic-forms?${searchParams}`;

      url = "https://" + base_url + "/#" + urlpath;
      console.log(url);
      window.open(url, "_blank");
    } else {
      let selectedProperty = {
        property_id: mls + "_" + descriptor,
        property_address: propertyData[0]?.address?.google_address,
        unit_number: propertyData[0]?.address?.unit_number,
        city: propertyData[0]?.address?.city,
        state: propertyData[0]?.address?.state,
        zipcode: propertyData[0]?.address?.zip_code,
      };

      if (request_type) {
        selectedProperty["request_type"] = request_type;
      }

      selectedProperty["user_id_alias"] = localStorage.getItem("userAliasID");
      selectedProperty["user_alias_email"] = localStorage.getItem("userInfo");
      selectedProperty["slot"] = formattedTimeandDate;
      let extraObj = selectedProperty;

      selectedProperty["request_type"] = request_type;

      const searchParams = new URLSearchParams({ ...extraObj }).toString();
      urlpath = `/main-forms/dynamic-forms?${searchParams}`;

      url = "https://" + base_url + "/#" + urlpath;
      console.log(searchParams);
      window.open(url, "_blank");
    }
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
          window.location.href = `/#/landing/tenant/${tenant_name}/property/${mls}/${descriptor}`;
          setShowPopup(true);
        }
      });
    } finally {
      setLoading(false); // Stop spinner
    }
  };

  async function signInWithGoogle(authObject) {
    // Configure Amplify with the given authObject
    Amplify.configure({
      Auth: authObject,
    });

    try {
      // Federated sign-in with Google
      await Auth.federatedSignIn({
        provider: CognitoHostedUIIdentityProvider.Google,
      });
    } catch (error) {
      console.log("Error signing in with Google:", error);
      throw error; // Rethrow the error to handle it in the calling function if needed.
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
    console.log("authObject --- ", authObject);

    try {
      await signInWithGoogle(authObject);
      // Successful sign-in handling (e.g., redirect or any other logic)
    } catch (error) {
      console.log(error);
      this.alert.showErrorAlertWithMessage("Unable to Login");
    }
  }

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleModalClose = () => {
    setShowPopup(false);
  };

  const showAlert = () => {
    Swal.fire({
      title: "Success",
      text: "Hey! We got your details, Will get back to you immediately",
      icon: "success",
      confirmButtonText: "OK",
      preConfirm: () => {
        // Refresh the page
        window.location.reload();
      },
    });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setContactForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const privateShowingSection = useRef(null);

  // Scroll to the referenced section when the button is clicked
  const handleScroll = () => {
    if (privateShowingSection.current) {
      privateShowingSection.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const contactFunction = async (e) => {
    e.preventDefault();

    // const url = `https://ch30e1uez8.execute-api.us-east-1.amazonaws.com/prod/Iam/tenant/${tenant_name}/Alias/user_email/${contactForm.email}`;
    try {
      const api = await apiModule;

      const response = await api.getUserAliasIdFromEmail(contactForm.email);

      // const response = await axios.get(url, {
      //   headers: requiredHeaders,
      // })
      // console.log(response.data);

      let prop_id = makeManualAddressData(
        e.target.elements.property_address?.value
      );
      console.log(prop_id);
      let payload = {
        ...contactForm,
        user_id_alias: response.UniqueAliasId,
        user_alias_email: e.target.elements.email?.value,
        request_type: "QA",
        property_id: tenant_name,
        property_address: "ALL",
        status_type: "active",
        tenant: tenant_name,
        DataAliasName: "test",
        DataAliasType: "private",
        parent_id: "test_parent",
        assigned_to: "test_alias",
        assignee_type: "test_user",
      };

      // const postUrl = `https://lsbm0an8i1.execute-api.us-east-1.amazonaws.com/prod/neuronService/priority`;
      // const postResponse = await axios.post(postUrl, payload, {
      //   headers: requiredHeaders,
      // })
      const postResponse = await api.postPriorityApi(payload);

      showAlert();

      console.log(postResponse);

      // return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const makeManualAddressData = (defaultPropertyAddress, defaultUnitNumber) => {
    let address = {
      property_address: defaultPropertyAddress,

      unit: defaultUnitNumber,
    };

    var hashtable = btoa(unescape(encodeURIComponent(JSON.stringify(address))));

    return hashtable;
  };

  // Replace with the desired city name
  const state = "WA"; // Replace with the desired state code

  const mapUrl = `https://www.greatschools.org/widget/map?textColor=0066B8&borderColor=FFCC66&width=400&height=450&zoom=13&state=${encodeURIComponent(
    state
  )}`;
  const settings = {
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    prevArrow: <div></div>,
    nextArrow: <div></div>,
  };

  const handleButtonClick = (request, url) => {
    if (userInfo && userAliasID) {
      window.location.href = url;
    } else {
      setSelectedRequest(request); // Set the selected request
      setShowPopup(true);
    }
  };

  const closeDialog = () => {
    setShowDialog(false);
    setCurrentShareUrl("");
  };

  const openDialog = (shareUrl) => {
    setCurrentShareUrl(shareUrl);
    setShowDialog(true);
  };

  const createOpenHouseRequest = (event) => {
    console.log(FormatDateandTime(event.start_time));
    const formattedDateTime = FormatDateandTime(event.start_time);
    getRequestTypeURL("SCHEDULE_PROPERTY_VIEW", formattedDateTime);
  };

  const handleFavourites = async (property) => {
    const api = await apiModule;
    const id = `${property.property_descriptor.mls_name}_${property.property_descriptor.id}`;
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

  function formatDate(epochTime) {
    const date = new Date(epochTime * 1000); // Convert epoch to milliseconds

    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "long" });
    const year = date.getFullYear();

    // Add ordinal suffix (st, nd, rd, th)
    const ordinal = (n) => {
      const s = ["th", "st", "nd", "rd"];
      const v = n % 100;
      return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };

    return ` ${month} ${ordinal(day)} ${year}`;
  }
  const markfavourite = (property) => {
    if (isLoggedIn) {
      handleFavourites(property); // Fetch favourite properties if logged in
    } else {
      console.log("showpopup");
      setShowLoginPopup(true);
      // Show login modal if not logged in
    }
  };

  const calculateRebate = async (price) => {
    const calcVal = parseInt(price) || 100000;
    const api = await apiModule;
    const response = await api.fetchBuyerRebateValues(calcVal, {
      homeInspection: 0,
      homeOffersApplied: 0,
      showings: 0,
    });

    setBuyerRebate(response.shopPropRebate);
  };

  const handleBackClick = () => {
    navigate(-1); // Go back to the previous page
  };

  // Format time to "HH:MM AM/PM" in America/New_York time zone
  const formatTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "America/Los_Angeles", // Set time zone to Eastern Time
    });
  };

  const formatTime12Hours = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "America/Los_Angeles", // Set time zone to Eastern Time
    });
  };
  const FormatDateandTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const options = {
      timeZone: "America/Los_Angeles",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    };
    const formattedDate = date
      .toLocaleString("en-GB", options)
      .replace(",", "");
    const [day, month, year, time] = formattedDate.split(/[/, ]/);
    return `${year}-${month}-${day}T${time}`;
  };

  // Function to format date to "25 Jan 2025"
  const FormatDate = (day, month, year) => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${day} ${months[parseInt(month) - 1]} ${year}`;
  };

  return (
    <div>
      <div className="property-header">
        <button className="back-button" onClick={handleBackClick}>
          <FontAwesomeIcon icon={faChevronLeft}></FontAwesomeIcon>
        </button>
        <div>
          <img className="logo-property" src={logo} alt="Logo" />
        </div>
      </div>

      {propertyData && propertyData.length > 0 ? (
        <div className="property-details">
          <div className="button-container">
            <button
              className="border-0 px-2 p-1 button-top-status"
              style={{
                borderRadius: "5px",

                backgroundColor:
                  propertyData[0]?.status.value === "SALE" ? "green" : "red",
                color: "white",
              }}
            >
              <span>
                {propertyData[0]?.status.value === "SALE"
                  ? "Active"
                  : propertyData[0]?.status.info}
              </span>
            </button>
            {OpenHouseData.length > 0 && (
              <button
                className="border-0 px-2 p-1 button-top-status"
                style={{
                  borderRadius: "5px",
                  left: "20%",
                  backgroundColor: "orange",
                  color: "white",
                }}
              >
                <span>Open House</span>
              </button>
            )}

            <button
              className="button-top-share"
              onClick={(event) => {
                event.stopPropagation();
                openDialog(
                  `https://www.shopprop.com/#/search/property/${propertyData[0].property_descriptor.mls_name}/${propertyData[0].property_descriptor.id}`
                );
              }}
            >
              <FontAwesomeIcon icon={faShare} />
            </button>

            <button
              className="button-top-fav"
              onClick={(event) => {
                event.stopPropagation();
                markfavourite(propertyData[0]);
              }}
            >
              <FontAwesomeIcon
                icon={
                  favoriteProperties.has(
                    `${propertyData[0].property_descriptor.mls_name}_${propertyData[0].property_descriptor.id}`
                  )
                    ? faSolidHeart
                    : faHeart
                }
                style={{
                  color: favoriteProperties.has(
                    `${propertyData[0].property_descriptor.mls_name}_${propertyData[0].property_descriptor.id}`
                  )
                    ? "#0e5eaa"
                    : "black",
                }}
              />
            </button>
            <div className="modal-btn">
              {propertyData[0]?.virtual_url &&
                propertyData[0]?.virtual_url?.length > 0 && (
                  <button
                    className="button-bottom-modal"
                    onClick={openVideoModal}
                  >
                    <FontAwesomeIcon icon={faVideo}></FontAwesomeIcon> Virtual
                    Tour
                  </button>
                )}
              <button className="button-bottom-modal" onClick={openModal}>
                <FontAwesomeIcon icon={faImage}></FontAwesomeIcon>{" "}
                {propertyData[0]?.image_url?.length || 0} Photos
              </button>
            </div>
          </div>

          <Modal
            isOpen={isVideoModalOpen}
            onRequestClose={closeVideoModal}
            contentLabel="Image Gallery"
            className="image-modal"
            overlayClassName="overlay"
          >
            <button className="close-modal" onClick={closeVideoModal}>
              <FontAwesomeIcon icon={faClose}></FontAwesomeIcon>
            </button>
            <div className="image-gallery">
              {propertyData[0]?.virtual_url?.length > 0 ? (
                <div className="image-container">
                  <iframe
                    src={
                      propertyData[0].virtual_url[
                        propertyData[0].virtual_url.length - 1
                      ]?.includes("vimeo.com") &&
                      !propertyData[0].virtual_url[
                        propertyData[0].virtual_url.length - 1
                      ]?.includes("player.vimeo.com")
                        ? `https://player.vimeo.com/video/${propertyData[0].virtual_url[
                            propertyData[0].virtual_url.length - 1
                          ]
                            ?.split("/")
                            .pop()}?autoplay=1`
                        : propertyData[0].virtual_url[
                            propertyData[0].virtual_url.length - 1
                          ]
                    }
                    title="Latest Virtual Tour"
                    width="100%"
                    height="400px"
                    frameBorder="0"
                    allow="autoplay; fullscreen"
                    allowFullScreen
                  ></iframe>
                </div>
              ) : (
                <p>No videos available</p>
              )}
            </div>
          </Modal>

          <Modal
            isOpen={isModalOpen}
            onRequestClose={closeModal}
            contentLabel="Image Gallery"
            className="image-modal"
            overlayClassName="overlay"
          >
            <button className="close-modal" onClick={closeModal}>
              <FontAwesomeIcon icon={faClose}></FontAwesomeIcon>
            </button>
            <div className="image-gallery">
              {propertyData[0].image_url.length > 0 ? (
                propertyData[0].image_url.map((imageUrl, index) => (
                  <div key={index} className="image-container">
                    <img
                      src={imageUrl}
                      alt={`Property Image ${index + 1}`}
                      className="thumbnail-image"
                      loading="lazy"
                      onClick={() =>
                        openLightbox(index, propertyData[0].image_url)
                      } // Open Lightbox on click
                      onError={(e) => (e.target.src = { NoImage })}
                    />
                  </div>
                ))
              ) : (
                <p>No images available</p>
              )}
            </div>
          </Modal>

          {/* Lightbox for fullscreen view */}
          {isLightboxOpen && propertyData[0].image_url.length > 0 && (
            <Lightbox
              mainSrc={propertyData[0].image_url[currentImageIndex]}
              nextSrc={
                propertyData[0].image_url[
                  (currentImageIndex + 1) % propertyData[0].image_url.length
                ]
              }
              prevSrc={
                propertyData[0].image_url[
                  (currentImageIndex + propertyData[0].image_url.length - 1) %
                    propertyData[0].image_url.length
                ]
              }
              onCloseRequest={() => setIsLightboxOpen(false)}
              onMovePrevRequest={() =>
                setCurrentImageIndex(
                  (currentImageIndex + propertyData[0].image_url.length - 1) %
                    propertyData[0].image_url.length
                )
              }
              onMoveNextRequest={() =>
                setCurrentImageIndex(
                  (currentImageIndex + 1) % propertyData[0].image_url.length
                )
              }
            />
          )}
          <Slider {...settings}>
            {propertyData && propertyData.length > 0 ? (
              propertyData[0]?.image_url &&
              propertyData[0]?.image_url.length > 0 ? (
                propertyData[0].image_url.map((imageUrl, index) => (
                  <div key={index} className="image-wrapper">
                    <img
                      src={imageUrl}
                      alt={`Property Image ${index + 1}`}
                      className="responsive-image"
                    />
                  </div>
                ))
              ) : (
                <div>
                  <img
                    src={NoImage}
                    alt="No images available"
                    className="responsive-image"
                  />
                </div>
              )
            ) : (
              <p>No property data available</p>
            )}
          </Slider>
         
          <div className="property-info">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h1 className="price">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(propertyData[0]?.price?.current)}
              </h1>
              {BuyerRebate > 0 && (
                <div class=" btn-new-top text-center ">
                  <h5 className="m-0 fw-bold">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(BuyerRebate)}
                  </h5>
                  <p style={{ fontSize: "10px" }} className="m-0">
                    ShopProp Est. Buyer Rebate
                  </p>
                </div>
              )}
            </div>
            <div className="first-line">
              <p className="paras">
                <FontAwesomeIcon icon={faBed}></FontAwesomeIcon>{" "}
                {propertyData[0]?.bedroom.count || "N/A"} Beds
              </p>
              <p className="paras">
                <FontAwesomeIcon icon={faBathtub}></FontAwesomeIcon>{" "}
                {propertyData[0]?.bathroom.count || "N/A"} Baths
              </p>
              <p className="paras">
                {" "}
                <FontAwesomeIcon icon={faAreaChart}></FontAwesomeIcon>{" "}
                {propertyData[0]?.area?.lot} Sqft
              </p>
            </div>

            <p className="address">
              {propertyData[0]?.address?.google_address}
            </p>

            <div className="condo-amenities mt-4">
              {highlightBadges.map((item, index) => (
                <div key={index} className="amenity btn highlight-points-bg">
                  <FontAwesomeIcon icon={item.icon}></FontAwesomeIcon>
                  {item.label}
                </div>
              ))}
            </div>
            <div>
              <h1 className="description-heading">About this home</h1>
              <div className="description-container">
                <p className="description">
                  {showMore
                    ? propertyData[0]?.description
                    : `${propertyData[0]?.description?.slice(
                        0,
                        MAX_LENGTH
                      )}...`}
                </p>
                {propertyData[0]?.description?.length > MAX_LENGTH && (
                  <button className="toggle-button" onClick={toggleShowMore}>
                    {showMore ? "Show Less" : "Show More"}
                  </button>
                )}
              </div>

              <ToastContainer position="top-right" autoClose={3000} limit={1} />

              <div className="courtesy-info mt-3">
                <p className="description-small">
                  Listing updated:
                  {formatDate(propertyData[0].last_updated_time)}
                </p>
                <p className="description-small">
                  Listed by: {propertyData[0].listing_agent?.fname},
                  {propertyData[0].listing_agent?.listing_company_name}
                </p>

                <p className="description-small">
                {propertyData[0].sold_info?.fname &&
              propertyData[0].sold_info?.listing_company_name
                ? " Bought with " +
                  propertyData[0].sold_info.listing_company_name +
                  "."
                : ""}
                </p>
                <p className="description-small">
                  Source: {propertyData[0].property_mls_name}, #
                  {propertyData[0].property_id}
                  <img style={{ width: "2rem" }} src={MLS} alt="Image" />
                </p>
              </div>
            </div>

            <div
              className="card px-2 mt-3 py-3 mb-3 width-100"
              ref={privateShowingSection}
            >
              {/* Date Picker */}
              <DatePickerComponent propertyDetails={propertyData[0]} />

              {/* OR Section */}
              <h3 className="text-center py-2">
                <hr className="m-0" />
                OR
                <hr className="m-0" />
              </h3>

              {/* Request Type Buttons */}
              {requestTypes.map((request, index) => (
                <div
                  key={index}
                  className="btn-new-top-filters my-2 p-2 text-center w-100"
                  onClick={() => getRequestTypeURL(request)}
                >
                  <FontAwesomeIcon
                    icon={request.icon}
                    className="mr-2"
                  ></FontAwesomeIcon>{" "}
                  {request.title}
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
                          <Grid
                            item
                            xs
                            className="mb-2"
                            style={{ float: "right" }}
                          >
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
                </div>
              ))}
            </div>

            <h1 className="description-heading">Property Details</h1>
            <div>
              <div className="px-3">
                <h1 className="more-details">Area</h1>
                <div className="px-3">
                  <li>
                    <span className="property-id">Finished:</span>
                    <span className="property-value">
                      {propertyData[0]?.area.finished}{" "}
                      {propertyData[0]?.area.extra.LotSizeUnits}
                    </span>
                  </li>
                  <li>
                    <span className="property-id">Lot Area :</span>
                    <span className="property-value">
                      {propertyData[0]?.area.lot}{" "}
                      {propertyData[0]?.area.extra.LotSizeUnits}
                    </span>
                  </li>

                  <li>
                    <span className="property-id">
                      Square Footage Unfinished :
                    </span>
                    <span className="property-value">
                      {propertyData[0]?.area.extra.NWM_SquareFootageUnfinished}
                    </span>
                  </li>
                  <li>
                    <span className="property-id">Building Area Total :</span>
                    <span className="property-value">
                      {propertyData[0]?.area.extra.BuildingAreaTotal}
                    </span>
                  </li>

                  <li>
                    <span className="property-id">
                      Square Footage Finished :
                    </span>
                    <span className="property-value">
                      {propertyData[0]?.area.extra.NWM_SquareFootageFinished}
                    </span>
                  </li>
                </div>
              </div>
              <br />
              <div className="px-3">
                <h1 className="more-details">Basement</h1>
                <div className="px-3">
                  <li>
                    <span className="property-id">Info:</span>
                    <span className="property-value">
                      {propertyData[0]?.basement?.info || "N/A"}
                    </span>
                  </li>
                </div>
              </div>
              <br />
              <div className="px-3">
                <h1 className="more-details">Bathroom</h1>
                <div className="px-3">
                  <li>
                    <span className="property-id">Total Count :</span>
                    <span className="property-value">
                      {propertyData[0]?.bathroom?.count}
                    </span>
                  </li>
                  <li>
                    <span className="property-id">Baths Full Upper :</span>
                    <span className="property-value">
                      {propertyData[0]?.bathroom.subcounts.NWM_BathsFullUpper}
                    </span>
                  </li>
                  <li>
                    <span className="property-id">
                      Baths Three Quarter Upper:
                    </span>
                    <span className="property-value">
                      {
                        propertyData[0]?.bathroom.subcounts
                          .NWM_BathsThreeQuarterUpper
                      }
                    </span>
                  </li>
                  <li>
                    <span className="property-id">Bathrooms :</span>
                    <span className="property-value">
                      {propertyData[0]?.bathroom?.subcounts.NWM_Bathrooms}
                    </span>
                  </li>
                </div>
              </div>
              <br />
              {isExpandedDetails && (
                <div className="px-3">
                  <h1 className="more-details">Bedroom</h1>
                  <div className="px-3">
                    <li>
                      <span className="property-id">Total Count :</span>
                      <span className="property-value">
                        {propertyData[0]?.bedroom?.count}
                      </span>
                    </li>
                    <li>
                      <span className="property-id">Bedrooms Upper :</span>
                      <span className="property-value">
                        {propertyData[0]?.bedroom?.subcounts.NWM_BedroomsUpper}
                      </span>
                    </li>
                  </div>
                  <br />
                  <h1 className="more-details">Dates</h1>
                  <div className="px-3">
                    <li>
                      <span className="property-id">
                        Photos Change Timestamp :
                      </span>
                      <span className="property-value">
                        {propertyData[0]?.dates.extra.PhotosChangeTimestamp}
                      </span>
                    </li>
                    <li>
                      <span className="property-id">
                        Estimated Completion Date :
                      </span>
                      <span className="property-value">
                        {propertyData[0]?.dates.extra.NWM_OffersReviewDate}
                      </span>
                    </li>
                    <li>
                      <span className="property-id">
                        Contract Status Change Date :
                      </span>
                      <span className="property-value">
                        {propertyData[0]?.dates.extra.ContractStatusChangeDate}
                      </span>
                    </li>
                    <li>
                      <span className="property-id">Tax Year :</span>
                      <span className="property-value">
                        {propertyData[0]?.dates.extra.TaxYear}
                      </span>
                    </li>
                    <li>
                      <span className="property-id">
                        Originating System Modification Timestamp :
                      </span>
                      <span className="property-value">
                        {
                          propertyData[0]?.dates.extra
                            .OriginatingSystemModificationTimestamp
                        }
                      </span>
                    </li>
                  </div>
                  <br />
                  <h1 className="more-details">Flooring</h1>
                  <div className="px-3">
                    <li>
                      <span className="property-id">Flooring :</span>
                      <span className="property-value">
                        {propertyData[0]?.flooring.flooring}
                      </span>
                    </li>
                  </div>
                  <br />
                  <h1 className="more-details">Garage</h1>
                  <div className="px-3">
                    <li>
                      <span className="property-id">Closed :</span>
                      <span className="property-value">
                        {propertyData[0]?.garage.closed}
                      </span>
                    </li>
                    <li>
                      <span className="property-id">Attached :</span>
                      <span className="property-value">
                        {propertyData[0]?.garage.attached}
                      </span>
                    </li>
                    <li>
                      <span className="property-id">Count :</span>
                      <span className="property-value">
                        {propertyData[0]?.garage.count}
                      </span>
                    </li>
                    <li>
                      <span className="property-id">Garage Y/N :</span>
                      <span className="property-value">
                        {propertyData[0]?.garage.extra.GarageYN}
                      </span>
                    </li>
                  </div>
                  <br />
                  <h1 className="more-details">HOA</h1>
                  <div className="px-3">
                    <li>
                      <span className="property-id">Fees :</span>
                      <span className="property-value">
                        {propertyData[0]?.hoa?.fees || "N/A"}
                      </span>
                    </li>
                    <li>
                      <span className="property-id">Per month :</span>
                      <span className="property-value">
                        {propertyData[0]?.hoa?.per_month || "N/A"}
                      </span>
                    </li>
                    <li>
                      <span className="property-id">Association Y/N :</span>
                      <span className="property-value">
                        {propertyData[0]?.hoa?.extra.AssociationYN || "N/A"}
                      </span>
                    </li>
                  </div>
                  <br />
                  <h1 className="more-details">Listing Agent</h1>
                  <div className="px-3">
                    <li>
                      <span className="property-id">Id :</span>
                      <span className="property-value">
                        {propertyData[0]?.listing_agent?.id || "N/A"}
                      </span>
                    </li>
                    <li>
                      <span className="property-id">First Name :</span>
                      <span className="property-value">
                        {propertyData[0]?.listing_agent?.fname || "N/A"}
                      </span>
                    </li>
                    <li>
                      <span className="property-id">Office Name :</span>
                      <span className="property-value">
                        {propertyData[0]?.listing_agent?.o_name || "N/A"}
                      </span>
                    </li>{" "}
                    <li>
                      <span className="property-id">Office MLS ID :</span>
                      <span className="property-value">
                        {propertyData[0]?.listing_agent?.o_mls_id || "N/A"}
                      </span>
                    </li>{" "}
                    <li>
                      <span className="property-id">Company Name :</span>
                      <span className="property-value">
                        {propertyData[0]?.listing_agent?.listing_company_name ||
                          "N/A"}
                      </span>
                    </li>{" "}
                    <li>
                      <span className="property-id">Phone Number :</span>
                      <span className="property-value">
                        {propertyData[0]?.listing_agent?.phone_number || "N/A"}
                      </span>
                    </li>{" "}
                    <li>
                      <span className="property-id">List Office Key:</span>
                      <span className="property-value">
                        {propertyData[0]?.listing_agent?.listing_company_details
                          .ListOfficeKey || "N/A"}
                      </span>
                    </li>{" "}
                    <li>
                      <span className="property-id">Listing Key Numeric :</span>
                      <span className="property-value">
                        {propertyData[0]?.listing_agent?.listing_company_details
                          .ListingKeyNumeric || "N/A"}
                      </span>
                    </li>{" "}
                    <li>
                      <span className="property-id">
                        Listing Contract Date :
                      </span>
                      <span className="property-value">
                        {propertyData[0]?.listing_agent?.listing_company_details
                          .ListingContractDate || "N/A"}
                      </span>
                    </li>
                    <li>
                      <span className="property-id">Listing Terms :</span>
                      <span className="property-value">
                        {propertyData[0]?.listing_agent?.listing_company_details
                          .ListingTerms || "N/A"}
                      </span>
                    </li>{" "}
                    <li>
                      <span className="property-id">List Agent Key :</span>
                      <span className="property-value">
                        {propertyData[0]?.listing_agent?.listing_company_details
                          .ListAgentKey || "N/A"}
                      </span>
                    </li>
                    <li>
                      <span className="property-id">
                        List Agent Key Numeric :
                      </span>
                      <span className="property-value">
                        {propertyData[0]?.listing_agent?.listing_company_details
                          .ListAgentKeyNumeric || "N/A"}
                      </span>
                    </li>{" "}
                    <li>
                      <span className="property-id">
                        Originating System Name :
                      </span>
                      <span className="property-value">
                        {propertyData[0]?.listing_agent?.listing_company_details
                          .OriginatingSystemName || "N/A"}
                      </span>
                    </li>{" "}
                    <li>
                      <span className="property-id">List Office Phone :</span>
                      <span className="property-value">
                        {propertyData[0]?.listing_agent?.listing_company_details
                          .ListOfficePhone || "N/A"}
                      </span>
                    </li>
                    <li>
                      <span className="property-id">
                        List Office Key Numeric :
                      </span>
                      <span className="property-value">
                        {propertyData[0]?.listing_agent?.listing_company_details
                          .ListOfficeKeyNumeric || "N/A"}
                      </span>
                    </li>
                  </div>
                  <br />
                  <h1 className="more-details">Miscellaneous</h1>
                  <div className="px-3">
                    <li>
                      <span className="property-id"> Number Of Showers :</span>
                      <span className="property-value">
                        {propertyData[0]?.misc?.NWM_NumberOfShowers || "N/A"}
                      </span>
                    </li>
                    <li>
                      <span className="property-id">Water Heater Type :</span>
                      <span className="property-value">
                        {propertyData[0]?.misc?.NWM_WaterHeaterType || "N/A"}
                      </span>
                    </li>{" "}
                    <li>
                      <span className="property-id">
                        Power Production Type :
                      </span>
                      <span className="property-value">
                        {propertyData[0]?.misc?.PowerProductionType || "N/A"}
                      </span>
                    </li>{" "}
                    <li>
                      <span className="property-id">
                        {" "}
                        Internet Address Display Y/N :
                      </span>
                      <span className="property-value">
                        {propertyData[0]?.misc?.InternetAddressDisplayYN ||
                          "N/A"}
                      </span>
                    </li>{" "}
                    <li>
                      <span className="property-id">Seller Disclosure :</span>
                      <span className="property-value">
                        {propertyData[0]?.misc?.NWM_SellerDisclosure || "N/A"}
                      </span>
                    </li>{" "}
                    <li>
                      <span className="property-id">
                        {" "}
                        First Right Of Refusal :
                      </span>
                      <span className="property-value">
                        {propertyData[0]?.misc?.NWM_FirstRightOfRefusal ||
                          "N/A"}
                      </span>
                    </li>{" "}
                    <li>
                      <span className="property-id"> Show Map Link :</span>
                      <span className="property-value">
                        {propertyData[0]?.misc?.NWM_ShowMapLink || "N/A"}
                      </span>
                    </li>{" "}
                    <li>
                      <span className="property-id">
                        Water Heater Location :
                      </span>
                      <span className="property-value">
                        {propertyData[0]?.misc?.NWM_WaterHeaterLocation ||
                          "N/A"}
                      </span>
                    </li>
                    <li>
                      <span className="property-id">
                        {" "}
                        M L S Square Footage Source :
                      </span>
                      <span className="property-value">
                        {propertyData[0]?.misc?.NWM_MLSSquareFootageSource ||
                          "N/A"}
                      </span>
                    </li>{" "}
                    <li>
                      <span className="property-id"> Mls Status :</span>
                      <span className="property-value">
                        {propertyData[0]?.misc?.MlsStatus || "N/A"}
                      </span>
                    </li>{" "}
                    <li>
                      <span className="property-id">Topography :</span>
                      <span className="property-value">
                        {propertyData[0]?.misc?.Topography || "N/A"}
                      </span>
                    </li>{" "}
                    <li>
                      <span className="property-id">Style Code :</span>
                      <span className="property-value">
                        {propertyData[0]?.misc?.NWM_StyleCode || "N/A"}
                      </span>
                    </li>{" "}
                    <li>
                      <span className="property-id"> Photos Count :</span>
                      <span className="property-value">
                        {propertyData[0]?.misc?.PhotosCount || "N/A"}
                      </span>
                    </li>{" "}
                    <li>
                      <span className="property-id">Community Features :</span>
                      <span className="property-value">
                        {propertyData[0]?.misc?.CommunityFeatures || "N/A"}
                      </span>
                    </li>{" "}
                    <li>
                      <span className="property-id">
                        New Construction Y/N :
                      </span>
                      <span className="property-value">
                        {propertyData[0]?.misc?.NewConstructionYN || "N/A"}
                      </span>
                    </li>{" "}
                    <li>
                      <span className="property-id">Listing Key :</span>
                      <span className="property-value">
                        {propertyData[0]?.misc?.ListingKey || "N/A"}
                      </span>
                    </li>
                    <li>
                      <span className="property-id">DPR Y/N:</span>
                      <span className="property-value">
                        {propertyData[0]?.misc?.NWM_DPRYN || "N/A"}
                      </span>
                    </li>
                    <li>
                      <span className="property-id">
                        Senior Community Y/N :
                      </span>
                      <span className="property-value">
                        {propertyData[0]?.misc?.SeniorCommunityYN || "N/A"}
                      </span>
                    </li>
                    <li>
                      <span className="property-id">Cooling :</span>
                      <span className="property-value">
                        {propertyData[0]?.misc?.Cooling || "N/A"}
                      </span>
                    </li>
                    <li>
                      <span className="property-id">Water Access :</span>
                      <span className="property-value">
                        {propertyData[0]?.misc?.NWM_WaterAccess || "N/A"}
                      </span>
                    </li>
                    <li>
                      <span className="property-id">Senior Exemption:</span>
                      <span className="property-value">
                        {propertyData[0]?.misc?.NWM_SeniorExemption || "N/A"}
                      </span>
                    </li>
                    <li>
                      <span className="property-id">Mlg Can Use :</span>
                      <span className="property-value">
                        {propertyData[0]?.misc?.MlgCanUse || "N/A"}
                      </span>
                    </li>
                    <li>
                      <span className="property-id"> Title Company :</span>
                      <span className="property-value">
                        {propertyData[0]?.misc?.NWM_TitleCompany || "N/A"}
                      </span>
                    </li>
                    <li>
                      <span className="property-id">
                        Internet Entire Listing Display Y/N:
                      </span>
                      <span className="property-value">
                        {propertyData[0]?.misc
                          ?.InternetEntireListingDisplayYN || "N/A"}
                      </span>
                    </li>
                    <li>
                      <span className="property-id">Covered Spaces :</span>
                      <span className="property-value">
                        {propertyData[0]?.misc?.CoveredSpaces || "N/A"}
                      </span>
                    </li>
                    <li>
                      <span className="property-id"> F I R P T A Y N :</span>
                      <span className="property-value">
                        {propertyData[0]?.misc?.NWM_FIRPTAYN || "N/A"}
                      </span>
                    </li>
                    <li>
                      <span className="property-id">
                        {" "}
                        Internet Automated Valuation Display Y N :
                      </span>
                      <span className="property-value">
                        {propertyData[0]?.misc
                          ?.InternetAutomatedValuationDisplayYN || "N/A"}
                      </span>
                    </li>{" "}
                    <li>
                      <span className="property-id"> Vegetation :</span>
                      <span className="property-value">
                        {propertyData[0]?.misc?.Vegetation || "N/A"}
                      </span>
                    </li>{" "}
                    <li>
                      <span className="property-id">
                        {" "}
                        Irrigation Water Rights Y N :
                      </span>
                      <span className="property-value">
                        {propertyData[0]?.misc?.IrrigationWaterRightsYN ||
                          "N/A"}
                      </span>
                    </li>{" "}
                    <li>
                      <span className="property-id">Country :</span>
                      <span className="property-value">
                        {propertyData[0]?.misc?.Country || "N/A"}
                      </span>
                    </li>{" "}
                    <li>
                      <span className="property-id"> Carport Y N :</span>
                      <span className="property-value">
                        {propertyData[0]?.misc?.CarportYN || "N/A"}
                      </span>
                    </li>{" "}
                    <li>
                      <span className="property-id">
                        {" "}
                        Building Information :
                      </span>
                      <span className="property-value">
                        {propertyData[0]?.misc?.NWM_BuildingInformation ||
                          "N/A"}
                      </span>
                    </li>{" "}
                    <li>
                      <span className="property-id"> Direction Faces :</span>
                      <span className="property-value">
                        {propertyData[0]?.misc?.DirectionFace || "N/A"}
                      </span>
                    </li>
                    <li>
                      <span className="property-id"> Building Name :</span>
                      <span className="property-value">
                        {propertyData[0]?.misc?.BuildingName || "N/A"}
                      </span>
                    </li>{" "}
                    <li>
                      <span className="property-id"> Source System Name :</span>
                      <span className="property-value">
                        {propertyData[0]?.misc?.SourceSystemName || "N/A"}
                      </span>
                    </li>{" "}
                    <li>
                      <span className="property-id">Lot Features:</span>
                      <span className="property-value">
                        {propertyData[0]?.misc?.LotFeatures || "N/A"}
                      </span>
                    </li>{" "}
                    <li>
                      <span className="property-id">
                        Short Term Rental Y/N :
                      </span>
                      <span className="property-value">
                        {propertyData[0]?.misc?.NWM_ShortTermRentalYN || "N/A"}
                      </span>
                    </li>{" "}
                    <li>
                      <span className="property-id">
                        {" "}
                        Preliminary Title Ordered :
                      </span>
                      <span className="property-value">
                        {propertyData[0]?.misc?.NWM_PreliminaryTitleOrdered ||
                          "N/A"}
                      </span>
                    </li>{" "}
                    <li>
                      <span className="property-id">Energy Source :</span>
                      <span className="property-value">
                        {propertyData[0]?.misc?.NWM_EnergySource || "N/A"}
                      </span>
                    </li>{" "}
                    <li>
                      <span className="property-id">Sewer Company:</span>
                      <span className="property-value">
                        {propertyData[0]?.misc?.NWM_SewerCompany || "N/A"}
                      </span>
                    </li>{" "}
                    <li>
                      <span className="property-id">Roof :</span>
                      <span className="property-value">
                        {propertyData[0]?.misc?.Roof || "N/A"}
                      </span>
                    </li>
                    <li>
                      <span className="property-id">Entry Location :</span>
                      <span className="property-value">
                        {propertyData[0]?.misc?.EntryLocation || "N/A"}
                      </span>
                    </li>
                    <li>
                      <span className="property-id">
                        Third Party Approval :
                      </span>
                      <span className="property-value">
                        {propertyData[0]?.misc?.NWM_ThirdPartyApproval || "N/A"}
                      </span>
                    </li>
                    <li>
                      <span className="property-id">Offers :</span>
                      <span className="property-value">
                        {propertyData[0]?.misc?.NWM_Offers || "N/A"}
                      </span>
                    </li>
                    <li>
                      <span className="property-id">Power Company :</span>
                      <span className="property-value">
                        {propertyData[0]?.misc?.NWM_PowerCompany || "N/A"}
                      </span>
                    </li>
                    <li>
                      <span className="property-id">Parcel Number :</span>
                      <span className="property-value">
                        {propertyData[0]?.misc?.ParcelNumber || "N/A"}
                      </span>
                    </li>
                    <li>
                      <span className="property-id">Living Area :</span>
                      <span className="property-value">
                        {propertyData[0]?.misc?.LivingArea || "N/A"}
                      </span>
                    </li>
                    <li>
                      <span className="property-id">
                        Cumulative Days On Market :
                      </span>
                      <span className="property-value">
                        {propertyData[0]?.misc?.CumulativeDaysOnMarket || "N/A"}
                      </span>
                    </li>
                    <li>
                      <span className="property-id"> Sale Type :</span>
                      <span className="property-value">
                        {propertyData[0]?.misc?.NWM_SaleType || "N/A"}
                      </span>
                    </li>
                    <li>
                      <span className="property-id">Foundation Details :</span>
                      <span className="property-value">
                        {propertyData[0]?.misc?.FoundationDetails || "N/A"}
                      </span>
                    </li>
                    <li>
                      <span className="property-id">
                        Internet Consumer Comment Y/N :
                      </span>
                      <span className="property-value">
                        {propertyData[0]?.misc?.InternetConsumerCommentYN ||
                          "N/A"}
                      </span>
                    </li>
                    <li>
                      <span className="property-id">Sewer :</span>
                      <span className="property-value">
                        {propertyData[0]?.misc?.Sewer || "N/A"}
                      </span>
                    </li>
                    <li>
                      <span className="property-id">Site Features :</span>
                      <span className="property-value">
                        {propertyData[0]?.misc?.NWM_SiteFeatures || "N/A"}
                      </span>
                    </li>
                    <li>
                      <span className="property-id">Heating :</span>
                      <span className="property-value">
                        {propertyData[0]?.misc?.Heating || "N/A"}
                      </span>
                    </li>
                    <li>
                      <span className="property-id">Possession :</span>
                      <span className="property-value">
                        {propertyData[0]?.misc?.Possession || "N/A"}
                      </span>
                    </li>
                    <li>
                      <span className="property-id"> M L S Area Major :</span>
                      <span className="property-value">
                        {propertyData[0]?.misc?.MLSAreaMajor || "N/A"}
                      </span>
                    </li>
                    <li>
                      <span className="property-id"> Structure Type :</span>
                      <span className="property-value">
                        {propertyData[0]?.misc?.StructureType || "N/A"}
                      </span>
                    </li>
                    <li>
                      <span className="property-id">Number Of Bathtubs :</span>
                      <span className="property-value">
                        {propertyData[0]?.misc?.NWM_NumberOfBathtubs || "N/A"}
                      </span>
                    </li>
                  </div>
                  <br />
                  <h1 className="more-details">Parking</h1>
                  <div className="px-3">
                    <li>
                      <span className="property-id">Car :</span>
                      <span className="property-value">
                        {propertyData[0]?.parking?.car_count || "N/A"}
                      </span>
                    </li>
                    <li>
                      <span className="property-id">Parking Features :</span>
                      <span className="property-value">
                        {propertyData[0]?.parking?.extra?.ParkingFeatures ||
                          "N/A"}
                      </span>
                    </li>
                    <li>
                      <span className="property-id">Open Parking Y/N :</span>
                      <span className="property-value">
                        {propertyData[0]?.parking?.extra?.OpenParkingYN ||
                          "N/A"}
                      </span>
                    </li>
                  </div>
                  <br />
                  <h1 className="more-details">Pool</h1>
                  <div className="px-3">
                    <li>
                      <span className="property-id">Info :</span>
                      <span className="property-value">
                        {propertyData[0]?.pool?.info || "N/A"}
                      </span>
                    </li>
                    <li>
                      <span className="property-id">Pool Features :</span>
                      <span className="property-value">
                        {propertyData[0]?.pool?.extra?.PoolFeatures || "N/A"}
                      </span>
                    </li>
                  </div>
                  <br />
                  <h1 className="more-details">Price</h1>
                  <div className="px-3">
                    <li>
                      <span className="property-id">Current Price :</span>
                      <span className="property-value">
                        {propertyData[0]?.price?.current || "N/A"}
                      </span>
                    </li>
                    <li>
                      <span className="property-id">Start Price :</span>
                      <span className="property-value">
                        {propertyData[0]?.price?.start || "N/A"}
                      </span>
                    </li>
                    <li>
                      <span className="property-id">Tax Annual Amount :</span>
                      <span className="property-value">
                        {propertyData[0]?.price?.extra?.TaxAnnualAmount ||
                          "N/A"}
                      </span>
                    </li>
                  </div>
                  <br />
                  <h1 className="more-details">Property Type</h1>
                  <div className="px-3">
                    <li>
                      <span className="property-id">Type :</span>
                      <span className="property-value">
                        {propertyData[0]?.property_type?.value || "N/A"}
                      </span>
                    </li>
                    <li>
                      <span className="property-id">Info:</span>
                      <span className="property-value">
                        {propertyData[0]?.property_type?.info || "N/A"}
                      </span>
                    </li>
                  </div>
                  <br />
                  <h1 className="more-details">Selling agent</h1>
                  <div className="px-3">
                    <li>
                      <span className="property-id">
                        Buyer Agency Compensation :
                      </span>
                      <span className="property-value">
                        {propertyData[0]?.sold_info?.listing_company_details
                          ?.BuyerAgencyCompensation || "N/A"}
                      </span>
                    </li>
                  </div>
                  <br />
                  <h1 className="more-details">Short sale</h1>
                  <div className="px-3">
                    <li>
                      <span className="property-id">Info :</span>
                      <span className="property-value">
                        {propertyData[0]?.short_sale?.info || "N/A"}
                      </span>
                    </li>
                  </div>
                  <br />
                  <h1 className="more-details">Status</h1>
                  <div className="px-3">
                    <li>
                      <span className="property-id">Has heating :</span>
                      <span className="property-value">
                        {propertyData[0]?.status?.value || "N/A"}
                      </span>
                    </li>
                    <li>
                      <span className="property-id">Info :</span>
                      <span className="property-value">
                        {propertyData[0]?.status?.info || "N/A"}
                      </span>
                    </li>
                  </div>
                  <br />
                  <h1 className="more-details">Utilities</h1>
                  <div className="px-3">
                    <li>
                      <span className="property-id">Elevation Units :</span>
                      <span className="property-value">
                        {propertyData[0]?.utilities?.extra?.ElevationUnits ||
                          "N/A"}
                      </span>
                    </li>
                  </div>
                  <br />
                  <h1 className="more-details">View</h1>
                  <div className="px-3">
                    <li>
                      <span className="property-id">Has View :</span>
                      <span className="property-value">
                        {propertyData[0]?.has_view?.value || "N/A"}
                      </span>
                    </li>
                    <li>
                      <span className="property-id">Info :</span>
                      <span className="property-value">
                        {propertyData[0]?.has_view?.info || "N/A"}
                      </span>
                    </li>
                  </div>
                  <br />
                  <h1 className="more-details">Water front</h1>
                  <div className="px-3">
                    <li>
                      <span className="property-id">Water Company :</span>
                      <span className="property-value">
                        {propertyData[0]?.water_fromt?.extra.NWM_WaterCompany ||
                          "N/A"}
                      </span>
                    </li>
                    <li>
                      <span className="property-id">Water Source :</span>
                      <span className="property-value">
                        {propertyData[0]?.water_fromt?.extra.WaterSource ||
                          "N/A"}
                      </span>
                    </li>
                  </div>
                  <br />
                  <h1 className="more-details">Water Source</h1>
                  <div className="px-3">
                    <li>
                      <span className="property-id">Has Water Source :</span>
                      <span className="property-value">
                        {propertyData[0]?.water_source?.value || "N/A"}
                      </span>
                    </li>
                  </div>
                  <br />
                </div>
              )}
              <button
                onClick={togglePropertyDetails}
                className="toggle-button-details"
              >
                {isExpandedDetails ? "Show less" : "Show more"}
              </button>
            </div>

            <br></br>
            <div>
              <h1 className="description-heading">Open Houses</h1>
              <div className="d-flex gap-2 card p-2 text-center">
                {OpenHouseData.length > 0 ? (
                  OpenHouseData.map((event, index) => (
                    <div
                      key={index}
                      className="btn-new-top-filters h-100 text-center d-flex justify-content-center flex-wrap"
                      style={{ fontSize: "1.1rem" }}
                    >
                      <div>
                        <FontAwesomeIcon icon={faCalendarAlt}></FontAwesomeIcon>{" "}
                        {FormatDate(event.date, event.month, event.year)}
                        <br></br>
                        {formatTime12Hours(event.start_time)} -{" "}
                        {formatTime12Hours(event.end_time)}
                      </div>
                      <div>
                        <AddToCalendarButton
                          name={` Open House - ${event.company}`}
                          startDate={
                            new Date(event.start_time * 1000)
                              .toISOString()
                              .split("T")[0]
                          } // Extract date (YYYY-MM-DD)
                          startTime={formatTime(event.start_time)} // Extract time (HH:MM)
                          endDate={
                            new Date(event.end_time * 1000)
                              .toISOString()
                              .split("T")[0]
                          }
                          endTime={formatTime(event.end_time)}
                          timeZone="America/Los_Angeles"
                          location={event.directions || "Online"}
                          description="Join us for the open house event."
                          options={["Apple", "Google", "iCal", "Outlook.com"]}
                          buttonStyle="default"
                          size="small"
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div>
                    <p>No upcoming events</p>
                  </div>
                )}
                <div class="custom-time">
                  <p>
                    If the available open house time slots do not suite you,
                    request a private viewing at your convenience.
                  </p>
                  <button class="btn-new-top" onClick={handleScroll}>
                    Choose Your Time
                  </button>
                </div>
              </div>
            </div>

            <h1 className="description-heading">Nearby Schools</h1>
            <div>
              <iframe
                src={mapUrl}
                width="100%"
                height="450"
                title="schoolRating"
                frameBorder="0"
                style={{ border: "0" }}
                allowFullScreen
              ></iframe>
            </div>
            <h1 className="description-heading"> Property Estimate</h1>
            <div>
              <p className="description">
                Below is a rough estimate of the value of the home. When buying
                or selling a home we will provide you with a more exact price
                determined by data analyzed by us.
              </p>

              <div className="avmwidget" id="widgetavm">
                <form
                  onSubmit={contactFunction}
                  style={{
                    marginTop: "20px",
                    width: "98%",
                    marginBottom: "55px",
                  }}
                >
                  <h2
                    style={{
                      textAlign: "center",
                      color: "#fff",
                      background: "#0e5eaa",
                      padding: "1rem",
                    }}
                  >
                    Fill the below form to get accurate Home value
                  </h2>
                  <FormGroup>
                    <TextField
                      label="Name"
                      name="name"
                      value={contactForm.name}
                      onChange={handleChange}
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <TextField
                      label="Email"
                      name="email"
                      type="email"
                      value={contactForm.email}
                      onChange={handleChange}
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <FormControl variant="outlined">
                      <InputLabel id="country-code-label">
                        Country Code
                      </InputLabel>
                      <Select
                        labelId="country-code-label"
                        id="country-code-select"
                        name="countryCode"
                        value={contactForm.countryCode}
                        onChange={handleChange}
                        label="Country Code"
                      >
                        <MenuItem value="+1">+1 (United States)</MenuItem>
                        <MenuItem value="+44">+44 (United Kingdom)</MenuItem>
                        <MenuItem value="+91">+91 (India)</MenuItem>
                        <MenuItem value="+61">+61 (Australia)</MenuItem>
                        <MenuItem value="+81">+81 (Japan)</MenuItem>
                        <MenuItem value="+86">+86 (China)</MenuItem>
                        <MenuItem value="+49">+49 (Germany)</MenuItem>
                        <MenuItem value="+33">+33 (France)</MenuItem>
                        <MenuItem value="+55">+55 (Brazil)</MenuItem>
                        <MenuItem value="+27">+27 (South Africa)</MenuItem>
                      </Select>
                    </FormControl>

                    <TextField
                      label="Phone"
                      name="phone"
                      type="tel"
                      value={contactForm.phone}
                      onChange={handleChange}
                      required
                      style={{ marginLeft: "16px" }}
                    />
                  </FormGroup>
                  <FormGroup>
                    <TextField
                      label="Subject"
                      multiline
                      minRows={4}
                      value={contactForm.subject}
                      onChange={handleChange}
                      name="subject"
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <TextField
                      label="Message"
                      multiline
                      minRows={4}
                      value={contactForm.message}
                      onChange={handleChange}
                      name="message"
                      required
                    />
                  </FormGroup>
                  <div className="send-btn">
                    <button
                      className="w-75 mt-3 p-2 send-btn-2 btn"
                      type="submit"
                    >
                      Send
                    </button>
                  </div>
                </form>
                <md-avm-widget
                  rvmAddress={propertyData[0]?.address.google_address}
                  rvmWidgetKey="Y8E341247-6C56-471E-9E34-DFA842598976" // Replace with your AVM widget key
                  rvmShowRprLinks="false"
                  rvmtesting="false"
                ></md-avm-widget>
              </div>
            </div>

            <p className="description">
              * Listing provided courtesy of
              <img style={{ width: "5rem" }} src={MLS} alt="Image" /> as
              distributed by MLSGRID.<br></br>
              Based on information submitted to the MLS GRID as of Tue Jan 20
              1970 18:15:08 GMT+0530 (India Standard Time) .All data is obtained
              from various sources and may not have been verified by broker or
              MLS GRID.
              <br></br>
              The information contained in this listing has not been verified by
              ShopProp or the MLS and should be verified by the buyer.
            </p>
            <div>
              <div className="terms-conditions">
                <p className="m-0">
                  The Digital Millennium Copyright Act of 1998, 17 U.S.C. § 512
                  (the “DMCA”)
                  {isExpanded && (
                    <p>
                      provides recourse for copyright owners who believe that
                      material appearing on the Internet infringes their rights
                      under U.S. copyright law. If you believe in good faith
                      that any content or material made available in connection
                      with our website or services infringes your copyright, you
                      (or your agent) may send us a notice requesting that the
                      content or material be removed, or access to it blocked.
                      Notices must be sent in writing by email to
                      DMCAnotice@MLSGrid.com. <br />
                      <br />
                      The DMCA requires that your notice of alleged copyright
                      infringement include the following information: <br />
                      1. Description of the copyrighted work that is the subject
                      of claimed infringement; <br />
                      2. Description of the alleged infringing content and
                      information sufficient to permit us to locate the content;{" "}
                      <br />
                      3. Contact information for you, including your address,
                      telephone number, and email address; <br />
                      4. A statement by you that you have a good faith belief
                      that the content in the manner complained of is not
                      authorized by the copyright owner, or its agent, or by the
                      operation of any law; <br />
                      5. A statement by you, signed under penalty of perjury,
                      that the information in the notification is accurate and
                      that you have the authority to enforce the copyrights that
                      are claimed to be infringed; and <br />
                      6. A physical or electronic signature of the copyright
                      owner or a person authorized to act on the copyright
                      owner’s behalf. Failure to include all of the above
                      information may result in the delay of the processing of
                      your complaint.
                    </p>
                  )}
                  <button onClick={toggleContent} className="toggle-button">
                    {isExpanded ? "Hide Terms" : "Read Terms"}
                  </button>
                </p>
              </div>
            </div>

            <div className="border">
              <div className="highlights-div card">
                <form
                  onSubmit={contactFunction}
                  style={{
                    marginTop: "20px",
                    width: "98%",
                    marginBottom: "55px",
                  }}
                >
                  <h2 style={{ textAlign: "center", color: "#333D79FF" }}>
                    Drop Message Here
                  </h2>
                  <FormGroup>
                    <TextField
                      label="Username"
                      name="name"
                      value={contactForm.name}
                      onChange={handleChange}
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <TextField
                      label="Email"
                      name="email"
                      type="email"
                      value={contactForm.email}
                      onChange={handleChange}
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <TextField
                      label="Message"
                      multiline
                      minRows={4}
                      value={contactForm.message}
                      onChange={handleChange}
                      name="message"
                      required
                    />
                  </FormGroup>
                  <div className="send-btn">
                    <button
                      className="w-75 mt-3 p-2 send-btn-2 btn"
                      type="submit"
                    >
                      Send
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          {showLoginPopup && (
            <LoginPopup
              showLoginPopup={showLoginPopup}
              onLoginStatusChange={handleLoginStatusChange}
            />
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
        </div>
      ) : (
        <div>
          <img
            src={NoProperty}
            alt="no-property"
            style={{ width: "100%" }}
          ></img>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default PropertyDetails;
