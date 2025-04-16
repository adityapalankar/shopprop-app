import React, { useEffect, useState } from "react";
import "./calculator.css";
import apiModule from "../Api/apiModule";


const Calculator = () => {
  const [propertyPrice, setPropertyPrice] = useState(0);
  const commission = 3;
  const buyerShowings = 0;
  const buyerOfferings = 0;
  const buyerAssistances = 0;

  const sellerCommission = 3;
  const [rebateAmount, setRebateAmount] = useState(0);
  const [savingsAmount, setSavingsAmount] = useState(0);
  // Calculate Buyer's Rebate
  const calculateRebate = async (price) => {
    const calcVal = parseInt(price) || 100000;
    const api = await apiModule;
    const response = await api.fetchBuyerRebateValues(calcVal, {
      homeInspection: buyerAssistances,
      homeOffersApplied: buyerOfferings,
      showings: buyerShowings,
      commission: commission / 100,
    });
    console.log(response, "response");
    return response.shopPropRebate;
  };

  // Calculate Seller’s Savings
  const calculateSavings = async (price) => {
    const calcVal = parseInt(price) || 100000;
    const api = await apiModule;
    const response = await api.fetchSellerSavesValues(
      calcVal,
      commission / 100,
      sellerCommission / 100
    );
    console.log(response, "seller response");
    return response.ShopPropFull.shopPropRebate;
  };

  const handleInputChange = (e) => {
    setPropertyPrice(e.target.value);
  };

  const gotoCalculations = () =>{
    console.log("cal")
    window.open('https://www.shopprop.com/#/calculations?hideHeaderFooter=true')
  }

  const fetchRebate = async () => {
    const rebateAmount = await calculateRebate(propertyPrice);
    const savingsAmount = await calculateSavings(propertyPrice);
    setRebateAmount(rebateAmount);
    setSavingsAmount(savingsAmount);
  };

  const handleCalculateClick = async () => {
    await fetchRebate();
  };


  return (
    <div className="calculator-container mb-2">
        <label className="pb-2 text-white">Enter Property Price</label>
      <div
        style={{ position: "relative", display: "inline-block"}}
        className="mb-3 w-100"
      >
        <span
          style={{
            position: "absolute",
            left: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            pointerEvents: "none",
          }}
        >
          $
        </span>
        <input
          type="number"
          placeholder="Enter Property Price"
          value={propertyPrice}
          onChange={handleInputChange}
          style={{ paddingLeft: "25px", fontSize: "1em" }}
          className="input-property"
        />
        <button
        onClick={handleCalculateClick}
       className="calculate-btn"
      >
        Calculate
      </button>
      </div>

      <div className="d-flex gap-2">
        <div className="results">
          <p>
            Buyer's Rebate<br></br>
            <span className="fs-1 fw-bold">
              $
              {rebateAmount.toLocaleString("en-US", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </span>
          </p>
        </div>

        <div className="results">
          <p>
            Seller's Savings<br></br>
            <span className="fs-1 fw-bold">
              $
              {savingsAmount.toLocaleString("en-US", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </span>
          </p>
        </div>
      </div>
      <button className="explore-button w-auto p-1 border-0 fw-bold mt-3 " onClick={gotoCalculations}>
        
          Explore the calculations of your Savings & Rebates
        
      </button>
    </div>
  );
};

export default Calculator;
