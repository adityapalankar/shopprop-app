import { Map, Marker } from 'google-maps-react';
import '../Contacts/contacts.css'
import Footer from '../../components/Footer/footer';
import axios from 'axios';
import Swal from 'sweetalert2';
// import UserJson from '..'; // Importing the UserJson file
import React, { useState, useEffect } from 'react';
import { ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails, Typography, Select, MenuItem, TextField, FormControl, InputLabel, FormGroup, TextareaAutosize, Button } from '@material-ui/core';
import { getUserAliasIdFromEmail, postPriorityApi } from '../Api/betaApi';
import apiModule from '../Api/apiModule'; 

const ContactForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setContactForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  // const [tenant_name, setTenant] = useState('');
  const userJson = localStorage.getItem('userJson');
  const user = userJson ? JSON.parse(userJson) : null;
  const tenant_name = user?.tenant_name ;
  // Function to handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setName('');
    setEmail('');
    setMessage('');
  };
  

  

  const showAlert = () => {
    Swal.fire({
      title: 'Success',
      text: 'Hey! We got your details, Will get back to you immediately',
      icon: 'success',
      confirmButtonText: 'OK',
      preConfirm: () => {
        // Refresh the page
        window.location.reload();
      },
    });
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
        e.target.elements.property_address?.value);
      console.log(prop_id)
      let payload = {
        ...contactForm,
        user_id_alias: response.UniqueAliasId,
        user_alias_email: e.target.elements.email?.value,
        request_type: "QA",
        property_id: tenant_name,
        property_address: "ALL",
        status_type: "active",
        tenant:tenant_name,
        DataAliasName: 'test',
			DataAliasType: 'private',
			parent_id: 'test_parent',
			assigned_to: 'test_alias',
			assignee_type: 'test_user'
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
  }
  return (
    <div>
      <div className='overflow-x-hiddens'>
        {/* Google Map component */}
        <div style={{ height: '330px', position: 'relative' }}>
          <Map
            style={{ width: '100%', height: '100%' }}
            google={window.google}
            zoom={14}
            initialCenter={{ lat: 37.7749, lng: -122.4194 }}
          >
            <Marker position={{ lat: 37.7749, lng: -122.4194 }} />
          </Map>
        </div>

        {/* Contact form */}
        <form onSubmit={contactFunction} style={{ marginTop: '20px', width: '98%', marginBottom:'6rem' }}>
          <h2 style={{ textAlign: 'center', color: '#333D79FF' }}>Quick Contacts</h2>
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
          <div className='send-btn'>
            <button className='w-75 mt-3 p-2 send-btn-2 btn' type="submit">Send</button>
          </div>
        </form>
      </div>
      <div>
      <Footer />
      </div>
    </div>
  );
};

export default ContactForm;
