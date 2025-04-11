import React from "react";
import ReportUploadForm from "../components/ReportUploadForm";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Create New Report</h1>
      <ReportUploadForm />
    </div>
  );
};

export default HomePage;
