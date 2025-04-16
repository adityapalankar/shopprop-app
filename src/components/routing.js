import React from 'react';
import { BrowserRouter as Router, Route,Routes } from 'react-router-dom';
import Listing from './Listing/Listing';

const routing = () => {
    return (
        <Router>
      <Routes>
        <Route exact path="/listing" component={Listing} />
        {/* <Route path="/about" component={About} />
        <Route path="/contact" component={Contact} /> */}
        {/* <Route component={NotFound} /> */}
      </Routes>
    </Router>
    );
  };export default routing