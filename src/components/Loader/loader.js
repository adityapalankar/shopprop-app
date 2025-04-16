import React from 'react';
import loader from '../../assets/loading__.gif'
import loader2 from '../../assets/loader.gif'


const Loader = () => {
    return (
        <div style={{ width: "100%", height: "83vh", background: "#333d79ff" }} className="loader text-center">

            {/* <img style={{ width: "100%", height: "60vh" }} src={loader} /> */}
            <img style={{ width: "100%", height: "50vh" }} src={loader2} />
            <h1 style={{ margin: "0px", color: "white" }}>Loading....</h1>
        </div>
    );
};

export default Loader;
