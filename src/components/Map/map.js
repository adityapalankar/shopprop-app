import React, { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import "./map.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PlacesAutocomplete from "react-places-autocomplete";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import {
  GoogleMap,
  Marker,
  MarkerClusterer,
  InfoWindow,
} from "@react-google-maps/api";
import markerIcon from "../../assets/sale.png";
import ErrorImg from "../../assets/error-1.png";
import soldMarkerIcon from "../../assets/sold.png";
import NoImage from "../../assets/No-image-available.jpeg";
import {
  faList,
  faMapMarkerAlt,
  faFilter,
  faArrowDownWideShort,
  faMap,
  faSave,
  faBed,
  faBath,
  faAreaChart,
  faClose,
  faShare,
  faHeart as faSolidHeart,
} from "@fortawesome/free-solid-svg-icons";

import { faHeart } from "@fortawesome/free-regular-svg-icons";
import Footer from "../Footer/footer";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import "react-datepicker/dist/react-datepicker.css";
import apiModule from "../Api/apiModule";
import Loader from "../Loader/loader";
import ReactSlider from "react-slider";
import sidelogo from "../../assets/shopprop_logo.png";
import { geocodeByAddress } from "react-places-autocomplete";
import AllProp from "../../assets/home-icons/townhouse.png";
import Condo from "../../assets/home-icons/condo.png";
import House from "../../assets/home-icons/home.png";
import Land from "../../assets/home-icons/land.png";
import business from "../../assets/home-icons/business.png";
import Others from "../../assets/home-icons/other.png";
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
import LoginPopup from "../Login/login";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const MapComponent = () => {
  const mapRef = useRef(null);
  const [mapCenter, setMapCenter] = useState({
    lat: 47.6768927,
    lng: -122.2059833,
  });
  const [zoom, setZoom] = useState(15.5);
  const [markers, setMarkers] = useState([]);
  const [searchAddress, setSearchAddress] = useState("");
  const navigate = useNavigate();
  const [showMap, setShowMap] = useState(true);
  const [properties, setProperties] = useState([]);
  const [sortBy, setSortBy] = useState("");
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showSavedFilters, setShowSavedFilters] = useState(false);
  const [isFilterVisible, setFilterVisibility] = useState(false);
  const [isFilterAreaVisible, setFilterAreaVisibility] = useState(false);
  const [isFilterBedVisible, setFilterBedVisibility] = useState(false);
  const [isFilterPropertyTypeVisible, setFilterPropertyTypeVisibility] =
    useState(false);
  const [isMoreFilterVisible, setMoreFilterVisibility] = useState(false);
  const [propertyTypeValues, setPropertyTypeValues] = useState([]);

  const [areaMinValue, setAreaMinValue] = useState("");
  const [areaMaxValue, setAreaMaxValue] = useState("");
  const [minLotArea, setminLotArea] = useState("");
  const [maxLotArea, setmaxLotArea] = useState("");
  const [BathFilter, setBathFilter] = useState("");
  const [bedFilter, setBedFilter] = useState("");
  const [maxHOA, setMaxHOA] = useState("");
  const [minYearBuilt, setminYearBuilt] = useState("");
  const [minStories, setminStories] = useState("");
  const [minParking, setminParking] = useState("");
  const [maxDays, setmaxDays] = useState("");
  const [minDays, setminDays] = useState("");
  const [minCost, setminCost] = useState("");
  const [propertyStatus, setpropertyStatus] = useState("");
  const [listingBy, setlistingBy] = useState("");
  const [maxCost, setmaxCost] = useState("");
  const [excludeShortSales, setExcludeShortSales] = useState(false);
  const [fixerUpper, setFixerUpper] = useState(false);
  const [openHouses, setOpenHouses] = useState(false);
  const [priceReduction, setPriceReduction] = useState(false);
  const [isGarage, setisGarage] = useState(false);
  const [isAirCondition, setisAirCondition] = useState(false);
  const [isBasement, setisBasement] = useState(false);
  const [isHeating, setisHeating] = useState(false);
  const [isParking, setisParking] = useState(false);
  const [isSwimming, setisSwimming] = useState(false);
  const [greenHomes, setgreenHomes] = useState(false);
  const [isLaundry, setisLaundry] = useState(false);

  var [toggleChecked, setToggleChecked] = useState(false);
  const [istoggleChecked, issetToggleChecked] = useState(false);
  const [savedFilters, setSavedFilters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState("price");
  const [showDialog, setShowDialog] = useState(false);
  const [currentShareUrl, setCurrentShareUrl] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Assume user is not logged in by default
  const [showLoginPopup, setShowLoginPopup] = useState(false); // Modal visibility

  const [favoriteProperties, setFavoriteProperties] = useState(new Set());
  let exclusiveProperty = false;

  const path = window.location.href;
  const tenantParam = path.split("/tenant").pop();
  const tenantName = tenantParam.split("/")[1];

  const storedUserJson = localStorage.getItem("userJson");
  let user = storedUserJson ? JSON.parse(storedUserJson) : null;
  let logo = user ? user.logo : null;
  let tenant_name = user ? user.tenant_name : tenantName;

  const [queryParams, setqueryParams] = useSearchParams();
  const queryString = queryParams.toString();

  const settings = {
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    prevArrow: <></>,
    nextArrow: <></>,
  };

  const [isDropdownVisible, setIsDropdownVisible] = useState(false); // Track dropdown visibility

  // Function to handle dropdown selection and update query parameters
  const handleDropdownChange = (days) => {
    if (!days) return; // Do nothing if no selection is made

    // Calculate epoch times
    const todayEpoch = Math.floor(new Date().getTime() / 1000); // Current date in epoch
    const pastDateEpoch = todayEpoch - days * 86400; // Convert selected days to epoch time

    // Update query parameters based on the selected days
    setqueryParams((prevParams) => {
      const newParams = new URLSearchParams(prevParams);

      // Set the relevant query params
      newParams.set("property_status", "sold");
      newParams.set("max_last_updated_time", todayEpoch.toString());
      newParams.set("min_last_updated_time", pastDateEpoch.toString());

      return newParams;
    });
  };

  // Function to handle toggle state change and manage query params
  const handleToggleChange = () => {
    issetToggleChecked((prevChecked) => {
      const newChecked = !prevChecked;

      setqueryParams((prevParams) => {
        const newParams = new URLSearchParams(prevParams);

        if (!newChecked) {
          // If toggled OFF, remove relevant query params
          newParams.delete("property_status");
          newParams.delete("max_last_updated_time");
          newParams.delete("min_last_updated_time");
        }

        return newParams;
      });

      return newChecked;
    });
  };

  const handleToggle = () => {
    const path = window.location.href;

    const lastSegment = path.split("/").pop();
    const type = lastSegment.split("?")[0];

    const searchedAddress = queryParams.get("searched_address_format");
    const zipcodeRegex = /\d{5}/;

    const queryParamsString = queryParams.toString(); // Convert queryParams to string
    const queryParamsArray = queryParamsString.split("&"); // Split the string by '&'

    let lat;
    let lng;
    for (let i = 0; i < queryParamsArray.length; i++) {
      const param = queryParamsArray[i];
      const [key, value] = param.split("=");

      if (key === "lat") {
        lat = parseFloat(value);
      } else if (key === "lng") {
        lng = parseFloat(value);
      }

      setMapCenter({
        lat: lat,
        lng: lng,
      });
    }

    if (!toggleChecked) {
      if (type == "zipcode") {
        const zipcode = searchedAddress.match(zipcodeRegex)?.[0];
        const queryParams = `?lat=${lat}&lng=${lng}&zoom=${zoom}&zipcode=${zipcode}&searched_address_format=${searchedAddress}`;
        const routeLink = `/landing/tenant/${tenant_name}/map-search/zipcode${queryParams}&isExclusiveProperty=${!toggleChecked}`;
        navigate(routeLink);
      } else if (type == "citystate") {
        const addressComponents = searchedAddress
          .split(",")
          .map((item) => item.trim());
        const city = addressComponents[0];
        const state = addressComponents[1];
        const country = addressComponents[2];
        const queryParams = `?lat=${lat}&lng=${lng}&zoom=${zoom}&city=${city}&state=${state}&country=${country}&searched_address_format=${searchedAddress}`;
        const routeLink = `/landing/tenant/${tenant_name}/map-search/citystate${queryParams}&isExclusiveProperty=${!toggleChecked}`;
        navigate(routeLink);
      } else if (type == "address") {
        const addressComponents = searchedAddress
          .split(",")
          .map((item) => item.trim());
        const address = addressComponents[0];
        const [city, state, country] = addressComponents.slice(-3);
        const queryParams = `?lat=${lat}&lng=${lng}&zoom=${zoom}&address=${address}&city=${city}&state=${state}&country=${country}&searched_address_format=${searchedAddress}`;
        const routeLink = `/landing/tenant/${tenant_name}/map-search/address${queryParams}&isExclusiveProperty=${!toggleChecked}`;
        navigate(routeLink);
      } else if (type == "viewport") {
        const queryParams = `?lat=${mapCenter.lat}&lng=${mapCenter.lng}&zoom=${zoom}`;

        const routeLink = `/landing/tenant/${tenant_name}/map-search/viewport${queryParams}&isExclusiveProperty=${!toggleChecked}`;
        navigate(routeLink);
      } else {
        const queryParams = `?lat=${mapCenter.lat}&lng=${mapCenter.lng}&zoom=${zoom}`;
        const routeLink = `/landing/tenant/${tenant_name}/map-search${queryParams}&isExclusiveProperty=${!toggleChecked}`;

        navigate(routeLink);
      }
    } else {
      if (type == "zipcode") {
        const zipcode = searchedAddress.match(zipcodeRegex)?.[0];
        const queryParams = `?lat=${lat}&lng=${lng}&zoom=${zoom}&zipcode=${zipcode}&searched_address_format=${searchedAddress}`;
        const routeLink = `/landing/tenant/${tenant_name}/map-search/zipcode${queryParams}`;
        navigate(routeLink);
      } else if (type == "citystate") {
        const addressComponents = searchedAddress
          .split(",")
          .map((item) => item.trim());
        const city = addressComponents[0];
        const state = addressComponents[1];
        const country = addressComponents[2];
        const queryParams = `?lat=${lat}&lng=${lng}&zoom=${zoom}&city=${city}&state=${state}&country=${country}&searched_address_format=${searchedAddress}`;
        const routeLink = `/landing/tenant/${tenant_name}/map-search/citystate${queryParams}`;
        navigate(routeLink);
      } else if (type == "address") {
        const addressComponents = searchedAddress
          .split(",")
          .map((item) => item.trim());
        const address = addressComponents[0];
        const [city, state, country] = addressComponents.slice(-3);
        const queryParams = `?lat=${lat}&lng=${lng}&zoom=${zoom}&address=${address}&city=${city}&state=${state}&country=${country}&searched_address_format=${searchedAddress}`;
        const routeLink = `/landing/tenant/${tenant_name}/map-search/address${queryParams}`;
        navigate(routeLink);
      } else if (type == "viewport") {
        const queryParams = `?lat=${mapCenter.lat}&lng=${mapCenter.lng}&zoom=${zoom}`;
        const routeLink = `/landing/tenant/${tenant_name}/map-search/viewport${queryParams}`;
        navigate(routeLink);
      } else {
        const queryParams = `?lat=${mapCenter.lat}&lng=${mapCenter.lng}&zoom=${zoom}`;
        const routeLink = `/landing/tenant/${tenant_name}/map-search${queryParams}`;
        navigate(routeLink);
      }
    }
    setToggleChecked(!toggleChecked);
  };

  const getHomesForSale = useCallback(() => {
    const path = window.location.href;

    const queryParamsString = queryParams.toString(); // Convert queryParams to string
    const queryParamsArray = queryParamsString.split("&"); // Split the string by '&'
    const queryParamsObject = {};
    let lat;
    let lng;
    for (let i = 0; i < queryParamsArray.length; i++) {
      const param = queryParamsArray[i];
      const [key, value] = param.split("=");
      if (key == "isExclusiveProperty") {
        exclusiveProperty = value;
      }

      if (key === "map_view") {
        setShowMap(value === "true");
      } else {
        setShowMap(true);
      }

      if (key == "zoom") {
        const zoomLevel = Number(value);
        setZoom(zoomLevel);
      }

      if (key === "lat") {
        lat = parseFloat(value);
      } else if (key === "lng") {
        lng = parseFloat(value);
      }

      setMapCenter({
        lat: lat,
        lng: lng,
      });

      const paramsToExclude = [
        "lat",
        "lng",
        "zoom",
        "isExclusiveProperty",
        "city",
        "country",
        "state",
        "searched_address_format",
        "zipcode",
        "address",
        "map_view",
      ]; // Add the names of the parameters you want to exclude

      const filteredParamsArray = queryParamsArray.filter((param) => {
        const paramName = param.split("=")[0]; // Get the parameter name before the '=' sign
        return !paramsToExclude.includes(paramName);
      });

      for (let i = 0; i < filteredParamsArray.length; i++) {
        const param = filteredParamsArray[i];
        const [filterkey, filtervalue] = param.split("=");

        const decodedValue = decodeURIComponent(filtervalue);

        if (decodedValue === "true" || decodedValue === "false") {
          queryParamsObject[filterkey] = decodedValue === "true";
        } else if (decodedValue.includes(",")) {
          queryParamsObject[filterkey] = decodedValue.split(",");
        } else {
          queryParamsObject[filterkey] = decodedValue;
        }
      }
    }

    const lastSegment = path.split("/").pop();
    const type = lastSegment.split("?")[0];

    const searchedAddress = queryParams.get("searched_address_format");

    if (!exclusiveProperty) {
      setToggleChecked(false);
    } else {
      toggleChecked = exclusiveProperty;

      setToggleChecked(true);
    }
    if (type == "zipcode") {
      getHomesForSaleByZipcode(searchedAddress, queryParamsObject);
    } else if (type == "citystate") {
      getHomesForSaleByCitystate(searchedAddress, queryParamsObject);
    } else if (type == "address") {
      getHomesForSaleByAddress(searchedAddress, queryParamsObject);
    } else if (type == "viewport") {
      getHomesForSaleByViewport(mapCenter, queryParamsObject);
    } else if (queryParamsArray[0] == "lat=47.6768927") {
      getHomesForSaleByViewport(mapCenter, queryParamsObject);
    } else {
      // Default behavior when there are no search parameters
      getHomesForSaleByViewport(mapCenter, queryParamsObject);
      const queryParams = `?lat=${mapCenter.lat}&lng=${mapCenter.lng}&zoom=${zoom}`;
      navigate(`/landing/tenant/${tenant_name}/map-search${queryParams}`);
    }
  }, [navigate, mapCenter, zoom, tenant_name, toggleChecked, queryString]);

  useEffect(() => {
    getHomesForSale();
    const searchParams = new URLSearchParams(queryParams);
    issetToggleChecked(searchParams.get("property_status") === "sold");
  }, [toggleChecked, queryString]);

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
      getFavoriteProperties();
    }
  }, [isLoggedIn]);

  const handleMarkerClick = (marker) => {
    setSelectedMarker(marker);
  };

  const handleInfoWindowClose = () => {
    setSelectedMarker(null);
  };

  const handleButtonClick = () => {
    setShowMap(!showMap);

    // Update the map_view query parameter based on the showMap state
    setqueryParams((prevParams) => {
      const newParams = new URLSearchParams(prevParams);

      // Set the map_view parameter (true or false based on showMap state)
      newParams.set("map_view", !showMap ? "true" : "false");

      // Return the updated parameters to update the URL
      return newParams;
    });

    // Optionally reload the page if needed
    if (!showMap) {
      window.location.reload();
    }

    // Set the new icon based on showMap state (you can implement this part as needed)
  };

  const onLoad = (map) => {
    mapRef.current = map;
  };

  const handleMapMove = async () => {
    const map = mapRef.current;
    if (mapRef.current) {
      const newCenter = map.getCenter(); // Get new center after drag
      setMapCenter({
        lat: newCenter.lat(),
        lng: newCenter.lng(),
      });

      setZoom(map.getZoom())
      let zoom = map.getZoom();
      const propertyStatus = queryParams.get("property_status");
      const maxLastUpdatedTime = queryParams.get("max_last_updated_time");
      const minLastUpdatedTime = queryParams.get("min_last_updated_time");

      let Params = `?lat=${newCenter.lat()}&lng=${newCenter.lng()}&zoom=${zoom}`;

      if (propertyStatus === "sold") {
        Params += `&property_status=${propertyStatus}`;

        if (maxLastUpdatedTime) {
          Params += `&max_last_updated_time=${maxLastUpdatedTime}`;
        }
        if (minLastUpdatedTime) {
          Params += `&min_last_updated_time=${minLastUpdatedTime}`;
        }
      }
      navigate(`/landing/tenant/${tenant_name}/map-search/viewport${Params}`);
    }
  };

  const headersForPropertySearch = useCallback(() => {
    return {
      tenant: tenant_name,
    };
  }, [tenant_name]);

  const calculateRectangleCoordinates = (centerLat, centerLng, radius) => {
    const centerLatRad = centerLat * (Math.PI / 180);
    const centerLngRad = centerLng * (Math.PI / 180);
    const radiusOfEarth = 6371000;
    const radiusDeg = radius / (radiusOfEarth * (Math.PI / 180));

    const topLeftLatRad = centerLatRad + radiusDeg;
    const topLeftLngRad = centerLngRad - radiusDeg;
    const bottomRightLatRad = centerLatRad - radiusDeg;
    const bottomRightLngRad = centerLngRad + radiusDeg;

    const topLeftLat = topLeftLatRad * (180 / Math.PI);
    const topLeftLng = topLeftLngRad * (180 / Math.PI);
    const bottomRightLat = bottomRightLatRad * (180 / Math.PI);
    const bottomRightLng = bottomRightLngRad * (180 / Math.PI);

    return {
      topLeft: { lat: topLeftLat, lon: topLeftLng },
      bottomRight: { lat: bottomRightLat, lon: bottomRightLng },
    };
  };

  const getDataByViewport = useCallback(
    async (searchedAddress, filterpayload) => {
      setIsLoading(true);

      const centerLat = searchedAddress.lat;
      const centerLng = searchedAddress.lng;
      const radius = 15; // Specify the desired radius in meters

      const { topLeft, bottomRight } = calculateRectangleCoordinates(
        centerLat,
        centerLng,
        radius
      );

      const Payload = {
        searched_address_formatted: searchedAddress,
        property_status: "SALE",
        min_price: 25000,
        size: 200,
        allowed_mls: [
          "ARMLS",
          "ACTRISMLS",
          "BAREISMLS",
          "CRMLS",
          "CENTRALMLS",
          "MLSLISTINGS",
          "NWMLS",
          "NTREISMLS",
          "shopprop",
        ],
        cursor: null,
        location_bounds: {
          top_left: {
            lat: topLeft.lat,
            lon: topLeft.lon,
          },
          bottom_right: {
            lat: bottomRight.lat,
            lon: bottomRight.lon,
          },
        },
      };

      const payload = {
        ...Payload,
        ...filterpayload,
      };

      try {
        if (toggleChecked) {
          const api = await apiModule;

          const response = await api.privateDataByCoordinates(
            payload,
            tenant_name
          );

          setIsLoading(false);
          return response.data;
        } else {
          const api = await apiModule;

          const response = await api.publicDataByCoordinates(
            payload,
            tenant_name
          );

          setIsLoading(false);
          return response.data;
        }
      } catch (error) {
        console.error(error);
        setIsLoading(false);
        throw error;
      }
    },
    [mapCenter, toggleChecked]
  );

  const getHomesForSaleByViewport = useCallback(
    async (coordinates, filterPayload) => {
      try {
        const searchData = await getDataByViewport(coordinates, filterPayload);

        // Create marker data using the lat and lon values from each item in the data array
        const markerData = searchData.map((item) => ({
          lat: item.location.lat,
          lng: item.location.lon,
          address: item.address,
          imageUrl: item.image_url?.[0] || "",
          area: item.area?.finished || "",
          price: item.price?.current || "",
          bedrooms: item.bedroom?.count || 0,
          bathrooms: item.bathroom?.count || 0,
          hoa: item.hoa?.per_month || "N/A",
          propertyType: item.property_type?.value || "N/A",
          property_descriptor: item.property_descriptor?.id,
          property_descriptor_mls: item.property_descriptor?.mls_name,
          status: item.status.value,
        }));

        setMarkers(markerData);

        const propertyData = searchData.map((item) => ({
          imageUrl: item.image_url || "", // Optional chaining used here
          address: item.address || "",
          area: item.area?.finished || "",
          price: item.price?.current || "",
          bedrooms: item.bedroom?.count || 0,
          bathrooms: item.bathroom?.count || 0,
          property_descriptor: item.property_descriptor?.id,
          property_descriptor_mls: item.property_descriptor?.mls_name,
          hoa: item.hoa?.per_month || "N/A",
          propertyType: item.property_type?.value || "N/A",
          status: item?.status.value,
          virtual_tour: item.virtual_url || "",
        }));

        setProperties(propertyData);
      } catch (error) {
        console.error("Error:", error);
      }
    },
    [getDataByViewport, toggleChecked]
  );

  const getDataByCityState = useCallback(
    async (searchedAddress, filterpayload) => {
      setIsLoading(true);

      const addressComponents = searchedAddress
        .split(",")
        .map((item) => item.trim());

      const city = addressComponents[0].toLowerCase();
      const state = addressComponents[1].toLowerCase();

      const Payload = {
        sort_by: "last_updated_time",
        property_status: "SALE",
        order_by: "desc",
        searched_address_formatted: searchedAddress,
        min_price: 25000,
        output: [
          "area",
          "price",
          "bedroom",
          "bathroom",
          "image_url",
          "property_descriptor",
          "location",
          "address",
          "status",
        ],
        size: 200,
        allowed_mls: [
          "ARMLS",
          "ACTRISMLS",
          "BAREISMLS",
          "CRMLS",
          "CENTRALMLS",
          "MLSLISTINGS",
          "NWMLS",
          "NTREISMLS",
          "shopprop",
        ],
      };

      const payload = {
        ...Payload,
        ...filterpayload,
      };

      try {
        if (toggleChecked) {
          const api = await apiModule;

          const response = await api.privateDataByCityState(
            payload,
            city,
            state,
            tenant_name
          );

          setIsLoading(false);
          return response.data;
        } else {
          const api = await apiModule;

          const response = await api.publicDataByCityState(
            payload,
            city,
            state,
            tenant_name
          );
          setIsLoading(false);
          return response.data;
        }
      } catch (error) {
        console.error(error);
        setIsLoading(false);
        throw error;
      }
    },
    [headersForPropertySearch, toggleChecked]
  );

  const getHomesForSaleByCitystate = useCallback(
    async (searchedAddress, filterPayload) => {
      try {
        const searchData = await getDataByCityState(
          searchedAddress,
          filterPayload
        );

        // Create marker data using the lat and lon values from each item in the data array
        const markerData = searchData.map((item) => ({
          lat: item.location.lat,
          lng: item.location.lon,
          address: item.address,
          imageUrl: item.image_url?.[0] || "",
          area: item.area?.finished || "",
          price: item.price?.current || "",
          bedrooms: item.bedroom?.count || 0,
          bathrooms: item.bathroom?.count || 0,
          hoa: item.hoa?.per_month || "N/A",
          propertyType: item.property_type?.value || "N/A",
          property_descriptor: item.property_descriptor?.id,
          property_descriptor_mls: item.property_descriptor?.mls_name,
          status: item.status.value,
        }));

        setMarkers(markerData);

        const propertyData = searchData.map((item) => ({
          imageUrl: item.image_url || "", // Optional chaining used here
          address: item.address || "",
          area: item.area?.finished || "",
          price: item.price?.current || "",
          bedrooms: item.bedroom?.count || 0,
          bathrooms: item.bathroom?.count || 0,
          property_descriptor: item.property_descriptor?.id,
          property_descriptor_mls: item.property_descriptor?.mls_name,
          hoa: item.hoa?.per_month || "N/A",
          propertyType: item.property_type?.value || "N/A",
          status: item.status.value,
          virtual_tour: item.virtual_url || "",
        }));

        setProperties(propertyData);
      } catch (error) {
        console.error("Error:", error);
      }
    },
    [getDataByCityState, markers]
  );

  const getDataByZipcode = useCallback(
    async (searchedAddress, filterpayload) => {
      setIsLoading(true);
      const zipcodeRegex = /\d{5}/;
      const zipcode = searchedAddress.match(zipcodeRegex)?.[0];
      const Payload = {
        sort_by: "last_updated_time",
        order_by: "desc",
        searched_address_formatted: searchedAddress,
        property_status: "SALE",
        min_price: 25000,
        output: [
          "area",
          "price",
          "bedroom",
          "bathroom",
          "image_url",
          "property_descriptor",
          "location",
          "address",
          "status",
        ],
        size: 200,
        allowed_mls: [
          "ARMLS",
          "ACTRISMLS",
          "BAREISMLS",
          "CRMLS",
          "CENTRALMLS",
          "MLSLISTINGS",
          "NWMLS",
          "NTREISMLS",
          "shopprop",
        ],
      };
      const payload = {
        ...Payload,
        ...filterpayload,
      };

      try {
        if (toggleChecked) {
          const api = await apiModule;

          const response = await api.privateDataByZipcode(
            payload,
            zipcode,
            tenant_name
          );

          setIsLoading(false);
          return response.data;
        } else {
          const api = await apiModule;

          const response = await api.publicDataByZipcode(
            payload,
            zipcode,
            tenant_name
          );
          setIsLoading(false);
          return response.data;
        }
      } catch (error) {
        console.error(error);
        setIsLoading(false);
        throw error;
      }
    },
    [headersForPropertySearch, toggleChecked]
  );

  const getHomesForSaleByZipcode = useCallback(
    async (searchedAddress, filterPayload) => {
      try {
        const searchData = await getDataByZipcode(
          searchedAddress,
          filterPayload
        );

        // Create marker data using the lat and lon values from each item in the data array
        const markerData = searchData.map((item) => ({
          lat: item.location.lat,
          lng: item.location.lon,
          address: item.address,
          imageUrl: item.image_url?.[0] || "",
          area: item.area?.finished || "",
          price: item.price?.current || "",
          bedrooms: item.bedroom?.count || 0,
          bathrooms: item.bathroom?.count || 0,
          hoa: item.hoa?.per_month || "N/A",
          propertyType: item.property_type?.value || "N/A",
          property_descriptor: item.property_descriptor?.id,
          property_descriptor_mls: item.property_descriptor?.mls_name,
          status: item.status.value,
        }));

        setMarkers(markerData);

        const propertyData = searchData.map((item) => ({
          imageUrl: item.image_url || "", // Optional chaining used here
          address: item.address || "",
          area: item.area?.finished || "",
          price: item.price?.current || "",
          bedrooms: item.bedroom?.count || 0,
          bathrooms: item.bathroom?.count || 0,
          property_descriptor: item.property_descriptor?.id,
          property_descriptor_mls: item.property_descriptor?.mls_name,
          hoa: item.hoa?.per_month || "N/A",
          propertyType: item.property_type?.value || "N/A",
          status: item.status.value,
          virtual_tour: item.virtual_url || "",
        }));
        setProperties(propertyData);
      } catch (error) {
        console.error("Error:", error);
      }
    },
    [getDataByZipcode]
  );

  const getDataByAddress = useCallback(
    async (searchedAddress, filterpayload) => {
      setIsLoading(true);
      const addressComponents = searchedAddress
        .split(",")
        .map((item) => item.trim());
      const address = addressComponents[0];
      const [city, state, country] = addressComponents.slice(-3);

      const Payload = {
        sort_by: "last_updated_time",
        order_by: "desc",
        searched_address_formatted: searchedAddress,
        output: [
          "area",
          "price",
          "bedroom",
          "bathroom",
          "image_url",
          "property_descriptor",
          "location",
          "address",
          "status",
        ],
        city: city,
        state: state,
        size: 200,
        allowed_mls: [
          "ARMLS",
          "ACTRISMLS",
          "BAREISMLS",
          "CRMLS",
          "CENTRALMLS",
          "MLSLISTINGS",
          "NWMLS",
          "NTREISMLS",
          "shopprop",
        ],
      };
      const payload = {
        ...Payload,
        ...filterpayload,
      };

      try {
        if (toggleChecked) {
          const api = await apiModule;

          const response = await api.privateDataByAddress(
            payload,
            address,
            tenant_name
          );

          setIsLoading(false);
          return response.data;
        } else {
          const api = await apiModule;

          const response = await api.publicDataByAddress(
            payload,
            address,
            tenant_name
          );
          setIsLoading(false);
          return response.data;
        }
      } catch (error) {
        console.error(error);
        setIsLoading(false);
        throw error;
      }
    },
    [headersForPropertySearch, toggleChecked]
  );

  const getHomesForSaleByAddress = useCallback(
    async (address, filterPayload) => {
      try {
        const searchData = await getDataByAddress(address, filterPayload);

        // Create marker data using the lat and lon values from each item in the data array
        const markerData = searchData.map((item) => ({
          lat: item.location.lat,
          lng: item.location.lon,
          address: item.address,
          imageUrl: item.image_url?.[0] || "",
          area: item.area?.finished || "",
          price: item.price?.current || "",
          bedrooms: item.bedroom?.count || 0,
          bathrooms: item.bathroom?.count || 0,
          hoa: item.hoa?.per_month || "N/A",
          propertyType: item.property_type?.value || "N/A",
          property_descriptor: item.property_descriptor?.id,
          property_descriptor_mls: item.property_descriptor?.mls_name,
          status: item.status.value,
        }));

        setMarkers(markerData);

        const propertyData = searchData.map((item) => ({
          imageUrl: item.image_url || "", // Optional chaining used here
          address: item.address || "",
          area: item.area?.finished || "",
          price: item.price?.current || "",
          bedrooms: item.bedroom?.count || 0,
          bathrooms: item.bathroom?.count || 0,
          property_descriptor: item.property_descriptor?.id,
          property_descriptor_mls: item.property_descriptor?.mls_name,
          hoa: item.hoa?.per_month || "N/A",
          propertyType: item.property_type?.value || "N/A",
          status: item.status.value,
          virtual_tour: item.virtual_url || "",
        }));
        setProperties(propertyData);
      } catch (error) {
        console.error("Error:", error);
      }
    },
    [getDataByAddress]
  );

  const latRad = (lat) => {
    var sin = Math.sin((lat * Math.PI) / 180);
    var radX2 = Math.log((1 + sin) / (1 - sin)) / 2;
    return Math.max(Math.min(radX2, Math.PI), -Math.PI) / 2;
  };

  const getZoom = (mapPx, worldPx, fraction) => {
    return Math.ceil(Math.log(mapPx / worldPx / fraction) / Math.LN2);
  };

  const getZoomLevel = (bounds, mapsDim) => {
    const WORLD_DIM = { height: 256, width: 256 };
    const ZOOM_MAX = 21;
    var ne = bounds.getNorthEast();
    var sw = bounds.getSouthWest();
    var latFraction = (latRad(ne.lat()) - latRad(sw.lat())) / Math.PI;
    var lngDiff = ne.lng() - sw.lng();
    var lngFraction = (lngDiff < 0 ? lngDiff + 360 : lngDiff) / 360;
    var latZoom = getZoom(mapsDim.height, WORLD_DIM.height, latFraction);
    var lngZoom = getZoom(mapsDim.width, WORLD_DIM.width, lngFraction);
    return Math.min(latZoom, lngZoom, ZOOM_MAX) - 0.5;
  };

  const search = async (searchedAddress, placeId) => {
    
    const results = await geocodeByAddress(searchedAddress);

    const geometry = results[0].geometry;

    // Extract details such as lat/lng, formatted address, etc.
    const latLng = results[0].geometry.location;
    const formattedAddress = results[0].formatted_address;

    const lat = latLng.lat();
    const lng = latLng.lng();

    const zoom = getZoomLevel(geometry?.viewport, { height: 400, width: 400 });

    const addressComponents = searchedAddress
      .split(",")
      .map((item) => item.trim());
    const zipcodeRegex = /\d{5}/;

    if (
      addressComponents.length === 3 &&
      !zipcodeRegex.test(addressComponents.join(""))
    ) {
      const city = addressComponents[0];
      const state = addressComponents[1];
      const country = addressComponents[2];
      const queryParams = `?lat=${lat}&lng=${lng}&zoom=${zoom}&city=${city}&state=${state}&country=${country}&searched_address_format=${formattedAddress}`;
      const routeLink = `/landing/tenant/${tenant_name}/map-search/citystate${queryParams}`;
      navigate(routeLink);
    } else if (
      addressComponents.length >= 4 &&
      !zipcodeRegex.test(addressComponents.join(""))
    ) {
      const address = addressComponents[0];
      const [city, state, country] = addressComponents.slice(-3);
      const queryParams = `?lat=${lat}&lng=${lng}&zoom=${zoom}&address=${address}&city=${city}&state=${state}&country=${country}&searched_address_format=${formattedAddress}`;
      const routeLink = `/landing/tenant/${tenant_name}/map-search/address${queryParams}`;
      navigate(routeLink);
    } else {
      const zipcodeRegex = /\d{5}/;
      const zipcode = searchedAddress.match(zipcodeRegex)?.[0];
      if (zipcode) {
        const queryParams = `?lat=${lat}&lng=${lng}&zoom=${zoom}&zipcode=${zipcode}&searched_address_format=${formattedAddress}`;
        const routeLink = `/landing/tenant/${tenant_name}/map-search/zipcode${queryParams}`;
        navigate(routeLink);
      } else {
        getHomesForSaleByViewport(mapCenter);
      }
    }

    setSearchAddress("");
  };

  const sortOrderLimits = [
    { value: "value1", label: "Lowest Price" },
    { value: "value2", label: "Highest Price" },
    { value: "value3", label: "Less Area" },
    { value: "value4", label: "More Area" },
    { value: "value5", label: "Less Bedrooms" },
    { value: "value6", label: "More Bedrooms" },
    // Add more options as needed
  ];

  const handleClick = () => {
    setShowOptions(!showOptions);
  };

  const handleFilterClick = () => {
    setShowFilters(!showFilters);
  };

  if (sortBy === "value1") {
    properties.sort((a, b) => a.price - b.price);
  } else if (sortBy === "value2") {
    properties.sort((a, b) => b.price - a.price);
  } else if (sortBy === "value3") {
    properties.sort((a, b) => a.area - b.area);
  } else if (sortBy === "value4") {
    properties.sort((a, b) => b.area - a.area);
  } else if (sortBy === "value5") {
    properties.sort((a, b) => (a.bedrooms || 0) - (b.bedrooms || 0));
  } else if (sortBy === "value6") {
    properties.sort((a, b) => (b.bedrooms || 0) - (a.bedrooms || 0));
  }

  const handleSortChange = (e) => {
    setSortBy(e);
    setShowOptions(false);
  };

  const handleApplyFilters = () => {
    let filterPayload = {};
    var filterForm = {
      min_price: minValue,
      max_price: maxValue,
      min_bathroom: BathFilter,
      min_bedroom: bedFilter,
      max_constructed_finished_sqft_size: areaMaxValue,
      min_constructed_finished_sqft_size: areaMinValue,
      property_type: propertyTypeValues,
      max_hoa_cost_per_month: maxHOA,
      min_year_built: minYearBuilt,
      min_parking_count: minParking,
      min_stories_count: minStories,
      min_lot_size_in_sqft: minLotArea,
      max_lot_size_in_sqft: maxLotArea,
      max_days: maxDays,
      min_days: minDays,
      min_cost_per_sqft: minCost,
      max_cost_per_sqft: maxCost,
      listed_by: listingBy,
      property_status: propertyStatus,
      exclude_short_sales: excludeShortSales,
      fixer_upper: fixerUpper,
      open_houses: openHouses,
      price_reduction: priceReduction,
      closed_garage: isGarage,
      has_ac: isAirCondition,
      has_basement: isBasement,
      has_central_heating: isHeating,
      has_parking_space: isParking,
      has_pool: isSwimming,
      is_green_home: greenHomes,
      is_in_unit_laundry: isLaundry,
    };

    for (let key in filterForm) {
      if (
        filterForm[key] &&
        (Array.isArray(filterForm[key]) ? filterForm[key].length > 0 : true)
      ) {
        filterPayload[key] = filterForm[key];
      }
    }

    if (
      filterPayload["min_price"] === Math.min(...numericOptions) &&
      filterPayload["max_price"] === Math.max(...numericOptions)
    ) {
      delete filterPayload["min_price"];
      delete filterPayload["max_price"];
    }

    if (excludeShortSales) {
      filterPayload.exclude_short_sales = excludeShortSales;
    }

    if (fixerUpper) {
      filterPayload.fixer_upper = fixerUpper;
    }

    if (openHouses) {
      filterPayload.open_houses = openHouses;
    }

    if (priceReduction) {
      filterPayload.price_reduction = priceReduction;
    }

    if (isGarage) {
      filterPayload.closed_garage = isGarage;
    }

    if (isAirCondition) {
      filterPayload.has_ac = isAirCondition;
    }

    if (isBasement) {
      filterPayload.has_basement = isBasement;
    }

    if (isHeating) {
      filterPayload.has_central_heating = isHeating;
    }

    if (isParking) {
      filterPayload.has_parking_space = isParking;
    }

    if (isSwimming) {
      filterPayload.has_pool = isSwimming;
    }

    if (greenHomes) {
      filterPayload.is_green_home = greenHomes;
    }

    if (isLaundry) {
      filterPayload.is_in_unit_laundry = isLaundry;
    }

    const path = window.location.href;

    const lastSegment = path.split("/").pop();
    const type = lastSegment.split("?")[0];

    const searchedAddress = queryParams.get("searched_address_format");
    const zipcodeRegex = /\d{5}/;
    const queryParamsString = queryParams.toString(); // Convert queryParams to string
    const queryParamsArray = queryParamsString.split("&"); // Split the string by '&'

    let lat;
    let lng;
    for (let i = 0; i < queryParamsArray.length; i++) {
      const param = queryParamsArray[i];
      const [key, value] = param.split("=");

      if (key === "lat") {
        lat = parseFloat(value);
      } else if (key === "lng") {
        lng = parseFloat(value);
      }

      setMapCenter({
        lat: lat,
        lng: lng,
      });
    }

    if (toggleChecked) {
      if (type == "zipcode") {
        const zipcode = searchedAddress.match(zipcodeRegex)?.[0];
        let queryString = Object.keys(filterPayload)
          .map(
            (key) =>
              `&${encodeURIComponent(key)}=${encodeURIComponent(
                filterPayload[key]
              )}`
          )
          .join("");
        const queryParams = `?lat=${lat}&lng=${lng}&zoom=${zoom}&zipcode=${zipcode}&searched_address_format=${searchedAddress}`;
        const toggleStatus = `&isExclusiveProperty=${toggleChecked}`;
        const routeLink = `/landing/tenant/${tenant_name}/map-search/zipcode${queryParams}${toggleStatus}${queryString}`;
        navigate(routeLink);
      } else if (type == "citystate") {
        const addressComponents = searchedAddress
          .split(",")
          .map((item) => item.trim());
        const city = addressComponents[0];
        const state = addressComponents[1];
        const country = addressComponents[2];
        const queryParams = `?lat=${lat}&lng=${lng}&zoom=${zoom}&city=${city}&state=${state}&country=${country}&searched_address_format=${searchedAddress}`;
        let queryString = Object.keys(filterPayload)
          .map(
            (key) =>
              `&${encodeURIComponent(key)}=${encodeURIComponent(
                filterPayload[key]
              )}`
          )
          .join("");
        const toggleStatus = `&isExclusiveProperty=${toggleChecked}`;
        const routeLink = `/landing/tenant/${tenant_name}/map-search/citystate${queryParams}${toggleStatus}${queryString}`;
        navigate(routeLink);
      } else if (type == "address") {
        const addressComponents = searchedAddress
          .split(",")
          .map((item) => item.trim());
        const address = addressComponents[0];
        const [city, state, country] = addressComponents.slice(-3);
        const queryParams = `?lat=${lat}&lng=${lng}&zoom=${zoom}&address=${address}&city=${city}&state=${state}&country=${country}&searched_address_format=${searchedAddress}`;
        let queryString = Object.keys(filterPayload)
          .map(
            (key) =>
              `&${encodeURIComponent(key)}=${encodeURIComponent(
                filterPayload[key]
              )}`
          )
          .join("");
        const toggleStatus = `&isExclusiveProperty=${toggleChecked}`;
        const routeLink = `/landing/tenant/${tenant_name}/map-search/address${queryParams}${toggleStatus}${queryString}`;
        navigate(routeLink);
      } else if (type == "viewport") {
        const queryParams = `?lat=${mapCenter.lat}&lng=${mapCenter.lng}&zoom=${zoom}`;
        let queryString = Object.keys(filterPayload)
          .map(
            (key) =>
              `&${encodeURIComponent(key)}=${encodeURIComponent(
                filterPayload[key]
              )}`
          )
          .join("");
        const toggleStatus = `&isExclusiveProperty=${toggleChecked}`;
        const routeLink = `/landing/tenant/${tenant_name}/map-search/viewport${queryParams}${toggleStatus}${queryString}`;
        navigate(routeLink);
      } else {
        const queryParams = `?lat=${mapCenter.lat}&lng=${mapCenter.lng}&zoom=${zoom}`;
        let queryString = Object.keys(filterPayload)
          .map(
            (key) =>
              `&${encodeURIComponent(key)}=${encodeURIComponent(
                filterPayload[key]
              )}`
          )
          .join("");
        const routeLink = `/landing/tenant/${tenant_name}/map-search${queryParams}&isExclusiveProperty=${toggleChecked}${queryString}`;
        navigate(routeLink);
      }
    } else {
      if (type == "zipcode") {
        const zipcode = searchedAddress.match(zipcodeRegex)?.[0];
        let queryString = Object.keys(filterPayload)
          .map(
            (key) =>
              `&${encodeURIComponent(key)}=${encodeURIComponent(
                filterPayload[key]
              )}`
          )
          .join("");
        const queryParams = `?lat=${lat}&lng=${lng}&zoom=${zoom}&zipcode=${zipcode}&searched_address_format=${searchedAddress}`;
        const routeLink = `/landing/tenant/${tenant_name}/map-search/zipcode${queryParams}${queryString}`;
        navigate(routeLink);
      } else if (type == "citystate") {
        const addressComponents = searchedAddress
          .split(",")
          .map((item) => item.trim());
        const city = addressComponents[0];
        const state = addressComponents[1];
        const country = addressComponents[2];
        const queryParams = `?lat=${lat}&lng=${lng}&zoom=${zoom}&city=${city}&state=${state}&country=${country}&searched_address_format=${searchedAddress}`;
        let queryString = Object.keys(filterPayload)
          .map(
            (key) =>
              `&${encodeURIComponent(key)}=${encodeURIComponent(
                filterPayload[key]
              )}`
          )
          .join("");
        const routeLink = `/landing/tenant/${tenant_name}/map-search/citystate${queryParams}${queryString}`;
        navigate(routeLink);
      } else if (type == "address") {
        const addressComponents = searchedAddress
          .split(",")
          .map((item) => item.trim());
        const address = addressComponents[0];
        const [city, state, country] = addressComponents.slice(-3);
        const queryParams = `?lat=${lat}&lng=${lng}&zoom=${zoom}&address=${address}&city=${city}&state=${state}&country=${country}&searched_address_format=${searchedAddress}`;
        let queryString = Object.keys(filterPayload)
          .map(
            (key) =>
              `&${encodeURIComponent(key)}=${encodeURIComponent(
                filterPayload[key]
              )}`
          )
          .join("");
        const routeLink = `/landing/tenant/${tenant_name}/map-search/address${queryParams}${queryString}`;
        navigate(routeLink);
      } else if (type == "viewport") {
        const queryParams = `?lat=${mapCenter.lat}&lng=${mapCenter.lng}&zoom=${zoom}`;
        let queryString = Object.keys(filterPayload)
          .map(
            (key) =>
              `&${encodeURIComponent(key)}=${encodeURIComponent(
                filterPayload[key]
              )}`
          )
          .join("");

        const routeLink = `/landing/tenant/${tenant_name}/map-search/viewport${queryParams}${queryString}`;
        navigate(routeLink);
      } else {
        const queryParams = `?lat=${mapCenter.lat}&lng=${mapCenter.lng}&zoom=${zoom}`;
        let queryString = Object.keys(filterPayload)
          .map(
            (key) =>
              `&${encodeURIComponent(key)}=${encodeURIComponent(
                filterPayload[key]
              )}`
          )
          .join("");

        const routeLink = `/landing/tenant/${tenant_name}/map-search${queryParams}${queryString}`;
        navigate(routeLink);
      }
    }

    setShowFilters(false);
  };

  const handlePropertyTypeChange = (event) => {
    const { value, checked } = event.target;

    if (value === "All") {
      // If "All" is checked, set propertyTypeValues to all option values except the empty one ('')
      const allOptions = options.filter((option) => option.value !== "");
      const allOptionValues = allOptions.map((option) => option.value);
      setPropertyTypeValues(checked ? allOptionValues : []);
    } else {
      // If any other option is checked, add the value to the array
      // If any other option is unchecked, remove the value from the array
      setPropertyTypeValues((prevValues) =>
        checked
          ? [...prevValues, value]
          : prevValues.filter((val) => val !== value)
      );

      // If "All" is checked and any other option is unchecked, uncheck "All"
      if (value !== "All" && propertyTypeValues.includes("")) {
        setPropertyTypeValues((prevValues) =>
          prevValues.filter((val) => val !== "")
        );
      }

      // If any other option is checked and "All" is checked, uncheck "All"
      if (value === "All" && checked) {
        setPropertyTypeValues((prevValues) =>
          prevValues.filter((val) => val !== "")
        );
      }
    }
  };

  const handleCheckboxChange = (checkboxName) => {
    if (checkboxName === "excludeShortSales") {
      setExcludeShortSales(!excludeShortSales);
    } else if (checkboxName === "fixerUpper") {
      setFixerUpper(!fixerUpper);
    } else if (checkboxName === "openHouses") {
      setOpenHouses(!openHouses);
    } else if (checkboxName === "priceReduction") {
      setPriceReduction(!priceReduction);
    } else if (checkboxName === "isGarage") {
      setisGarage(!isGarage);
    } else if (checkboxName === "isAirCondition") {
      setisAirCondition(!isAirCondition);
    } else if (checkboxName === "isBasement") {
      setisBasement(!isBasement);
    } else if (checkboxName === "isHeating") {
      setisHeating(!isHeating);
    } else if (checkboxName === "isParking") {
      setisParking(!isParking);
    } else if (checkboxName === "isSwimming") {
      setisSwimming(!isSwimming);
    } else if (checkboxName === "greenHomes") {
      setgreenHomes(!greenHomes);
    } else if (checkboxName === "isLaundry") {
      setisLaundry(!isLaundry);
    }
  };

  const handleResetFilters = () => {
    setMinValue(Math.min(...numericOptions));
    setMaxValue(Math.max(...numericOptions));
    setBathFilter("");
    setBedFilter("");
    setAreaMinValue("");
    setAreaMaxValue("");
    setPropertyTypeValues("");
    setMaxHOA("");
    setminYearBuilt("");
    setminParking("");
    setminStories("");
    setmaxLotArea("");
    setminLotArea("");
    setminDays("");
    setmaxDays("");
    setmaxCost("");
    setminCost("");
    setpropertyStatus("");
    setlistingBy("");
    setExcludeShortSales(false);
    setFixerUpper(false);
    setOpenHouses(false);
    setPriceReduction(false);
    setisGarage(false);
    setisAirCondition(false);
    setisBasement(false);
    setisHeating(false);
    setisParking(false);
    setisSwimming(false);
    setgreenHomes(false);
    setisLaundry(false);
  };

  const toggleFilterVisibility = () => {
    setFilterVisibility(!isFilterVisible);
  };

  const toggleFilterAreaVisibility = () => {
    setFilterAreaVisibility(!isFilterAreaVisible);
  };

  const toggleFilterBedVisibility = () => {
    setFilterBedVisibility(!isFilterBedVisible);
  };

  const toggleFilterPropertyTypeVisibility = () => {
    setFilterPropertyTypeVisibility(!isFilterPropertyTypeVisible);
  };

  const toggleMoreFilterVisibility = () => {
    setMoreFilterVisibility(!isMoreFilterVisible);
  };

  const handleCardClick = (property) => {
    navigate(
      `/landing/tenant/${tenant_name}/property/${property.property_descriptor_mls}/${property.property_descriptor}`
    );
  };

  const openDialog = (shareUrl) => {
    setCurrentShareUrl(shareUrl);
    setShowDialog(true);
  };

  const closeDialog = () => {
    setShowDialog(false);
    setCurrentShareUrl("");
  };
  const filteredOrderLimits = [
    { value: "50000", label: "50K" },
    { value: "75000", label: "75K" },
    { value: "100000", label: "100K" },
    { value: "125000", label: "125K" },
    { value: "150000", label: "150K" },
    { value: "175000", label: "175K" },
    { value: "200000", label: "200K" },
    { value: "225000", label: "225K" },
    { value: "250000", label: "250K" },
    { value: "275000", label: "275K" },
    { value: "300000", label: "300K" },
    { value: "325000", label: "325K" },
    { value: "350000", label: "350K" },
    { value: "375000", label: "375K" },
    { value: "400000", label: "400K" },
    { value: "425000", label: "425K" },
    { value: "450000", label: "450K" },
    { value: "475000", label: "475K" },
    { value: "500000", label: "500K" },
    { value: "525000", label: "525K" },
    { value: "550000", label: "550K" },
    { value: "575000", label: "575K" },
    { value: "600000", label: "600K" },
    { value: "625000", label: "625K" },
    { value: "650000", label: "650K" },
    { value: "675000", label: "675K" },
    { value: "700000", label: "700K" },
    { value: "725000", label: "725K" },
    { value: "750000", label: "750K" },
    { value: "775000", label: "775K" },
    { value: "800000", label: "800K" },
    { value: "825000", label: "825K" },
    { value: "850000", label: "850K" },
    { value: "875000", label: "875K" },
    { value: "900000", label: "900K" },
    { value: "925000", label: "925K" },
    { value: "950000", label: "950K" },
    { value: "975000", label: "975K" },
    { value: "1000000", label: "1M" },
    { value: "1250000", label: "1.25M" },
    { value: "1500000", label: "1.50M" },
    { value: "1750000", label: "1.75M" },
    { value: "2000000", label: "2M" },
    { value: "2250000", label: "2.25M" },
    { value: "2500000", label: "2.50M" },
    { value: "2750000", label: "2.75M" },
    { value: "3000000", label: "3M" },
    { value: "3250000", label: "3.25M" },
    { value: "3500000", label: "3.50M" },
    { value: "3750000", label: "3.75M" },
    { value: "4000000", label: "4M" },
    { value: "4250000", label: "4.25M" },
    { value: "4500000", label: "4.50M" },
    { value: "4750000", label: "4.75M" },
    { value: "5000000", label: "5M" },
    { value: "6000000", label: "6M" },
    { value: "7000000", label: "7M" },
    { value: "8000000", label: "8M" },
    { value: "9000000", label: "9M" },
    { value: "10000000", label: "10M" },

    // Add more options as needed
  ];

  const numericOptions = filteredOrderLimits.map((option) =>
    Number(option.value)
  );
  const [minValue, setMinValue] = useState(Math.min(...numericOptions));
  const [maxValue, setMaxValue] = useState(Math.max(...numericOptions));

  const handleSliderChange = ([newMin, newMax]) => {
    setMinValue(newMin);
    setMaxValue(newMax);
  };

  const findLabel = (value) => {
    const match = filteredOrderLimits.find(
      (option) => Number(option.value) === value
    );
    return match ? match.label : value;
  };

  const areaOptions = [
    { value: "500", label: "500 Sq.Ft" },
    { value: "750", label: "750 Sq.Ft" },
    { value: "1000", label: "1000 Sq.Ft" },
    { value: "1250", label: "1250 Sq.Ft" },
    { value: "1500", label: "1500 Sq.Ft" },
    { value: "1750", label: "1750 Sq.Ft" },
    { value: "2000", label: "2000 Sq.Ft" },
    { value: "2250", label: "2250 Sq.Ft" },
    { value: "2500", label: "2500 Sq.Ft" },
    { value: "2750", label: "2750 Sq.Ft" },
    { value: "3000", label: "3000 Sq.Ft" },
  ];

  const LotareaOptions = [
    { value: "2000", label: "2000 Sq.Ft" },
    { value: "4000", label: "4000 Sq.Ft" },
    { value: "6000", label: "6000 Sq.Ft" },
    { value: "8000", label: "8000 Sq.Ft" },
    { value: "10890", label: "0.25 Acre" },
    { value: "21780", label: "0.5 Acre" },
    { value: "43560", label: "1 Acre" },
    { value: "87120", label: "3 Acre" },
    { value: "217800", label: "5 Acre" },

    // Add more options as needed
  ];

  const CostareaOptions = [
    { value: "100", label: "$100/Sq.Ft" },
    { value: "150", label: "$150/Sq.Ft" },
    { value: "200", label: "$200/Sq.Ft" },
    { value: "250", label: "$250/Sq.Ft" },
    { value: "300", label: "$300/Sq.Ft" },
    { value: "350", label: "$350/Sq.Ft" },
    { value: "400", label: "$400/Sq.Ft" },
    { value: "450", label: "$450/Sq.Ft" },
    { value: "500", label: "$500/Sq.Ft" },
    { value: "550", label: "$550/Sq.Ft" },
    { value: "600", label: "$600/Sq.Ft" },
    { value: "650", label: "$650/Sq.Ft" },
    { value: "700", label: "$700/Sq.Ft" },
    { value: "750", label: "$750/Sq.Ft" },
    { value: "800", label: "$800/Sq.Ft" },
    { value: "850", label: "$850/Sq.Ft" },
    { value: "900", label: "$900/Sq.Ft" },
    { value: "950", label: "$950/Sq.Ft" },
    { value: "1000", label: "$1000/Sq.Ft" },

    // Add more options as needed
  ];

  const maxHOALimits = [
    { value: "0", label: "No HOA" },
    { value: "25", label: "$25/mon" },
    { value: "50", label: "$50/mon" },
    { value: "75", label: "$75/mon" },
    { value: "100", label: "$100/mon" },
  ];

  const CountLimits = [
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
  ];

  const DaysOptions = [
    { value: "3", label: "Less than 3 days" },
    { value: "7", label: "Less than 7 days" },
    { value: "14", label: "Less than 14 days" },
    { value: "30", label: "Less than 30 days" },
    { value: "90", label: "Less than 90 days" },
  ];

  const PropertyStatusOptions = [
    { value: "COMING_SOON", label: "COMING_SOON" },
    { value: "CONTRACT", label: "CONTRACT" },
    { value: "OFF_MARKET", label: "OFF_MARKET" },
    { value: "PENDING", label: "PENDING" },
    { value: "SALE", label: "SALE" },
    { value: "SOLD", label: "SOLD" },
    { value: "UNDER_CONSTRUCTION", label: "UNDER_CONSTRUCTION" },
    { value: "UNKNOWN", label: "UNKNOWN" },
    { value: "WITHDRAWN", label: "WITHDRAWN" },
  ];

  const ListingOptions = [
    { value: "SHOPPROP", label: "SHOPPROP" },
    { value: "ARMLS", label: "ARMLS" },
    { value: "BAREISMLS", label: "BAREISMLS" },
    { value: "CENTRALMLS", label: "CENTRALMLS" },
    { value: "CRMLS", label: "CRMLS" },
    { value: "MLSLISTINGS", label: "MLSLISTINGS" },
    { value: "NWMLS", label: "NWMLS" },
    { value: "ACTRISMLS", label: "ACTRISMLS" },
    { value: "NTREISMLS", label: "NTREISMLS" },
  ];

  const handleSaveFilters = () => {
    let filterPayload = {};
    var filterForm = {
      min_price: minValue,
      max_price: maxValue,
      min_bathroom: BathFilter,
      min_bedroom: bedFilter,
      max_constructed_finished_sqft_size: areaMaxValue,
      min_constructed_finished_sqft_size: areaMinValue,
      property_type: propertyTypeValues,
      max_hoa_cost_per_month: maxHOA,
      min_year_built: minYearBuilt,
      min_parking_count: minParking,
      min_stories_count: minStories,
      min_lot_size_in_sqft: minLotArea,
      max_lot_size_in_sqft: maxLotArea,
      max_days: maxDays,
      min_days: minDays,
      min_cost_per_sqft: minCost,
      max_cost_per_sqft: maxCost,
      listed_by: listingBy,
      property_status: propertyStatus,
      exclude_short_sales: excludeShortSales,
      fixer_upper: fixerUpper,
      open_houses: openHouses,
      price_reduction: priceReduction,
      closed_garage: isGarage,
      has_ac: isAirCondition,
      has_basement: isBasement,
      has_central_heating: isHeating,
      has_parking_space: isParking,
      has_pool: isSwimming,
      is_green_home: greenHomes,
      is_in_unit_laundry: isLaundry,
    };

    for (let key in filterForm) {
      if (
        filterForm[key] &&
        (Array.isArray(filterForm[key]) ? filterForm[key].length > 0 : true)
      ) {
        filterPayload[key] = filterForm[key];
      }
    }

    const path = window.location.href;

    const lastSegment = path.split("/").pop();
    const type = lastSegment.split("?")[0];
    const searchedAddress = queryParams.get("searched_address_format");
    const zoom = queryParams.get("zoom");

    const queryParamsString = queryParams.toString(); // Convert queryParams to string
    const queryParamsArray = queryParamsString.split("&"); // Split the string by '&'
    let lat;
    let lng;
    for (let i = 0; i < queryParamsArray.length; i++) {
      const param = queryParamsArray[i];
      const [key, value] = param.split("=");

      if (key === "lat") {
        lat = parseFloat(value);
      } else if (key === "lng") {
        lng = parseFloat(value);
      }
    }

    if (excludeShortSales) {
      filterPayload.exclude_short_sales = excludeShortSales;
    }

    if (fixerUpper) {
      filterPayload.fixer_upper = fixerUpper;
    }

    if (openHouses) {
      filterPayload.open_houses = openHouses;
    }

    if (priceReduction) {
      filterPayload.price_reduction = priceReduction;
    }

    if (isGarage) {
      filterPayload.closed_garage = isGarage;
    }

    if (isAirCondition) {
      filterPayload.has_ac = isAirCondition;
    }

    if (isBasement) {
      filterPayload.has_basement = isBasement;
    }

    if (isHeating) {
      filterPayload.has_central_heating = isHeating;
    }

    if (isParking) {
      filterPayload.has_parking_space = isParking;
    }

    if (isSwimming) {
      filterPayload.has_pool = isSwimming;
    }

    if (greenHomes) {
      filterPayload.is_green_home = greenHomes;
    }

    if (isLaundry) {
      filterPayload.is_in_unit_laundry = isLaundry;
    }

    const savedFiltersJSON = localStorage.getItem("savedFilters");
    const savedFilters = savedFiltersJSON ? JSON.parse(savedFiltersJSON) : [];

    Swal.fire({
      title: "Enter a label to save filters",
      input: "text",
      inputPlaceholder: "Label",
      showCancelButton: true,
      confirmButtonText: "Save",
      cancelButtonText: "Cancel",
      inputValidator: (value) => {
        if (!value) {
          return "Label is required!";
        }
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const filterWithLabel = {
          ...filterPayload,
          label: result.value,
          searchedAddress: searchedAddress,
          type: type,
          zoom: zoom,
          lat: lat,
          lng: lng,
        };
        savedFilters.push(filterWithLabel);

        localStorage.setItem("savedFilters", JSON.stringify(savedFilters));

        Swal.fire({
          title: "Filters saved successfully!",
          icon: "success",
          confirmButtonText: "OK",
        });
      }
    });
  };

  const handleShowSavedFilters = () => {
    // Retrieve saved filters from local storage
    const savedFiltersJSON = localStorage.getItem("savedFilters");
    if (savedFiltersJSON) {
      const parsedFilters = JSON.parse(savedFiltersJSON);
      setSavedFilters(parsedFilters);
    }

    // Toggle the visibility of the saved filters div
    setShowSavedFilters(!showSavedFilters);
  };

  const handleSavedFilterSelection = (index) => {
    const filterPayload = savedFilters[index];
    const type = filterPayload["type"];
    const searchedAddress = filterPayload["searchedAddress"];
    const zipcodeRegex = /\d{5}/;

    const lat = filterPayload["lat"];

    const lng = filterPayload["lng"];
    const zoom = filterPayload["zoom"];

    // Remove the keys from the object
    delete filterPayload["type"];
    delete filterPayload["searchedAddress"];
    delete filterPayload["lat"];
    delete filterPayload["lng"];
    delete filterPayload["zoom"];
    delete filterPayload["label"];

    setMapCenter({
      lat: lat,
      lng: lng,
    });

    if (toggleChecked) {
      if (type == "zipcode") {
        const zipcode = searchedAddress.match(zipcodeRegex)?.[0];
        let queryString = Object.keys(filterPayload)
          .map(
            (key) =>
              `&${encodeURIComponent(key)}=${encodeURIComponent(
                filterPayload[key]
              )}`
          )
          .join("");
        const queryParams = `?lat=${lat}&lng=${lng}&zoom=${zoom}&zipcode=${zipcode}&searched_address_format=${searchedAddress}`;
        const toggleStatus = `&isExclusiveProperty=${toggleChecked}`;
        const routeLink = `/landing/tenant/${tenant_name}/map-search/zipcode${queryParams}${toggleStatus}${queryString}`;
        navigate(routeLink);
      } else if (type == "citystate") {
        const addressComponents = searchedAddress
          .split(",")
          .map((item) => item.trim());
        const city = addressComponents[0];
        const state = addressComponents[1];
        const country = addressComponents[2];
        const queryParams = `?lat=${lat}&lng=${lng}&zoom=${zoom}&city=${city}&state=${state}&country=${country}&searched_address_format=${searchedAddress}`;
        let queryString = Object.keys(filterPayload)
          .map(
            (key) =>
              `&${encodeURIComponent(key)}=${encodeURIComponent(
                filterPayload[key]
              )}`
          )
          .join("");
        const toggleStatus = `&isExclusiveProperty=${toggleChecked}`;
        const routeLink = `/landing/tenant/${tenant_name}/map-search/citystate${queryParams}${toggleStatus}${queryString}`;
        navigate(routeLink);
      } else if (type == "address") {
        const addressComponents = searchedAddress
          .split(",")
          .map((item) => item.trim());
        const address = addressComponents[0];
        const [city, state, country] = addressComponents.slice(-3);
        const queryParams = `?lat=${lat}&lng=${lng}&zoom=${zoom}&address=${address}&city=${city}&state=${state}&country=${country}&searched_address_format=${searchedAddress}`;
        let queryString = Object.keys(filterPayload)
          .map(
            (key) =>
              `&${encodeURIComponent(key)}=${encodeURIComponent(
                filterPayload[key]
              )}`
          )
          .join("");
        const toggleStatus = `&isExclusiveProperty=${toggleChecked}`;
        const routeLink = `/landing/tenant/${tenant_name}/map-search/address${queryParams}${toggleStatus}${queryString}`;
        navigate(routeLink);
      } else if (type == "viewport") {
        const queryParams = `?lat=${mapCenter.lat}&lng=${mapCenter.lng}&zoom=${zoom}`;
        let queryString = Object.keys(filterPayload)
          .map(
            (key) =>
              `&${encodeURIComponent(key)}=${encodeURIComponent(
                filterPayload[key]
              )}`
          )
          .join("");
        const routeLink = `/landing/tenant/${tenant_name}/map-search/viewport${queryParams}&isExclusiveProperty=${!toggleChecked}${queryString}`;
        navigate(routeLink);
      } else {
        const queryParams = `?lat=${mapCenter.lat}&lng=${mapCenter.lng}&zoom=${zoom}`;
        let queryString = Object.keys(filterPayload)
          .map(
            (key) =>
              `&${encodeURIComponent(key)}=${encodeURIComponent(
                filterPayload[key]
              )}`
          )
          .join("");
        const routeLink = `/landing/tenant/${tenant_name}/map-search${queryParams}&isExclusiveProperty=${toggleChecked}${queryString}`;
        navigate(routeLink);
      }
    } else {
      if (type == "zipcode") {
        const zipcode = searchedAddress.match(zipcodeRegex)?.[0];
        let queryString = Object.keys(filterPayload)
          .map(
            (key) =>
              `&${encodeURIComponent(key)}=${encodeURIComponent(
                filterPayload[key]
              )}`
          )
          .join("");
        const queryParams = `?lat=${lat}&lng=${lng}&zoom=${zoom}&zipcode=${zipcode}&searched_address_format=${searchedAddress}`;
        const routeLink = `/landing/tenant/${tenant_name}/map-search/zipcode${queryParams}${queryString}`;
        navigate(routeLink);
      } else if (type == "citystate") {
        const addressComponents = searchedAddress
          .split(",")
          .map((item) => item.trim());
        const city = addressComponents[0];
        const state = addressComponents[1];
        const country = addressComponents[2];
        const queryParams = `?lat=${lat}&lng=${lng}&zoom=${zoom}&city=${city}&state=${state}&country=${country}&searched_address_format=${searchedAddress}`;
        let queryString = Object.keys(filterPayload)
          .map(
            (key) =>
              `&${encodeURIComponent(key)}=${encodeURIComponent(
                filterPayload[key]
              )}`
          )
          .join("");
        const routeLink = `/landing/tenant/${tenant_name}/map-search/citystate${queryParams}${queryString}`;
        navigate(routeLink);
      } else if (type == "address") {
        const addressComponents = searchedAddress
          .split(",")
          .map((item) => item.trim());
        const address = addressComponents[0];
        const [city, state, country] = addressComponents.slice(-3);
        const queryParams = `?lat=${lat}&lng=${lng}&zoom=${zoom}&address=${address}&city=${city}&state=${state}&country=${country}&searched_address_format=${searchedAddress}`;
        let queryString = Object.keys(filterPayload)
          .map(
            (key) =>
              `&${encodeURIComponent(key)}=${encodeURIComponent(
                filterPayload[key]
              )}`
          )
          .join("");
        const routeLink = `/landing/tenant/${tenant_name}/map-search/address${queryParams}${queryString}`;
        navigate(routeLink);
      } else if (type == "viewport") {
        const queryParams = `?lat=${mapCenter.lat}&lng=${mapCenter.lng}&zoom=${zoom}`;
        let queryString = Object.keys(filterPayload)
          .map(
            (key) =>
              `&${encodeURIComponent(key)}=${encodeURIComponent(
                filterPayload[key]
              )}`
          )
          .join("");
        const routeLink = `/landing/tenant/${tenant_name}/map-search/viewport${queryParams}${queryString}`;
        navigate(routeLink);
      } else {
        const queryParams = `?lat=${mapCenter.lat}&lng=${mapCenter.lng}&zoom=${zoom}`;
        let queryString = Object.keys(filterPayload)
          .map(
            (key) =>
              `&${encodeURIComponent(key)}=${encodeURIComponent(
                filterPayload[key]
              )}`
          )
          .join("");
        const routeLink = `/landing/tenant/${tenant_name}/map-search${queryParams}${queryString}`;
        navigate(routeLink);
      }
    }
    setShowSavedFilters(false);
  };

  const handleInputChange = (event) => {
    // Update the minYearBuilt state with the input value
    setminYearBuilt(event.target.value);
  };

  const priceToSIFormat = (price) => {
    if (price === 0) return "0";
    const units = ["", "K", "M", "B", "T"];
    const tier = Math.floor(Math.log10(Math.abs(price)) / 3);
    const scaled = price / Math.pow(10, tier * 3);
    const unit = units[tier] || "";
    return `${scaled.toFixed(0)}${unit}`;
  };

  // Fetch favorite properties

  const markfavourite = (property) => {
    if (isLoggedIn) {
      handleFavourites(property); // Fetch favourite properties if logged in
    } else {
      setShowLoginPopup(true);
      // Show login modal if not logged in
    }
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

  const options = [
    { value: "All", label: "ALL", image_url: AllProp },
    { value: "CONDO", label: "CONDO", image_url: Condo },
    { value: "HOUSE", label: "HOUSE", image_url: House },
    { value: "LAND", label: "LAND", image_url: Land },
    { value: "COMM_BUSINESS", label: "COMM_BUSINESS", image_url: business },
    { value: "OTHER", label: "OTHER", image_url: Others },
  ];

  return (
    <div>
      <div className="search-container">
        <img className="logo-home" src={sidelogo} alt="Logo" />
        <div className="search-input-container">
          <PlacesAutocomplete
            value={searchAddress}
            onChange={(address) => setSearchAddress(address)}
            onSelect={(address, placeId) => search(address, placeId)}
          >
            {({
              getInputProps,
              suggestions,
              getSuggestionItemProps,
              loading,
            }) => (
              <div className="suggestions-container">
                <input
                  className="search-input"
                  {...getInputProps({
                    placeholder: "Search by City, Address,Zipcode",
                  })}
                />
                <div className="suggestion-box">
                  {loading && <div>Loading...</div>}
                  {suggestions.map((suggestion) => {
                    const style = {
                      backgroundColor: suggestion.active ? "#F7F7F8" : "#fff",
                      padding: "8px",
                      cursor: "pointer",
                      width: "250px",
                      zIndex: 1000000,
                    };

                    const iconStyle = {
                      color: suggestion.active ? "#FF7575" : "inherit",
                      marginRight: "10px",
                    };

                    return (
                      <div
                        {...getSuggestionItemProps(suggestion)}
                        style={style}
                        key={suggestion.placeId}
                      >
                        <FontAwesomeIcon
                          icon={faMapMarkerAlt}
                          style={iconStyle}
                        />
                        {suggestion.description}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </PlacesAutocomplete>
        </div>
        <button className="search-button" onClick={handleFilterClick}>
          <div className="icon-color">
            <FontAwesomeIcon icon={faFilter} />
          </div>
        </button>
      </div>
      {/* 
      <div className="buttons text-center">
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={toggleChecked}
            onChange={handleToggle}
          />
          <span className="toggle-slider" />
        </label>

        <button
          className="btns btn-new-top text-center "
          onClick={handleSaveFilters}
        >
          Save search
        </button>
      </div> */}

      {isLoading && <Loader />}
      <div className="buttons-four">
        {showOptions && (
          <div className="sort-by-options">
            <div className="d-flex justify-content-between">
              <h5 className="fw-bold m-0">Sort results by</h5>
              <button
                className="border-0 bg-white"
                onClick={() => handleClick()}
              >
                <FontAwesomeIcon icon={faClose}></FontAwesomeIcon>
              </button>
            </div>
            <div className="sort-options">
              {sortOrderLimits.map((option) => (
                <button
                  key={option.value}
                  className={`sort-option-button w-100 ${
                    sortBy === option.value ? "active" : ""
                  }`}
                  onClick={() => handleSortChange(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {showFilters && (
          <div>
            <div className="filters-container">
              {/* Sidebar with vertical tabs */}
              <div className="vertical-tabs">
                <div
                  className={`tab-item ${
                    activeTab === "price" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("price")}
                >
                  Price
                </div>
                <div
                  className={`tab-item ${activeTab === "area" ? "active" : ""}`}
                  onClick={() => setActiveTab("area")}
                >
                  Area
                </div>
                <div
                  className={`tab-item ${activeTab === "beds" ? "active" : ""}`}
                  onClick={() => setActiveTab("beds")}
                >
                  Beds & Baths
                </div>
                <div
                  className={`tab-item ${
                    activeTab === "propertyType" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("propertyType")}
                >
                  Property Type
                </div>
                <div
                  className={`tab-item ${
                    activeTab === "moreFilters" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("moreFilters")}
                >
                  More Filters
                </div>
                <div
                  className={`tab-item ${
                    activeTab === "savedFilters" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("savedFilters")}
                >
                  Saved Filters
                </div>

                <div></div>
              </div>

              {/* Content for the active tab */}
              <div className="tab-content">
                {activeTab === "price" && (
                  <div className="scrollable-filter">
                    <h5 className="fw-bold mb-4">Price</h5>
                    <ReactSlider
                      className="horizontal-slider"
                      thumbClassName="thumb"
                      trackClassName="track"
                      min={Math.min(...numericOptions)}
                      max={Math.max(...numericOptions)}
                      step={25000}
                      value={[minValue, maxValue]}
                      onChange={handleSliderChange}
                      withTracks={true}
                    />
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginTop: "10px",
                      }}
                    >
                      <p>Min: {findLabel(minValue)}</p>
                      <p>Max: {findLabel(maxValue)}</p>
                    </div>
                    <div
                      className="mt-4"
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "20px",
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <label htmlFor="minInput">Minimum Price</label>
                        <input
                          id="minInput"
                          type="number"
                          className="price-filter"
                          value={minValue}
                          min={Math.min(...numericOptions)}
                          max={maxValue}
                          step={25000}
                          onChange={(e) => {
                            const newMin = Number(e.target.value);
                            if (
                              newMin <= maxValue &&
                              newMin >= Math.min(...numericOptions)
                            ) {
                              handleSliderChange([newMin, maxValue]);
                            }
                          }}
                        />
                      </div>

                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <label htmlFor="maxInput">Maximum Price</label>
                        <input
                          id="maxInput"
                          type="number"
                          className="price-filter"
                          value={maxValue}
                          min={minValue}
                          max={Math.max(...numericOptions)}
                          step={25000}
                          onChange={(e) => {
                            const newMax = Number(e.target.value);
                            if (
                              newMax >= minValue &&
                              newMax <= Math.max(...numericOptions)
                            ) {
                              handleSliderChange([minValue, newMax]);
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === "area" && (
                  <div className="scrollable-filter">
                    <h5 className="fw-bold mb-4">Area</h5>
                    <div className="d-flex flex-column gap-3">
                      <select
                        className="select-options"
                        value={areaMinValue}
                        onChange={(e) => setAreaMinValue(e.target.value)}
                      >
                        <option value="">Min Sq.Ft</option>
                        {areaOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <select
                        className="select-options"
                        value={areaMaxValue}
                        onChange={(e) => setAreaMaxValue(e.target.value)}
                      >
                        <option value="">Max Sq.Ft</option>
                        {areaOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
                {activeTab === "beds" && (
                  <div className="scrollable-filter">
                    <h5 className="fw-bold mb-4">Beds</h5>
                    {[1, 2, 3, 4].map((num) => (
                      <button
                        key={num}
                        className={`filter-option ${
                          bedFilter === num ? "active" : ""
                        }`}
                        onClick={() => setBedFilter(num)}
                      >
                        {num}+
                      </button>
                    ))}

                    <h5 className="fw-bold mb-4 mt-4">Baths</h5>
                    {[1, 2, 3, 4].map((num) => (
                      <button
                        key={num}
                        className={`filter-option ${
                          BathFilter === num ? "active" : ""
                        }`}
                        onClick={() => setBathFilter(num)}
                      >
                        {num}+
                      </button>
                    ))}
                  </div>
                )}
                {activeTab === "propertyType" && (
                  <div className="scrollable-filter">
                    <h5 className="fw-bold mb-4">Property Type</h5>

                    {options.map((option) => (
                      <label key={option.value}>
                        <input
                          type="checkbox"
                          value={option.value}
                          className="hidden-checkbox"
                          checked={propertyTypeValues.includes(option.value)}
                          onChange={handlePropertyTypeChange}
                        />

                        <span className="checkbox-label">
                          <img
                            className="mx-1"
                            style={{ width: "20px" }}
                            src={option.image_url}
                            alt={option.label}
                          ></img>
                          {option.label}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
                {activeTab === "moreFilters" && (
                  <div className="scrollable-filter">
                    <h5 className="fw-bold mb-4">More Filters</h5>
                    <div className="d-flex flex-column gap-3">
                      <select
                        className="select-options"
                        value={maxHOA}
                        onChange={(e) => setMaxHOA(e.target.value)}
                      >
                        <option value="">Max HOA Fees</option>
                        {maxHOALimits.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>

                      <div>
                        <p className="fw-bold">Filter By Min Year Built:</p>
                        <input
                          type="text"
                          value={minYearBuilt}
                          onChange={handleInputChange}
                          placeholder="Enter Minimum Built Year"
                          className="price-filter"
                        />
                      </div>

                      <select
                        className="select-options"
                        value={minStories}
                        onChange={(e) => setminStories(e.target.value)}
                      >
                        <option value="">Min Stories</option>
                        {CountLimits.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>

                      <select
                        className="select-options"
                        value={minParking}
                        onChange={(e) => setminParking(e.target.value)}
                      >
                        <option value="">Min Parking Count</option>
                        {CountLimits.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>

                      <select
                        className="select-options"
                        value={propertyStatus}
                        onChange={(e) => setpropertyStatus(e.target.value)}
                      >
                        <option value="">Property Status</option>
                        {PropertyStatusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>

                      <select
                        className="select-options"
                        value={listingBy}
                        onChange={(e) => setlistingBy(e.target.value)}
                      >
                        <option value="">Listed By</option>
                        {ListingOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>

                      <div className="options-filters">
                        <p className="fw-bold">Filter By Lot Size:</p>

                        <select
                          className="select-options"
                          value={minLotArea}
                          onChange={(e) => setminLotArea(e.target.value)}
                        >
                          <option value="">Min Lot Area</option>
                          {LotareaOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <select
                          className="select-options"
                          value={maxLotArea}
                          onChange={(e) => setmaxLotArea(e.target.value)}
                        >
                          <option value="">Max Lot Area</option>
                          {LotareaOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="options-filters">
                        <p className="fw-bold"> Filter By Time in Market:</p>
                        <select
                          className="select-options"
                          value={minDays}
                          onChange={(e) => setminDays(e.target.value)}
                        >
                          <option style={{ maxWidth: "fit-content" }} value="">
                            Min Days
                          </option>
                          {DaysOptions.map((option) => (
                            <option
                              style={{ maxWidth: "fit-content" }}
                              key={option.value}
                              value={option.value}
                            >
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <select
                          className="select-options"
                          value={maxDays}
                          onChange={(e) => setmaxDays(e.target.value)}
                        >
                          <option value="">Max Days</option>
                          {DaysOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="options-filters">
                        <p className="fw-bold">Filter By Cost/Sq.Ft:</p>

                        <select
                          className="select-options"
                          value={minCost}
                          onChange={(e) => setminCost(e.target.value)}
                        >
                          <option value="">Min Cost/Sq.ft</option>
                          {CostareaOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <select
                          className="select-options"
                          value={maxCost}
                          onChange={(e) => setmaxCost(e.target.value)}
                        >
                          <option value="">Max Cost/Sq.ft</option>
                          {CostareaOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="options-filters">
                        <p className="fw-bold">Filter By Options:</p>
                        <label>
                          <input
                            className="me-3 hidden-checkbox"
                            type="checkbox"
                            checked={excludeShortSales}
                            onChange={() =>
                              handleCheckboxChange("excludeShortSales")
                            }
                          />
                          <span className="checkbox-label">
                            Exclude Short Sales
                          </span>
                        </label>

                        <label>
                          <input
                            className="me-3 hidden-checkbox"
                            type="checkbox"
                            checked={fixerUpper}
                            onChange={() => handleCheckboxChange("fixerUpper")}
                          />
                          <span className="checkbox-label">Fixer Upper</span>
                        </label>

                        <label>
                          <input
                            className="me-3 hidden-checkbox"
                            type="checkbox"
                            checked={openHouses}
                            onChange={() => handleCheckboxChange("openHouses")}
                          />
                          <span className="checkbox-label"> Open Houses</span>
                        </label>

                        <label>
                          <input
                            className="me-3 hidden-checkbox"
                            type="checkbox"
                            checked={priceReduction}
                            onChange={() =>
                              handleCheckboxChange("priceReduction")
                            }
                          />
                          <span className="checkbox-label">
                            Price Reduction
                          </span>
                        </label>
                      </div>

                      <div className="options-filters">
                        <p className="fw-bold">Filter By Features:</p>
                        <label>
                          <input
                            className="me-3 hidden-checkbox"
                            type="checkbox"
                            checked={isGarage}
                            onChange={() => handleCheckboxChange("isGarage")}
                          />
                          <span className="checkbox-label"> Garage</span>
                        </label>

                        <label>
                          <input
                            className="me-3 hidden-checkbox"
                            type="checkbox"
                            checked={isAirCondition}
                            onChange={() =>
                              handleCheckboxChange("isAirCondition")
                            }
                          />
                          <span className="checkbox-label"> Air Condition</span>
                        </label>

                        <label>
                          <input
                            className="me-3 hidden-checkbox"
                            type="checkbox"
                            checked={isBasement}
                            onChange={() => handleCheckboxChange("isBasement")}
                          />
                          <span className="checkbox-label">Basement</span>
                        </label>

                        <label>
                          <input
                            className="me-3 hidden-checkbox"
                            type="checkbox"
                            checked={isHeating}
                            onChange={() => handleCheckboxChange("isHeating")}
                          />
                          <span className="checkbox-label">
                            Central Heating
                          </span>
                        </label>

                        <label>
                          <input
                            className="me-3 hidden-checkbox"
                            type="checkbox"
                            checked={isParking}
                            onChange={() => handleCheckboxChange("isParking")}
                          />
                          <span className="checkbox-label">Parking Space</span>
                        </label>

                        <label>
                          <input
                            className="me-3 hidden-checkbox"
                            type="checkbox"
                            checked={isSwimming}
                            onChange={() => handleCheckboxChange("isSwimming")}
                          />
                          <span className="checkbox-label">Swimming Pool</span>
                        </label>

                        <label>
                          <input
                            className="me-3 hidden-checkbox"
                            type="checkbox"
                            checked={greenHomes}
                            onChange={() => handleCheckboxChange("greenHomes")}
                          />
                          <span className="checkbox-label">
                            Green Homes Only
                          </span>
                        </label>

                        <label>
                          <input
                            className="me-3 hidden-checkbox"
                            type="checkbox"
                            checked={isLaundry}
                            onChange={() => handleCheckboxChange("isLaundry")}
                          />
                          <span className="checkbox-label">
                            In-unit Laundry
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === "savedFilters" && (
                  <div className="scrollable-filter">
                    <h5 className="fw-bold mb-4">Saved Filters</h5>
                    {savedFilters.length > 0 ? (
                      savedFilters.map((filter, index) => (
                        <div className="saved-filters text-center" key={index}>
                          <div>
                            {filter.label && (
                              <p className="saved-filter-details">
                                {filter.label}
                              </p>
                            )}
                          </div>
                          <button
                            className="saved-filter-btn"
                            onClick={() => handleSavedFilterSelection(index)}
                          >
                            Apply
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center">
                        <p className="no-filter">No Saved filters found!</p>
                      </div>
                    )}
                  </div>
                )}
                {/* Reset and Apply buttons */}
                <div className="filter-buttons">
                  <button
                    className="apply-reset-button"
                    onClick={handleResetFilters}
                    style={{ backgroundColor: "#FFC107" }}
                  >
                    Reset
                  </button>
                  <button
                    className="apply-reset-button"
                    onClick={handleApplyFilters}
                    style={{ backgroundColor: "#1976D2" }}
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {showMap && (
        <div
          style={{
            display:
              isLoading || showFilters || showSavedFilters || showOptions
                ? "none"
                : "block",
            width: "100%",
            height: "100%",
            position: "fixed",
          }}
        >
          <div
            style={{
              position: "fixed",
              bottom: "85px",
              left: "25%",
              zIndex: 1000,
              display: "flex",

              borderRadius: "5px",
              boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.3)",
            }}
          >
            <button
              onClick={() => handleButtonClick()}
              style={{
                backgroundColor: "#ffffff",
                border: "none",
                borderRadius: "5px 0px 0px 5px",
                padding: "10px 20px",

                cursor: "pointer",
              }}
            >
              <FontAwesomeIcon icon={faList} size="lg" /> List
            </button>
            <button
              onClick={() => handleSaveFilters()}
              style={{
                backgroundColor: "rgb(14 94 170)",
                color: "#fff",
                border: "none",
                borderRadius: "0px 5px 5px 0px",
                padding: "10px 20px",

                cursor: "pointer",
              }}
            >
              <FontAwesomeIcon icon={faSave} size="lg" /> Save
            </button>
          </div>

          <GoogleMap
            onLoad={onLoad}
            onDragEnd={() => handleMapMove(mapRef.current)}
            mapContainerStyle={{
              width: "100%",
              height: "82%",
            }}
            zoom={zoom}
            center={mapCenter}
            options={{
              mapTypeControl: false, // Disable map | satellite control
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "10px",
                left: "10px",
                zIndex: 10,
                background: "#fff",
                padding: "10px",
                borderRadius: "5px",
                boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
              }}
            >
              <div className="toggle-container">
                <input
                  type="checkbox"
                  id="toggle"
                  checked={istoggleChecked}
                  onChange={handleToggleChange}
                />
                <label htmlFor="toggle" className="toggle-label">
                  <span className="toggle-slider"></span>
                </label>
                <span className="toggle-text">Sold</span>
              </div>

              {istoggleChecked && (
                <select
                  className="filter-dropdown m-2"
                  onChange={(e) => handleDropdownChange(e.target.value)}
                >
                  <option value="">Select sold duration</option>
                  <option value="7">Last 1 week</option>
                  <option value="30">Last 1 month</option>
                  <option value="90">Last 3 months</option>
                  <option value="180">Last 6 months</option>
                  <option value="365">Last 1 year</option>
                  <option value="730">Last 2 years</option>
                  <option value="1095">Last 3 years</option>
                </select>
              )}
            </div>
            {markers.length > 0 && (
              <MarkerClusterer
                options={{
                  imagePath:
                    "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m",
                }}
              >
                {(clusterer) =>
                  markers.map((marker, index) => (
                    <Marker
                      key={index}
                      position={{ lat: marker.lat, lng: marker.lng }}
                      icon={{
                        url:
                          marker.status === "SOLD"
                            ? soldMarkerIcon
                            : markerIcon,
                        scaledSize: new window.google.maps.Size(40, 40),
                        labelOrigin: new window.google.maps.Point(20, 20),
                      }}
                      label={{
                        text: priceToSIFormat(marker.price),
                        color: "#ffffff",
                        fontSize: "10px",
                        fontWeight: "bold",
                      }}
                      clusterer={clusterer}
                      onClick={() => handleMarkerClick(marker)}
                    />
                  ))
                }
              </MarkerClusterer>
            )}

            {selectedMarker && (
              <InfoWindow
                position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
                onCloseClick={handleInfoWindowClose}
              >
                <Link
                  to={`/landing/tenant/${tenant_name}/property/${selectedMarker.property_descriptor_mls}/${selectedMarker.property_descriptor}`}
                  onClick={(e) => {
                    e.preventDefault();
                    window.open(e.currentTarget.getAttribute("href"), "_blank");
                  }}
                  style={{ textDecoration: "none" }}
                >
                  <div style={{ display: "flex" }}>
                    {selectedMarker?.imageUrl && (
                      <img
                        src={selectedMarker?.imageUrl}
                        alt="Property"
                        style={{ height: "100px", width: "80px" }}
                      />
                    )}
                    <div>
                      <p
                        style={{
                          margin: "10px",
                          fontWeight: "bold",
                          fontSize: "15px",
                        }}
                      >
                        ${selectedMarker?.price}
                      </p>
                      <p style={{ margin: "10px" }}>
                        {selectedMarker?.area || "N/A"} sqft
                      </p>
                      <p style={{ margin: "10px" }}>
                        Beds:{selectedMarker?.bedrooms || "N/A"}
                      </p>
                      <p style={{ margin: "10px" }}>
                        Baths: {selectedMarker?.bathrooms || "N/A"}
                      </p>
                    </div>
                  </div>
                </Link>
              </InfoWindow>
            )}
          </GoogleMap>
        </div>
      )}

      {!showMap && (
        <div
          style={{
            position: "relative",
            display:
              isLoading || showFilters || showSavedFilters || showOptions
                ? "none"
                : "block",
          }}
        >
          <div
            style={{
              position: "fixed",
              bottom: "85px",
              left: "20%",
              zIndex: 1000,
              display: "flex",

              borderRadius: "5px",
              boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.3)",
            }}
          >
            <button
              onClick={() => handleButtonClick()}
              style={{
                backgroundColor: "#ffffff",
                border: "none",
                borderRadius: "5px 0px 0px 5px",
                padding: "10px",

                cursor: "pointer",
              }}
            >
              <FontAwesomeIcon icon={faMap} size="lg" /> Map
            </button>
            <button
              onClick={() => handleClick()}
              style={{
                backgroundColor: "#ffffff",
                border: "none",

                padding: "10px",

                cursor: "pointer",
              }}
            >
              <FontAwesomeIcon icon={faArrowDownWideShort} size="lg" /> Sort
            </button>

            <button
              onClick={() => handleSaveFilters()}
              style={{
                backgroundColor: "rgb(14 94 170)",
                color: "#fff",
                border: "none",
                borderRadius: "0px 5px 5px 0px",
                padding: "10px",

                cursor: "pointer",
              }}
            >
              <FontAwesomeIcon icon={faSave} size="lg" /> Save
            </button>
          </div>
          {properties.length === 0 ? (
            <div className="no-property-found text-center">
              <img
                src={ErrorImg}
                className="error-img"
                alt="No properties found"
              />
              <h2>Property Not Found !</h2>
              <p>
                We weren't able to find any properties with the applied filters
                or searched address. Please change your selections.
              </p>
            </div>
          ) : (
            properties.map((property, index) => (
              <div
                key={index}
                onClick={() => handleCardClick(property)}
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
                <Slider {...settings}>
                  {property.imageUrl && property.imageUrl.length > 0 ? (
                    property.imageUrl.map((imageUrl, index) => (
                      <div key={index} className="image-wrapper">
                        <img
                          src={imageUrl}
                          alt={`Property Image ${index + 1}`}
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
                      </div>
                    ))
                  ) : (
                    <div>
                      <img
                        src={NoImage}
                        alt="No images available"
                        style={{ height: "100%", width: "100%" }}
                      />
                    </div>
                  )}
                </Slider>
                <div
                  style={{ position: "absolute", top: "10px", left: "10px" }}
                  className="d-flex gap-2"
                >
                  <button
                    style={{
                      backgroundColor:
                        property?.status === "SALE" ? "green" : "red",
                      color: "white",
                      border: "none",
                      borderRadius: "5px",
                      padding: "5px 10px",
                      fontWeight: "bold",
                      fontSize: "0.8rem",
                      cursor: "pointer",
                    }}
                  >
                    {property?.status === "SALE" ? "Active" : property?.status}
                  </button>
                  {property.virtual_tour &&
                    property.virtual_tour.length > 0 && (
                      <button
                        style={{
                          backgroundColor: "#5a14a0",
                          color: "white",
                          border: "none",
                          borderRadius: "5px",
                          padding: "5px 10px",
                          fontWeight: "bold",
                          fontSize: "0.8rem",
                          cursor: "pointer",
                        }}
                      >
                        3D Video & Tour
                      </button>
                    )}
                </div>
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
                        markfavourite(property);
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
          {showLoginPopup && (
            <LoginPopup
              showLoginPopup={showLoginPopup}
              onLoginStatusChange={handleLoginStatusChange}
            />
          )}
        </div>
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

      <Footer />
    </div>
  );
};

export default MapComponent;
