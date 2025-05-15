const flag = {
  "staff": 0,
  "hod": 1,
  "office": 2,
  "faculty": 3,
  "dean": 4,

}



const findDepartment = (email) => {
  if (!email) return null;

  // Convert email to lowercase for case-insensitive matching
  email = email.toLowerCase();

  // Extract the part before '@'
  let part = email.split('.')[1];
  part = part.split('@')[0];
  const departmentMap = {
    'afd': 'APPAREL AND FASHION DESIGN',
    'amcs': 'APPLIED MATHEMATICS AND COMPUTATIONAL SCIENCES',
    'apsc': 'APPLIED SCIENCE',
    'auto': 'AUTOMOBILE ENGINEERING',
    'bme': 'BIOMEDICAL ENGINEERING',
    'bio': 'BIOTECHNOLOGY',
    'civil': 'CIVIL ENGINEERING',
    'mca': 'COMPUTER APPLICATIONS',
    'cse': 'COMPUTER SCIENCE & ENGINEERING',
    'eee': 'ELECTRICAL & ELECTRONICS ENGINEERING',
    'ece': 'ELECTRONICS & COMMUNICATION ENGINEERING',
    'fashion': 'FASHION TECHNOLOGY',
    'it': 'INFORMATION TECHNOLOGY',
    'ice': 'INSTRUMENTATION & CONTROL ENGINEERING',
    'mech': 'MECHANICAL ENGINEERING',
    'metal': 'METALLURGICAL ENGINEERING',
    'prod': 'PRODUCTION ENGINEERING',
    'rae': 'ROBOTICS & AUTOMATION ENGINEERING',
    'textile': 'TEXTILE TECHNOLOGY',
    'phy': 'PHYSICS',
    'chem': 'CHEMISTRY',
    'maths': 'MATHEMATICS',
    'english': 'ENGLISH',
    'hum': 'HUMANITIES',
    'ped': 'PHYSICAL EDUCATION',
    'ac': "Test department",
    'com': "Test department",
  };
  // Check if the local part matches any key in the department map
  return departmentMap[part] || null;
};




module.exports = {
  flag,
  findDepartment
}
