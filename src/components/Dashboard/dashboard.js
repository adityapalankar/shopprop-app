import React from "react";
import Footer from "../Footer/footer";

const DashboardComponent = () => {
  const userJson = localStorage.getItem("userJson");

  // Parse the userJson if it exists
  const user = userJson ? JSON.parse(userJson) : null;

  // Access attributes from the user object

  const tenant_name = user?.tenant_name;

  const userDashboard = user ? user.user_auth_urls : null;

  return (
    <div>
      <iframe
        src={`https://${userDashboard}/#/login`}
        title="Login Page"
        width="100%"
        height="600"
        frameBorder="0"
        allowFullScreen
      ></iframe>

      <Footer></Footer>
    </div>
  );
};
export default DashboardComponent;
