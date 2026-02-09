import { Switch, Route, Redirect } from "react-router-dom";
import ViewApplications from "./pages/ViewApplications.js";
import Tables from "./pages/Tables";
import Profile from "./pages/Profile";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Main from "./components/layout/Main";
import Rtl from "./pages/Rtl.js";
import Dashboard from "./pages/Dashboard.js";
import SetPassword from "./pages/SetPassword.js";

import "./assets/styles/main.css";
import "./assets/styles/responsive.css";
import VehicleExemptionChecklist from "./pages/VehicleExemptionChecklist.js";
import Report from "./pages/Report.js";
import RenewApplications from "./pages/Renewal.js";
import ApplicationDetails from "./pages/ApplicationDetails.js";

function App() {
  return (
    <div className="App">
      <Switch>
        <Route path="/sign-in" exact component={SignIn} />
        <Route path="/sign-up" exact component={SignUp} />

        <Main>
          <Switch>
            <Route path="/set-password" component={SetPassword} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/all-applications" component={ViewApplications} />
            <Route path="/profile" component={Profile} />
            <Route path="/tables" component={Tables} />
            <Route path="/reports" component={Report} />
            <Route path="/renew" component={RenewApplications} />
            <Route path="/vehicles" component={VehicleExemptionChecklist} />
            <Route path="/tables" exact component={Tables} />
            <Route path="/applications/:id" component={ApplicationDetails} />
            <Route path="/finalApproval" component={Rtl} />
          </Switch>
        </Main>
        <Redirect from="/" to="/sign-in" />
      </Switch>
    </div>
  );
}

export default App;
