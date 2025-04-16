import React, { useState, useEffect } from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
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
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import "../Offer-listing/offer-listing.css";
import Footer from "../../components/Footer/footer";
import { Accordion } from "@material-ui/core";
import axios from "axios";
import Swal from "sweetalert2";
import { getUserAliasIdFromEmail, postPriorityApi } from "../Api/betaApi";
import apiModule from "../Api/apiModule";

// import 'sweetalert2/dist/sweetalert2.css';

const OfferListing = () => {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  // const [tenant_name, setTenant] = useState('');
  // const [agreement, setAgreement] = useState('');
  const userJson = localStorage.getItem("userJson");

  const user = userJson ? JSON.parse(userJson) : null;
  const logo = user ? user.logo : null;
  const tenant_name = user?.tenant_name;
  const primaryColor = user?.colors_of_theme?.header_color;
  const jsonColor = {
    background: primaryColor,
  };
  document.documentElement.style.setProperty(
    "--background-color",
    jsonColor.background
  );
  const api_key = user?.api_key?.tenant_api_key;
  const agreement = user?.tenant_agreement?.agreement_link;
  const [offerValues, setOfferValues] = React.useState({
    name: "",
    email: "",
    suggested_purchase_price: "",
    amount: "",
    user_phone_no: "",
    mls_property: "",
    property_address: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    title_name: "",
    buyer_one_email: "",
    buyer_two_email: "",
    escalation_clause: "",
    escalation_increments: "",
    termite_clearance: "",
    sewer_fee: "",
    home_warranty: "",
    inspection: "",
    financing: "",
    appraisal: "",
    amount_putting_down: "",
    amount_deposit: "",
    loan_type: "",
    closing_date: "",
    expiration_date: "",
    additional_notes: "",
  });

  const [formValues, setFormValues] = useState({
    property_address: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    unit_number: "",
    property_type: "",
    shopprop_service: "",
    username: "",
    email: "",
    phone_number: "",
    analysis_homes_value: "",
    concierge_service: "",
    offer_review_date: "",
    owner_name: "",
    owner_city_state: "",
    owners_phone: "",
    owner_email: "",
    is_home_vacant: "",
    occupants_name: "",
    showing_seller_phone: "",
    listing_price: "",
    appliances_property: "",
    is_require_sign: "",
    is_require_lockbox: "",
    additional_notes: "",
    free_service: "",
    free_plus_service: "",
    buyer_agent_commission: "",
    sale_active_date: "",
    shopprop_service: "",
  });


  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
     
      setOfferValues((prevValues) => ({
        ...prevValues,
        email: userInfo || "",
        buyer_one_email: userInfo || "",
      
      }));

      setFormValues((prevValues) => ({
        ...prevValues,
        email: userInfo || "",
       
      }));
    }
  }, []);
  
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
  const [isChecked, setIsChecked] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  };

  const handleExpansionChange = () => {
    setExpanded(!expanded);
  };

  // Condition to set the initial expanded state
  const isExpandedByDefault = true;

  // Set the expanded state based on the condition
  useState(() => {
    setExpanded(isExpandedByDefault);
  }, []);

  const handleTabSelect = (index) => {
    setActiveTabIndex(index);
  };

  const handleChange2 = (e) => {
    const numericFields = ["amount", "amount_putting_down", "amount_deposit"];
    const { name, value } = e.target;
    setOfferValues((prevValues) => ({
      ...prevValues,
      [name]: numericFields.includes(name)?
        (value === "" ? "" : parseFloat(value)) : value,
    }));
  };


  

  const handleDateChange2 = (date, name) => {
    setOfferValues((prevValues) => ({
      ...prevValues,
      [name]: date,
    }));
  };

  const handleSubmit2 = (event) => {
    event.preventDefault();
    // Handle form submission
    console.log(formValues);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const handleDateChange = (date, name) => {
    setFormValues((prevValues) => ({
      ...prevValues,
      offer_review_date: date,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log(offerValues);
  };

  const offerValuesFunction = async (e) => {
    e.preventDefault();

    // var requiredHeaders = {
    //     'Content-Type': 'application/json',
    //     // Authorization: `Bearer ${this.jwtToken}`,
    //     tenant: tenant_name || '',
    //     // user: user_alias || '',
    //     apikey: api_key || '',
    //     company: 'shopprop',
    // };

    // const url = `https://ch30e1uez8.execute-api.us-east-1.amazonaws.com/prod/Iam/tenant/${tenant_name}/Alias/user_email/${offerValues.email}`;
    try {
      const api = await apiModule;
      const response = await api.getUserAliasIdFromEmail(offerValues.email);

      // const response = await axios.get(url, {
      //     headers: requiredHeaders,
      // })
      // console.log(response.data);

      let prop_id = makeManualAddressData(
        e.target.elements.property_address.value
      );
      console.log(prop_id);
      let payload = {
        ...offerValues,
        user_id_alias: response.UniqueAliasId,
        user_alias_email: e.target.elements.email.value,
        request_type: "MAKE_AN_OFFER",
        property_id: tenant_name + "_" + prop_id,
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
      //     headers: requiredHeaders,
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

  const formValuesFunction = async (e) => {
    e.preventDefault();

    // var requiredHeaders = {
    //     'Content-Type': 'application/json',
    //     // Authorization: `Bearer ${this.jwtToken}`,
    //     tenant: tenant_name || '',
    //     // user: user_alias || '',
    //     apikey: api_key || '',
    //     company: 'shopprop',
    // };

    // const url = `https://ch30e1uez8.execute-api.us-east-1.amazonaws.com/prod/Iam/tenant/${tenant_name}/Alias/user_email/${formValues.email}`;
    try {
      const api = await apiModule;
      const response = await api.getUserAliasIdFromEmail(formValues.email);

      // const response = await axios.get(url, {
      //     headers: requiredHeaders,
      // })
      // console.log(response.data);

      let prop_id = makeManualAddressData(
        e.target.elements.property_address.value
      );
      // console.log(response.data.UniqueAliasId)

      let payload = {
        ...formValues,
        user_id_alias: response.UniqueAliasId,
        user_alias_email: e.target.elements.email.value,
        request_type: "LIST_PROPERTY",
        property_id: tenant_name + "_" + prop_id,
        status_type: "active",
        tenant: tenant_name,
        DataAliasName: "test",
        DataAliasType: "private",
        parent_id: "test_parent",
        assigned_to: "test_alias",
        assignee_type: "test_user",
      };

      payload.owners_phone = {
        number: formValues.owner_phone,
        internationalNumber: "",
        nationalNumber: "",
        e164Number: formValues.owner_phone,
        countryCode: "US",
        dialCode: "+1",
      };

      payload.phone_number = {
        number: formValues.phone_number,
        internationalNumber: "",
        nationalNumber: "",
        e164Number: formValues.phone_number,
        countryCode: "US",
        dialCode: "+1",
      };

      payload.showing_seller_phone = [
        {
          number: formValues.showing_seller_phone,
          internationalNumber: "",
          nationalNumber: "",
          e164Number: formValues.showing_seller_phone,
          countryCode: "US",
          dialCode: "+1",
        },
      ];

      // const postUrl = `https://lsbm0an8i1.execute-api.us-east-1.amazonaws.com/prod/neuronService/priority`;
      // const postResponse = await axios.post(postUrl, payload, {
      //     headers: requiredHeaders,
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
  return (
    <div>
      <div className="container">
        <div>
          <div className="col-12">
            <div className="offer-listing-header h1-class">
              <h4>Guest Offers & Listings</h4>

    
            </div>  <div className="offer-listing-header p-3 pb-0 pt-0 text-center">
                   <h6 className="fw-bold">For better experience & enhanced services,</h6>
           <a href="https://dashboard.shopprop.com/#/activity/messages"> <button className="btn-new-top w-50">Visit our dashboard</button></a>
            <p className="p-2 m-0 fw-bold fs-5">OR</p>
                </div>
          
            <div>
              <Tabs selectedIndex={activeTabIndex} onSelect={handleTabSelect}>
                <TabList className="d-flex d-flexclass p-3 pt-0 text-center offer-listing-header mb-0">
                  <Tab
                    className={
                      activeTabIndex === 0 ? "active-tab class3" : "class2"
                    }
                    style={{ borderRadius: "5px 0 0 5px" }}
                  >
                    Make an Offer
                  </Tab>
                  <Tab
                    className={
                      activeTabIndex === 1 ? "active-tab class3" : "class2"
                    }
                    style={{ borderRadius: " 0 5px 5px 0" }}
                  >
                    List Property
                  </Tab>
                </TabList>
              

                <TabPanel>
                  {/* Content for the Start Property tab */}
                  <Accordion>
                    <ExpansionPanel>
                      <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6">Instructions</Typography>
                      </ExpansionPanelSummary>
                      <ExpansionPanelDetails>
                        <div className="row">
                          <div className="col-md-12">
                            <ol className="p-2">
                              <li className="list-style">
                                When we receive your form we will reach out to
                                the listing agent or seller. If we have any
                                questions or see a way for you to improve your
                                offer we will let you know you via email, text
                                or voice.
                              </li>
                              <li className="list-style">
                                We will draw up the contract and send it to you
                                for your electronic signatures. After you sign
                                it, we will open up negotiations with the
                                listing agent/seller.
                              </li>
                              <li className="list-style">
                                We will continue to reach out to the listing
                                agent/seller for updates about the competition
                                in case you want to adjust your offer.
                              </li>
                              <li className="list-style">
                                When the offer is accepted we will share next
                                steps with you and handle everything for you
                                through closing and any post-close issues.
                              </li>
                            </ol>

                            <p>
                              Email team@{tenant_name}.com, text our internal
                              team at 425-414-7234 or call us at 888-821-0556, 7
                              days a week with any questions. Licensed in AZ,
                              CA, HI, WA, VA and TX.
                            </p>
                            <p>In addition to the form please send us:</p>
                            <ul className="p-2 pt-0">
                              <li className="list-style">
                                Your pre-approval letter if getting a loan.
                              </li>
                              <li className="list-style">
                                Proof of funds - Investment account or bank
                                account with the account numbers blacked out.
                              </li>
                              <li className="list-style">
                                Our rebates are posted on our site and you don't
                                have to sign the Buyers Rebate Agreement for us
                                and you to adhere to the terms and receive the
                                rebate, but a contract is provided for those who
                                feel more comfortable having one. Buyers Rebate
                                Agreement{" "}
                                <a
                                  target="_blank"
                                  href={`https://${tenant_name}.com/${tenant_name}_guarantee.html`}
                                  style={{
                                    textDecoration: "underline",
                                    color: "#0e5eaa",
                                    cursor: "pointer",
                                  }}
                                >
                                  HERE
                                </a>
                              </li>
                              <li className="list-style">
                                {tenant_name} writes offers up based on what is
                                typical for that county or city.{" "}
                                <a
                                  target="_blank"
                                  href="https://www.ortconline.com/Web2/ProductsServices/InformationServices/WhoPays/Default.aspx"
                                  style={{
                                    textDecoration: "underline",
                                    color: "#0e5eaa",
                                    cursor: "pointer",
                                  }}
                                  className="fw-bolder"
                                >
                                  Know about Who pays for what?*
                                </a>
                              </li>
                              <li className="list-style">
                                The best offer wins! Scroll to the bottom of the
                                page to see what that looks like.
                              </li>
                            </ul>
                          </div>
                        </div>
                      </ExpansionPanelDetails>
                    </ExpansionPanel>
                  </Accordion>
                  <Accordion>
                    <ExpansionPanel
                      expanded={expanded}
                      onChange={handleExpansionChange}
                    >
                      <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6">Make an offer form</Typography>
                      </ExpansionPanelSummary>
                      <ExpansionPanelDetails>
                        <form
                          onSubmit={offerValuesFunction}
                          className="mb-5 row gap-2"
                        >
                          <FormGroup>
                            <TextField
                              label="Name"
                              name="name"
                              value={offerValues.name}
                              onChange={handleChange2}
                              required
                            />
                          </FormGroup>
                          <FormGroup>
                            <TextField
                              label="Email"
                              name="email"
                              value={offerValues.email}
                              onChange={handleChange2}
                              required
                              type="email"
                            />
                          </FormGroup>
                          <FormGroup className="p-3 ">
                            <label htmlFor="">
                              Provide me with a suggested purchase price. Please
                              do not request this if you already have received
                              one.
                            </label>
                            {/* <InputLabel>Choose option</InputLabel> */}
                            <Select
                              name="suggested_purchase_price"
                              value={offerValues.suggested_purchase_price}
                              onChange={handleChange2}
                            >
                              <MenuItem value="Yes">Yes</MenuItem>
                              <MenuItem value="No">No</MenuItem>
                            </Select>
                          </FormGroup>
                          <FormGroup>
                            <TextField
                              label="Amount to offer($)"
                              name="amount"
                              type="number"
                              value={offerValues.amount}
                              onChange={handleChange2}
                              required
                            />
                          </FormGroup>
                          <FormGroup>
                            <TextField
                              label="User Phone Number"
                              name="user_phone_no"
                              type="tel"
                              value={offerValues.user_phone_no}
                              onChange={handleChange2}
                              required
                            />
                          </FormGroup>
                          <FormGroup>
                            <TextField
                              label="Enter MLS ID"
                              name="mls_property"
                              value={offerValues.mls_property}
                              onChange={handleChange2}
                            />
                          </FormGroup>
                          <FormGroup className="p-3 pb-0">
                            <h6 className="m-0">
                              Property address of the home you are making an
                              OFFER on.
                            </h6>
                          </FormGroup>
                          <FormGroup>
                            <TextField
                              label="Property Address"
                              name="property_address"
                              value={offerValues.property_address}
                              onChange={handleChange2}
                              required
                            />
                          </FormGroup>
                          <FormGroup>
                            <TextField
                              label="Street"
                              name="street"
                              value={offerValues.street}
                              onChange={handleChange2}
                              required
                            />
                          </FormGroup>
                          <FormGroup>
                            <TextField
                              label="City"
                              name="city"
                              value={offerValues.city}
                              onChange={handleChange2}
                              required
                            />
                          </FormGroup>
                          <FormGroup>
                            <TextField
                              label="State"
                              name="state"
                              value={offerValues.state}
                              onChange={handleChange2}
                              required
                            />
                          </FormGroup>
                          <FormGroup>
                            <TextField
                              label="Zipcode"
                              name="zipcode"
                              value={offerValues.zipcode}
                              onChange={handleChange2}
                              required
                            />
                          </FormGroup>
                          <FormGroup>
                            <TextField
                              label="Title Name"
                              name="title_name"
                              value={offerValues.title_name}
                              onChange={handleChange2}
                            />
                          </FormGroup>
                         
                          <FormGroup>
                            <TextField
                              label="Buyer One Email"
                              name="buyer_one_email"
                              value={offerValues.buyer_one_email}
                              onChange={handleChange2}
                              required
                              type="email"
                            />
                          </FormGroup>
                          <FormGroup>
                            <TextField
                              label="Buyer Two Email"
                              name="buyer_two_email"
                              value={offerValues.buyer_two_email}
                              onChange={handleChange2}
                            />
                          </FormGroup>
                          <FormGroup>
                            <TextField
                              label="Escalation Clause"
                              name="escalation_clause"
                              value={offerValues.escalation_clause}
                              onChange={handleChange2}
                            />
                          </FormGroup>
                          <FormGroup>
                            <TextField
                              label="Escalation Increments"
                              name="escalation_increments"
                              value={offerValues.escalation_increments}
                              onChange={handleChange2}
                            />
                          </FormGroup>
                          <FormGroup className="p-3 ">
                            <label htmlFor="">
                              (CA and AZ only)Seller to pay for Termite Section
                              1 Clearance
                            </label>
                            {/* <InputLabel>Choose option</InputLabel> */}
                            <Select
                              name="termite_clearance"
                              value={offerValues.termite_clearance}
                              onChange={handleChange2}
                            >
                              <MenuItem value="Yes">Yes</MenuItem>
                              <MenuItem value="No">No</MenuItem>
                            </Select>
                          </FormGroup>

                          <FormGroup className="p-3 ">
                            <label htmlFor="">
                              (WA Only) Assume sewer capacity fee. Learn More*
                            </label>
                            {/* <InputLabel>Choose option</InputLabel> */}
                            <Select
                              name="sewer_fee"
                              value={offerValues.sewer_fee}
                              onChange={handleChange2}
                            >
                              <MenuItem value="Yes">Yes</MenuItem>
                              <MenuItem value="No">No</MenuItem>
                            </Select>
                          </FormGroup>

                          <FormGroup className="p-3 ">
                            <label htmlFor="">
                              Seller to pay for Home Warranty.
                              <br />
                              Typically CA only.
                            </label>
                            {/* <InputLabel>Choose option</InputLabel> */}
                            <Select
                              name="home_warranty"
                              value={offerValues.home_warranty}
                              onChange={handleChange2}
                            >
                              <MenuItem value="Yes">Yes</MenuItem>
                              <MenuItem value="No">No</MenuItem>
                            </Select>
                          </FormGroup>

                          <FormGroup className="p-3 ">
                            <label htmlFor="">Contingent on Inspection</label>

                            {/* <InputLabel>Choose option</InputLabel> */}
                            <Select
                              name="inspection"
                              value={offerValues.inspection}
                              onChange={handleChange2}
                            >
                              <MenuItem value="Yes">Yes</MenuItem>
                              <MenuItem value="No">No</MenuItem>
                            </Select>
                          </FormGroup>

                          <FormGroup className="p-3 ">
                            <label htmlFor="">Contingent on Financing</label>
                            {/* <InputLabel>Choose option</InputLabel> */}
                            <Select
                              name="financing"
                              value={offerValues.financing}
                              onChange={handleChange2}
                            >
                              <MenuItem value="Yes">Yes</MenuItem>
                              <MenuItem value="No">No</MenuItem>
                            </Select>
                          </FormGroup>

                          <FormGroup className="p-3 ">
                            <label htmlFor="">Contingent on Appraisal</label>

                            {/* <InputLabel>Choose option</InputLabel> */}
                            <Select
                              name="appraisal"
                              value={offerValues.appraisal}
                              onChange={handleChange2}
                            >
                              <MenuItem value="Yes">Yes</MenuItem>
                              <MenuItem value="No">No</MenuItem>
                            </Select>
                          </FormGroup>
                          <FormGroup className="p-3 pb-0">
                            <h6 className="m-0">
                              Please make sure to email us your proof of funds
                              and a pre approval letter if you are getting a
                              loan. Most agents do not take letters from buyers
                              anymore because recent rulings have stated they
                              can be a violation of Fair Housing Laws.
                            </h6>
                          </FormGroup>
                          <FormGroup>
                            <TextField
                              type="number"
                              label="Amount Putting Down($)"
                              name="amount_putting_down"
                              value={offerValues.amount_putting_down}
                              onChange={handleChange2}
                            />
                          </FormGroup>
                          <FormGroup>
                            <TextField
                              label="Amount Deposit($)"
                              name="amount_deposit"
                              type="number"
                              value={offerValues.amount_deposit}
                              onChange={handleChange2}
                            />
                          </FormGroup>
                          <FormGroup className="p-3 ">
                            <label htmlFor="">Type of Loan</label>
                            {/* <InputLabel>Choose option</InputLabel> */}
                            <Select
                              name="loan_type"
                              value={offerValues.loan_type}
                              onChange={handleChange2}
                            >
                              <MenuItem value="Conventional-First">
                                Conventional First
                              </MenuItem>
                              <MenuItem value="Conventional-Second">
                                Conventional Second
                              </MenuItem>
                              <MenuItem value="Bridge">Bridge</MenuItem>
                              <MenuItem value="VA">VA</MenuItem>
                              <MenuItem value="FHA">FHA</MenuItem>
                              <MenuItem value="No-Loan">
                                No Loan - Cash Offer
                              </MenuItem>
                            </Select>
                          </FormGroup>

                          {/* DatePicker for Closing Date */}
                          <FormGroup className="p-3 ">
                            <label htmlFor="offer_review_date">
                              Closing Date
                            </label>
                            <TextField
                              type="date"
                              name="closing_date"
                              value={offerValues.closing_date}
                              onChange={(e) =>
                                handleDateChange2(
                                  e.target.value,
                                  "closing_date"
                                )
                              }
                            />
                          </FormGroup>
                          <FormGroup className="p-3 ">
                            {/* DatePicker for Expiration Date */}
                            <label htmlFor="offer_review_date">
                              Expiration Date
                            </label>
                            <TextField
                              type="date"
                              name="expiration_date"
                              value={offerValues.expiration_date}
                              onChange={(e) =>
                                handleDateChange2(
                                  e.target.value,
                                  "expiration_date"
                                )
                              }
                            />
                          </FormGroup>
                          <FormGroup className="p-3 pb-0">
                            <TextareaAutosize
                              className="p-2"
                              minRows={4}
                              placeholder="Additional Notes"
                              name="additional_notes"
                              value={offerValues.additional_notes}
                              onChange={handleChange2}
                            />
                          </FormGroup>
                          <div className="center-position col-12">
                            <label className="m-2 text-start">
                              <input
                                className="m-1"
                                type="checkbox"
                                checked={isChecked}
                                onChange={handleCheckboxChange}
                              />
                              I agree to the
                              <a className="ps-1" href={agreement}>
                                terms and conditions
                              </a>
                            </label>
                          </div>
                          <div className="mt-3 center-position">
                            <Button
                              type="submit"
                              variant="contained"
                              disabled={!isChecked}
                              color="primary"
                            >
                              Submit
                            </Button>
                          </div>
                        </form>
                      </ExpansionPanelDetails>
                    </ExpansionPanel>
                  </Accordion>
                  {/* Add your Start Property tab content here */}
                </TabPanel>

                <TabPanel>
                  <Accordion>
                    <ExpansionPanel>
                      <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6">Instructions</Typography>
                      </ExpansionPanelSummary>
                      <ExpansionPanelDetails>
                        <div className="row">
                          <div className="col-md-12">
                            <ol className="p-2">
                              <li className="list-style">
                                Please fill out the following form below to
                                start the listing process. If you would like an
                                exact value of your home from, please let us
                                know on the form below.
                              </li>
                              <li className="list-style">
                                Upon receiving your form below, we will send you
                                the next steps required for your listing to be
                                live.
                              </li>
                            </ol>

                            <p>
                              ShopProp Full/Full Plus provides 7-day top-tier
                              service. Free/Free Plus includes email support,
                              upgradeable anytime. Full Plus enables dual
                              representation, reducing your listing fee by 50%,
                              and enhances appeal by letting buyers know they
                              receive the commission back when purchasing via
                              ShopProp.
                            </p>
                            <p>
                              The information can be adjusted after you submit.
                              We will not go live until you sign the listing
                              agreement and approve the rough draft of your
                              listing.
                            </p>
                          </div>
                        </div>
                      </ExpansionPanelDetails>
                    </ExpansionPanel>
                  </Accordion>
                  <Accordion>
                    {/* Content for the List Property tab */}
                    {/* <MuiPickersUtilsProvider utils={DateFnsUtils}> */}
                    <ExpansionPanel
                      expanded={expanded}
                      onChange={handleExpansionChange}
                    >
                      <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6">List Property form</Typography>
                      </ExpansionPanelSummary>
                      <ExpansionPanelDetails>
                        <form
                          onSubmit={formValuesFunction}
                          className="mb-5 row gap-2"
                        >
                          <FormGroup>
                            <TextField
                              label="Property Address"
                              name="property_address"
                              value={formValues.property_address}
                              onChange={handleChange}
                              required
                            />
                          </FormGroup>
                          <FormGroup>
                            <TextField
                              label="Street"
                              name="street"
                              value={formValues.street}
                              onChange={handleChange}
                              required
                            />
                          </FormGroup>
                          <FormGroup>
                            <TextField
                              label="City"
                              name="city"
                              value={formValues.city}
                              onChange={handleChange}
                              required
                            />
                          </FormGroup>
                          <FormGroup>
                            <TextField
                              label="State"
                              name="state"
                              value={formValues.state}
                              onChange={handleChange}
                              required
                            />
                          </FormGroup>
                          <FormGroup>
                            <TextField
                              label="Zipcode"
                              name="zipcode"
                              value={formValues.zipcode}
                              onChange={handleChange}
                              required
                            />
                          </FormGroup>
                          <FormGroup>
                            <TextField
                              label="Unit Number"
                              name="unit_number"
                              value={formValues.unit_number}
                              onChange={handleChange}
                            />
                          </FormGroup>
                          <FormGroup className="p-3 ">
                            <InputLabel>Property Type</InputLabel>
                            <Select
                              name="property_type"
                              value={formValues.property_type}
                              onChange={handleChange}
                            >
                              <MenuItem value="Residential">
                                Residential
                              </MenuItem>
                              <MenuItem value="Townhome">
                                Condo/Townhome
                              </MenuItem>
                              <MenuItem value="Land">Land</MenuItem>
                            </Select>
                          </FormGroup>
                          <FormGroup className="p-3 ">
                            <InputLabel>ShopProp Service</InputLabel>
                            <Select
                              name="shopprop_service"
                              value={formValues.shopprop_service}
                              onChange={handleChange}
                            >
                              <MenuItem value="Shopprop Full">Shopprop Full</MenuItem>
                              <MenuItem value="Shopprop Full Plus">Shopprop Full Plus</MenuItem>
                              <MenuItem value="Shopprop Free">Shopprop Free</MenuItem>
                              <MenuItem value="Shopprop Free Plus">Shopprop Free Plus</MenuItem>
                            </Select>
                          </FormGroup>
                          <FormGroup>
                            <TextField
                              label="Username"
                              name="username"
                              value={formValues.username}
                              onChange={handleChange}
                              required
                            />
                          </FormGroup>
                          <FormGroup>
                            <TextField
                              label="Email"
                              name="email"
                              value={formValues.email}
                              onChange={handleChange}
                              required
                              type="email"
                            />
                          </FormGroup>
                          <FormGroup>
                            <TextField
                              type="tel"
                              label="Phone Number"
                              name="phone_number"
                              value={formValues.phone_number}
                              onChange={handleChange}
                              required
                            />
                          </FormGroup>
                          <FormGroup className="p-3 ">
                            <InputLabel>Analysis Homes Value</InputLabel>
                            <Select
                              name="analysis_homes_value"
                              value={formValues.analysis_homes_value}
                              onChange={handleChange}
                            >
                              <MenuItem value="Yes">Yes</MenuItem>
                              <MenuItem value="No">No</MenuItem>
                            </Select>
                          </FormGroup>
                          <FormGroup className="p-3 ">
                            <InputLabel>Concierge Service</InputLabel>
                            <Select
                              name="concierge_service"
                              value={formValues.concierge_service}
                              onChange={handleChange}
                            >
                              <MenuItem value="Yes">Yes</MenuItem>
                              <MenuItem value="No">No</MenuItem>
                            </Select>
                          </FormGroup>
                          <FormGroup>
                            <label htmlFor="offer_review_date">
                              Offer Review Date
                            </label>
                            <TextField
                              type="date"
                              name="closing_date"
                              value={formValues.offer_review_date}
                              onChange={(e) =>
                                handleDateChange(
                                  e.target.value,
                                  "offer_review_date"
                                )
                              }
                            />
                          </FormGroup>
                          <FormGroup>
                            <TextField
                              label="Owner Name"
                              name="owner_name"
                              value={formValues.owner_name}
                              onChange={handleChange}
                            />
                          </FormGroup>
                          <FormGroup>
                            <TextField
                              label="Owner City/State"
                              name="owner_city_state"
                              value={formValues.owner_city_state}
                              onChange={handleChange}
                            />
                          </FormGroup>
                          <FormGroup>
                            <TextField
                              label="Owner Phone"
                              name="owner_phone"
                              value={formValues.owner_phone}
                              onChange={handleChange}
                            />
                          </FormGroup>
                          <FormGroup>
                            <TextField
                              label="Owner Email"
                              name="owner_email"
                              value={formValues.owner_email}
                              onChange={handleChange}
                            />
                          </FormGroup>
                          <FormGroup>
                          <InputLabel>Is Home Vacant</InputLabel>
                            <Select
                              name="is_home_vacant"
                              value={formValues.is_home_vacant}
                              onChange={handleChange}
                            >
                              <MenuItem value="Yes">Yes</MenuItem>
                              <MenuItem value="No">No</MenuItem>
                            </Select>
                          </FormGroup>
                          <FormGroup>
                            <TextField
                              label="Occupants Name"
                              name="occupants_name"
                              value={formValues.occupants_name}
                              onChange={handleChange}
                            />
                          </FormGroup>
                          <FormGroup>
                            <TextField
                              label="Showing Seller Phone"
                              name="showing_seller_phone"
                              value={formValues.showing_seller_phone}
                              onChange={handleChange}
                            />
                          </FormGroup>
                          <FormGroup>
                            <TextField
                              label="Listing Price"
                              name="listing_price"
                              value={formValues.listing_price}
                              onChange={handleChange}
                            />
                          </FormGroup>
                          <FormGroup>
                            <TextField
                              label="Enter Appliances at Property"
                              name="appliances_property"
                              value={formValues.appliances_property}
                              onChange={handleChange}
                            />
                          </FormGroup>
                          <FormGroup className="p-3 ">
                            <InputLabel>Is Require Sign</InputLabel>
                            <Select
                              name="is_require_sign"
                              value={formValues.is_require_sign}
                              onChange={handleChange}
                            >
                              <MenuItem value="Yes">Yes</MenuItem>
                              <MenuItem value="No">No</MenuItem>
                            </Select>
                          </FormGroup>
                          <FormGroup className="p-3 ">
                            <InputLabel>Is Require Lockbox</InputLabel>
                            <Select
                              name="is_require_lockbox"
                              value={formValues.is_require_lockbox}
                              onChange={handleChange}
                            >
                              <MenuItem value="Yes">Yes</MenuItem>
                              <MenuItem value="No">No</MenuItem>
                            </Select>
                          </FormGroup>
                          <FormGroup className="p-3 pb-0">
                            <TextareaAutosize
                              className="p-2"
                              minRows={4}
                              placeholder="Additional Notes"
                              name="additional_notes"
                              value={formValues.additional_notes}
                              onChange={handleChange}
                            />
                          </FormGroup>
                          <div className="center-position col-12">
                            <label className="m-2 text-start">
                              <input
                                className="m-1"
                                type="checkbox"
                                checked={isChecked}
                                onChange={handleCheckboxChange}
                              />
                              I agree to the
                              <a className="ps-1" href={agreement}>
                                terms and conditions
                              </a>
                            </label>
                          </div>
                          <div className="col-12 mt-3 center-position">
                            <Button
                              type="submit"
                              variant="contained"
                              disabled={!isChecked}
                              color="primary"
                            >
                              Submit
                            </Button>
                          </div>
                        </form>
                      </ExpansionPanelDetails>
                    </ExpansionPanel>
                  </Accordion>
                  {/* </MuiPickersUtilsProvider> */}
                  {/* Add your List Property tab content here */}
                </TabPanel>
              </Tabs>
            </div>
           
          </div>
        </div>
      </div>
      <div>
        <Footer />
      </div>
    </div>
  );
};

export default OfferListing;
