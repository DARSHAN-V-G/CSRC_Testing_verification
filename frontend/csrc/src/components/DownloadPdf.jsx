import { useState } from 'react';

export default function GenerateReport() {
  const [pdfUrl, setPdfUrl] = useState('');
  const [showPdf, setShowPdf] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    const ref_no = event.target.ref_no.value;
    
    if (!ref_no) {
      alert("Please enter a Reference Number!");
      return;
    }

    try {
      // Make GET request to generate report
      const response = await fetch(`http://localhost:4000/report/generate/${ref_no}`);
      
      if (!response.ok) {
        throw new Error('Report not found or error generating the PDF.');
      }

      // Convert the response to a Blob (PDF)
      const pdfBlob = await response.blob();
      const newPdfUrl = URL.createObjectURL(pdfBlob);

      // Display PDF in iframe
      setPdfUrl(newPdfUrl);
      setShowPdf(true);
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  return (
    <div className="m-12">
      <h1 className="text-2xl font-bold mb-4">Generate Report</h1>
      
      <form id="reportForm" onSubmit={handleSubmit}>
        <label htmlFor="ref_no" className="block mb-2">Enter Ref No:</label>
        <input 
          type="text" 
          id="ref_no" 
          name="ref_no" 
          required
          className="p-2 mb-4 border border-gray-300 rounded w-full max-w-md"
        />
        <button 
          type="submit"
          className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Generate PDF
        </button>
      </form>

      {showPdf && (
        <iframe 
          id="pdfViewer" 
          src={pdfUrl} 
          className="w-full h-screen mt-4 border-0"
          title="PDF Viewer"
        />
      )}
    </div>
  );
}