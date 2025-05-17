const fs = require('fs');
const axios = require('axios');

// Load JSON data from file
const data = JSON.parse(fs.readFileSync('E:\\Repositories\\CSRC testing\\csrc\\CSRC_Testing_verification\\backend\\utils\\data.json', 'utf8'));

// URL to send POST requests to
//const url = 'http://localhost:4000/report/addLabs';
const url = 'http://localhost:4000/test/add';
// Add delay function
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const sendRequests = async () => {
  console.log(`Starting to send ${data.length} requests...`);
  
  for (const [index, record] of data.entries()) {
    try {
      // Use axios.post directly - fix for the TypeError
      const response = await axios.post(url, record);
      
      console.log(`✅ [${index + 1}/${data.length}] Success: ${response.data.message}`);
      
      // Add a small delay between requests to avoid overwhelming the server
      await delay(500);
      
    } catch (error) {
      if (error.response) {
        console.error(`❌ [${index + 1}/${data.length}] Error: ${error.response.data.message}`);
      } else {
        console.error(`❌ [${index + 1}/${data.length}] Error:`, error.message || error);
        
        // If we hit an AggregateError, wait longer before continuing
        if (error.name === 'AggregateError') {
          console.log('💤 Detected AggregateError, pausing for 10 seconds...');
          await delay(10000); // 10 second pause
        }
      }
      
      // Add a longer delay after errors
      await delay(2000);
    }
  }
  
  console.log('✅ All requests completed');
};

sendRequests();