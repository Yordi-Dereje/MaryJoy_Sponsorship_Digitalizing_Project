import React from "react";
import ErrorBoundary from "./ErrorBoundary";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./ProtectedRoute";
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
import SponsorBeneficiaries from "./SponsorBeneficiaries"
import InactiveSponsors from "./InactiveSponsors"
import SpecificBeneficiary from "./SpecificBeneficiary"
import SponsorDetails from "./SponsorDetails"
import SponsorsLedger from "./SponsorsLedger.jsx"

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LogIn />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* Admin Routes */}
            <Route 
              path="/admin_dashboard" 
              element={
                <ProtectedRoute requiredRoles="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/beneficiary_request" 
              element={
                <ProtectedRoute requiredRoles={["admin", "database_officer"]}>
                  <BeneficiaryRequest />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/sponsor_management" 
              element={
                <ProtectedRoute requiredRoles={["admin", "database_officer"]}>
                  <SponsorManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/employee_list" 
              element={
                <ProtectedRoute requiredRoles="admin">
                  <EmployeeList />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/financial_report" 
              element={
                <ProtectedRoute requiredRoles={["admin", "database_officer"]}>
                  <FinancialReport />
                </ProtectedRoute>
              } 
            />
            
            {/* Database Officer Routes */}
            <Route 
              path="/d_o_dashboard" 
              element={
                <ProtectedRoute requiredRoles="database_officer">
                  <DODashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/beneficiary_list" 
              element={
                <ProtectedRoute requiredRoles={["admin", "database_officer"]}>
                  <BeneficiaryList />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/child_list" 
              element={
                <ProtectedRoute requiredRoles={["admin", "database_officer", "coordinator"]}>
                  <ChildList />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/elderly_list" 
              element={
                <ProtectedRoute requiredRoles={["admin", "database_officer", "coordinator"]}>
                  <ElderlyList />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/sponsor_list" 
              element={
                <ProtectedRoute requiredRoles={["admin", "database_officer", "coordinator"]}>
                  <SponsorList />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/sponsor_beneficiaries" 
              element={
                <ProtectedRoute requiredRoles="sponsor">
                  <SponsorBeneficiaries />
                </ProtectedRoute>
              } 
            />
            <Route path="/sponsor_beneficiaries/:cluster_id?/:specific_id?" element={<SponsorBeneficiaries />} />
            <Route 
              path="/inactive_sponsors" 
              element={
                <ProtectedRoute requiredRoles={["admin", "database_officer", "coordinator"]}>
                  <InactiveSponsors />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/sponsor_ledger" 
              element={
                <ProtectedRoute requiredRoles={["admin", "database_officer"]}>
                  <SponsorsLedger />
                </ProtectedRoute>
              } 
            />
            
            {/* Coordinator Routes */}
            <Route 
              path="/coordinator_dashboard" 
              element={
                <ProtectedRoute requiredRoles="coordinator">
                  <CoordinatorDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/feedback" 
              element={
                <ProtectedRoute requiredRoles={["admin", "database_officer", "coordinator"]}>
                  <Feedback />
                </ProtectedRoute>
              } 
            />
            
            {/* Sponsor Routes */}
            <Route 
              path="/sponsor_dashboard" 
              element={
                <ProtectedRoute requiredRoles="sponsor">
                  <SponsorDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Shared Routes */}
            <Route 
              path="/specific_beneficiary" 
              element={
                <ProtectedRoute>
                  <SpecificBeneficiary />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/sponsors/:cluster_id/:specific_id" 
              element={
                <ProtectedRoute>
                  <SponsorDetails />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/specific_beneficiary/:id" 
              element={
                <ProtectedRoute>
                  <SpecificBeneficiary />
                </ProtectedRoute>
              } 
            />
            
            {/* Modal Routes */}
            <Route 
              path="/sponsor_modal" 
              element={
                <ProtectedRoute requiredRoles={["admin", "database_officer"]}>
                  <SponsorModal />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/child_beneficiary_modal" 
              element={
                <ProtectedRoute requiredRoles={["admin", "database_officer"]}>
                  <ChildBeneficiaryModal />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/elderly_beneficiary_modal" 
              element={
                <ProtectedRoute requiredRoles={["admin", "database_officer"]}>
                  <ElderlyBeneficiaryModal />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/guardian_modal" 
              element={
                <ProtectedRoute requiredRoles={["admin", "database_officer"]}>
                  <GuardianModal />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/employee_modal" 
              element={
                <ProtectedRoute requiredRoles="admin">
                  <EmployeeModal />
                </ProtectedRoute>
              } 
            />
            
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
