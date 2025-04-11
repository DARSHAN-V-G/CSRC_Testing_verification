import React, { useState } from 'react';
import axios from 'axios';

const ReportUploadForm = () => {
  const [formData, setFormData] = useState({
    ref_no: '',
    department: '',
    verified_flag: 0,
    client_name: '',
    client_po_no: '',
    bill_to_be_sent_mail_address: '',
    client_po_recieved_date: '',
    gst_no: '',
    faculty_incharge: '',
    paid: false,
    payment_mode: '',
    prepared_by: '',
    total_amount: '',
  });

  const [tests, setTests] = useState([
    { title: '', unit: '', pricePerUnit: '', quantity: '' }
  ]);

  const [file, setFile] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleTestChange = (index, e) => {
    const { name, value } = e.target;
    const updatedTests = [...tests];
    updatedTests[index][name] = value;
    setTests(updatedTests);
  };

  const addTest = () => {
    setTests([...tests, { title: '', unit: '', pricePerUnit: '', quantity: '' }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();

    for (let key in formData) {
      data.append(key, formData[key]);
    }
    data.append('test', JSON.stringify(tests));
    if (file) data.append('file', file);

    try {
      console.log(data);
      const response = await axios.post('http://localhost:4000/report/create', data);

      alert('Report submitted successfully!');
      console.log(response.data);
    } catch (err) {
      console.error('Error uploading report:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow-xl rounded-xl border">
      <h1 className="text-2xl font-bold mb-6 text-center">Report Upload - Bill Format</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input name="ref_no" placeholder="Reference No" value={formData.ref_no} onChange={handleChange} className="input" required />
          <input name="department" placeholder="Department" value={formData.department} onChange={handleChange} className="input" required />
          <input name="client_name" placeholder="Client Name" value={formData.client_name} onChange={handleChange} className="input" required />
          <input name="client_po_no" placeholder="Client PO No" value={formData.client_po_no} onChange={handleChange} className="input" required />
          <input name="bill_to_be_sent_mail_address" placeholder="Billing Email" value={formData.bill_to_be_sent_mail_address} onChange={handleChange} className="input" required />
          <input type="date" name="client_po_recieved_date" value={formData.client_po_recieved_date} onChange={handleChange} className="input" required />
          <input name="gst_no" placeholder="GST No" value={formData.gst_no} onChange={handleChange} className="input" required />
          <input name="faculty_incharge" placeholder="Faculty Incharge" value={formData.faculty_incharge} onChange={handleChange} className="input" required />
          <input name="payment_mode" placeholder="Payment Mode" value={formData.payment_mode} onChange={handleChange} className="input" required />
          <input name="prepared_by" placeholder="Prepared By" value={formData.prepared_by} onChange={handleChange} className="input" required />
          <input name="total_amount" placeholder="Total Amount" value={formData.total_amount} onChange={handleChange} className="input" required />
          <div className="flex items-center">
            <label className="mr-2">Paid:</label>
            <input type="checkbox" name="paid" checked={formData.paid} onChange={handleChange} />
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-2">Test Items (Products)</h2>
          {tests.map((test, index) => (
            <div key={index} className="grid grid-cols-4 gap-4 mb-2">
              <input name="title" placeholder="Title" value={test.title} onChange={(e) => handleTestChange(index, e)} className="input" required />
              <input name="unit" placeholder="Unit" value={test.unit} onChange={(e) => handleTestChange(index, e)} className="input" required />
              <input name="pricePerUnit" type="number" placeholder="Price/Unit" value={test.pricePerUnit} onChange={(e) => handleTestChange(index, e)} className="input" required />
              <input name="quantity" type="number" placeholder="Quantity" value={test.quantity} onChange={(e) => handleTestChange(index, e)} className="input" required />
            </div>
          ))}
          <button type="button" onClick={addTest} className="mt-2 text-blue-600 hover:underline">+ Add Another Test</button>
        </div>

        <div className="mt-6">
          <label className="block mb-1 font-medium">Upload PO File (PDF/Image)</label>
          <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setFile(e.target.files[0])} className="block" />
        </div>

        <button type="submit" className="mt-6 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition">Submit Report</button>
      </form>
    </div>
  );
};

export default ReportUploadForm;
