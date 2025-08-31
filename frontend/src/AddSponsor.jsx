import React from "react";
import { Link } from "react-router-dom";

const AddSponsor = () => {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-mj-text-dark">
          Add Sponsor
        </h1>
        <Link to="/admin_dashboard" className="text-mj-blue hover:underline">
          Back to Admin
        </Link>
      </div>
      <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input placeholder="Name" className="p-2 border rounded-md" />
        <input placeholder="Organization" className="p-2 border rounded-md" />
        <select className="p-2 border rounded-md">
          <option>Type</option>
        </select>
        <select className="p-2 border rounded-md">
          <option>Residency</option>
        </select>
        <button
          type="submit"
          className="px-4 py-2 bg-mj-orange text-white rounded-md"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default AddSponsor;
