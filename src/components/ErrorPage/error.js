import React from 'react';
import ErrorImg from '../../assets/error-page.png'

const Error = () => {
  return (
    <div className='text-center' style={{height:"100vh"}}>
      <img style={{width:"100%"}}  src={ErrorImg} alt="Error" />
      <h2>Something went wrong !!</h2>
      <p>Please try again later.</p>
    </div>
  );
};

export default Error;
