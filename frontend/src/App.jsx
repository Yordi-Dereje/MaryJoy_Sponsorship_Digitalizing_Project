import React from "react";
import ErrorBoundary from "./ErrorBoundary";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import AdminDashboard from "./AdminDashboard";
import BeneficiaryList from "./BeneficiaryList";
import BeneficiaryRequest from "./BeneficiaryRequest";
import ChildList from "./ChildList";
import CoordinatorDashboard from "./CoordinatorDashboard";
import DODashboard from "./DODashboard";
import ElderlyList from "./ElderlyList";
import EmployeeList from "./EmployeeList";
import Feedback from "./Feedback";
import FinancialReport from "./FinancialReport";
import SponsorDashboard from "./SponsorDashboard";
import SponsorList from "./SponsorList";
import SponsorManagement from "./SponsorManagement";
import SponsorModal from "./SponsorModal";
import ChildBeneficiaryModal from "./ChildBeneficiaryModal";
import ElderlyBeneficiaryModal from "./ElderlyBeneficiaryModal";
import GuardianModal from "./GuardianModal";
import EmployeeModal from "./EmployeeModal";
import LogIn from "./LogIn";


function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
                    <Route path="/" element={<Navigate to="/admin_dashboard" />} />

          <Route path="/admin_dashboard" element={<AdminDashboard />} />
          <Route path="/beneficiary_list" element={<BeneficiaryList />} />
          <Route path="/beneficiary_request" element={<BeneficiaryRequest />} />
          <Route path="/child_list" element={<ChildList />} />
          <Route
            path="/coordinator_dashboard"
            element={<CoordinatorDashboard />}
          />
          <Route path="/d_o_dashboard" element={<DODashboard />} />
          <Route path="/elderly_list" element={<ElderlyList />} />
          <Route path="/employee_list" element={<EmployeeList />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/financial_report" element={<FinancialReport />} />
          <Route path="/sponsor_dashboard" element={<SponsorDashboard />} />
          <Route path="/sponsor_list" element={<SponsorList />} />
          <Route path="/sponsor_management" element={<SponsorManagement />} />
          <Route path="/sponsor_modal" element={<SponsorModal/>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
