import axios from "axios";
import { Amplify, Auth } from "aws-amplify";

const userJson = localStorage.getItem("userJson");
const user = userJson ? JSON.parse(userJson) : null;
const tenant_name = user?.tenant_name;
const api_key = user?.api_key?.tenant_api_key;
const useralias = localStorage.getItem("userAliasID");

if (user) {
  Amplify.configure({
    Auth: user.cognito,
  });
}

const getAccessToken = async () => {
  try {
    const res = await Auth.currentSession();
    const accessToken = res.getAccessToken();
    const token = accessToken.getJwtToken();
    return token;
  } catch (error) {
    console.error("Error fetching access token:", error);
    throw error;
  }
};

const setRequiredHeaders = async () => {
  const useralias = localStorage.getItem("userAliasID");
  try {
    const token = await getAccessToken();
    const requiredHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      tenant: tenant_name || "",
      user: useralias || "",
      apikey: api_key || "",
      company: "shopprop",
    };
    return requiredHeaders;
  } catch (error) {
    console.error("Error setting headers:", error);
    throw error;
  }
};

const headersForPropertySearch = () => {
  return {
    tenant: tenant_name,
  };
};

export const getUserAliasIdFromEmail = async (email) => {
  let requiredHeaders = await setRequiredHeaders();
  try {
    const url = `https://ch30e1uez8.execute-api.us-east-1.amazonaws.com/prod/Iam/tenant/${tenant_name}/Alias/user_email/${email}`;
    const response = await axios.get(url, {
      headers: requiredHeaders,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user id:", error);
    throw error;
  }
};

export const postPriorityApi = async (payload) => {
  let requiredHeaders = await setRequiredHeaders();
  try {
    const postUrl = `https://lsbm0an8i1.execute-api.us-east-1.amazonaws.com/prod/neuronService/priority`;
    const postResponse = await axios.post(postUrl, payload, {
      headers: requiredHeaders,
    });
    return postResponse.data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};

export const privateDataByCoordinates = async (payload, tenant_name) => {
  try {
    const postUrl = `https://mfdx9kmod7.execute-api.us-east-1.amazonaws.com/private_listing_service/prod/private/tenant/${tenant_name}/viewport`;
    const postResponse = await axios.post(postUrl, payload, {
      headers: headersForPropertySearch(),
    });
    return postResponse.data;
  } catch (error) {
    console.error("Error fetching user id:", error);
    throw error;
  }
};

export const publicDataByCoordinates = async (payload, tenant_name) => {
  try {
    const postUrl = `https://mz5wkrw9e4.execute-api.us-east-1.amazonaws.com/property_listing_service/prod/public/tenant/${tenant_name}/viewport`;
    const postResponse = await axios.post(postUrl, payload, {
      headers: headersForPropertySearch(),
    });
    return postResponse.data;
  } catch (error) {
    console.error("Error fetching user id:", error);
    throw error;
  }
};

export const privateDataByCityState = async (
  payload,
  city,
  state,
  tenant_name
) => {
  try {
    const postUrl = `https://mfdx9kmod7.execute-api.us-east-1.amazonaws.com/private_listing_service/prod/private/tenant/${tenant_name}/city/${city}/state/${state}`;
    const postResponse = await axios.post(postUrl, payload, {
      headers: headersForPropertySearch(),
    });
    return postResponse.data;
  } catch (error) {
    console.error("Error fetching user id:", error);
    throw error;
  }
};

export const publicDataByCityState = async (
  payload,
  city,
  state,
  tenant_name
) => {
  try {
    const postUrl = `https://mz5wkrw9e4.execute-api.us-east-1.amazonaws.com/property_listing_service/prod/public/tenant/${tenant_name}/city/${city}/state/${state}`;
    const postResponse = await axios.post(postUrl, payload, {
      headers: headersForPropertySearch(),
    });
    return postResponse.data;
  } catch (error) {
    console.error("Error fetching user id:", error);
    throw error;
  }
};

export const privateDataByZipcode = async (payload, zipcode, tenant_name) => {
  try {
    const postUrl = `https://mfdx9kmod7.execute-api.us-east-1.amazonaws.com/private_listing_service/prod/private/tenant/${tenant_name}/zipcode/${zipcode}`;
    const postResponse = await axios.post(postUrl, payload, {
      headers: headersForPropertySearch(),
    });
    return postResponse.data;
  } catch (error) {
    console.error("Error fetching user id:", error);
    throw error;
  }
};

export const publicDataByZipcode = async (payload, zipcode, tenant_name) => {
  try {
    const postUrl = `https://mz5wkrw9e4.execute-api.us-east-1.amazonaws.com/property_listing_service/prod/public/tenant/${tenant_name}/zipcode/${zipcode}`;
    const postResponse = await axios.post(postUrl, payload, {
      headers: headersForPropertySearch(),
    });
    return postResponse.data;
  } catch (error) {
    console.error("Error fetching user id:", error);
    throw error;
  }
};

export const privateDataByAddress = async (payload, address, tenant_name) => {
  try {
    const postUrl = `https://mfdx9kmod7.execute-api.us-east-1.amazonaws.com/private_listing_service/prod/private/tenant/${tenant_name}/address/${address}`;
    const postResponse = await axios.post(postUrl, payload, {
      headers: headersForPropertySearch(),
    });
    return postResponse.data;
  } catch (error) {
    console.error("Error fetching user id:", error);
    throw error;
  }
};

export const publicDataByAddress = async (payload, address, tenant_name) => {
  try {
    const postUrl = `https://mz5wkrw9e4.execute-api.us-east-1.amazonaws.com/property_listing_service/prod/public/tenant/${tenant_name}/address/${address}`;
    const postResponse = await axios.post(postUrl, payload, {
      headers: headersForPropertySearch(),
    });
    return postResponse.data;
  } catch (error) {
    console.error("Error fetching user id:", error);
    throw error;
  }
};

export const getPropertyByMLS = async (mls, descriptor) => {
  try {
    const url = `https://5iyxc1pky7.execute-api.us-east-1.amazonaws.com/search_service/prod/search_by_gsi/index_name/mls_property_id_index/partition_key/${mls}/sort_key/${descriptor}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching user id:", error);
    throw error;
  }
};

export const addFavorite = async (payload) => {
  let requiredHeaders = await setRequiredHeaders();
  const raw = JSON.stringify(payload);
  const url =
    "https://ch30e1uez8.execute-api.us-east-1.amazonaws.com/prod/Iam/tenant/{{tenantName}}/Alias/favourites/type/property/set";
  const posturl = url.replace("{{tenantName}}", tenant_name);
  const response = await axios.post(posturl + "/add", raw, {
    headers: requiredHeaders,
  });
  return response.data;
};

// API Call for Removing Favorite
export const removeFavorite = async (payload) => {
  let requiredHeaders = await setRequiredHeaders();
  const raw = JSON.stringify(payload);
  const url =
    "https://ch30e1uez8.execute-api.us-east-1.amazonaws.com/prod/Iam/tenant/{{tenantName}}/Alias/favourites/type/property/set";
  const posturl = url.replace("{{tenantName}}", tenant_name);
  const response = await axios.post(posturl + "/delete", raw, {
    headers: requiredHeaders,
  });
  return response.data;
};

export const getFavorites = async () => {
  let requiredHeaders = await setRequiredHeaders();
  const url =
    "https://ch30e1uez8.execute-api.us-east-1.amazonaws.com/prod/Iam/tenant/{{tenantName}}/Alias/favourites/type/property/set";

  const posturl = url.replace("{{tenantName}}", tenant_name);
  const response = await axios.get(posturl + "/get", {
    headers: requiredHeaders,
  });
  return response.data;
};

export const getLedgerDataFromPropertyIdAndAlias = async (propertyId)=> {
 
  let requiredHeaders = await setRequiredHeaders();
  const uid = localStorage.getItem("userAliasID");
  var url =  "https://g87wg2sdj8.execute-api.us-east-1.amazonaws.com/ledger_service/prod/group_id/<index_name>/category_resource/<partition_key>/locate/<range_key>/version/<version>";
    
   const posturl = url.replace('<index_name>','property_id_group_index')
    .replace('<partition_key>',propertyId) 
    .replace('<range_key>',uid) 
    .replace('<version>',0) ;
    const response = await axios.post(posturl, {},{
      headers: requiredHeaders,
    });
    return response.data;
}

export const fetchBuyerRebateValues = async(commissionValue, payload) => {
 
  var url = "https://92qf8l442m.execute-api.us-east-1.amazonaws.com";
  const posturl = `${url}/Buyer/commission/${commissionValue}`;

  const response = await axios.get(posturl, {
  
    params :payload
  });
  return response.data;
  
}


export const fetchSellerSavesValues = async(commissionValue, commissionPer,sellerCommissionPer) => {

  var url = "https://vk97wqhvta.execute-api.us-east-1.amazonaws.com";
  const posturl = `${url}/Seller/commission/${commissionValue}?commission=${commissionPer}&sellerCommission=${sellerCommissionPer}`;

  const response = await axios.get(posturl, {

  });
  return response.data;
  
}

export const getOpenHouseData = async(mls, propertyId) => {
 
  var url = "https://0ikbwk2i6k.execute-api.us-east-2.amazonaws.com/prod/work_time_management";
  const posturl = `${url}/tenant/shopprop/user/${mls}_${propertyId}/get_user_events`;
  const response = await axios.get(posturl, {
    headers: { "Content-Type": "application/json",
     
      tenant: tenant_name || "",
      user: useralias || "",
      apikey: api_key || "",
      company: "shopprop",},
  });
  return response.data;
  
}