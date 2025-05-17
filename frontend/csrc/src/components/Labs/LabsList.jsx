import React, { useState } from 'react';
import { Card, Table, Button, Badge, Form, InputGroup } from 'react-bootstrap';
import './LabsList.css';

const LabsList = ({ labs, onDeleteLab }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter labs based on search term
  const filteredLabs = labs.filter(lab => 
    lab.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lab.labs.some(labName => labName.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const handleDeleteClick = (department, lab) => {
    // Call the parent component's delete function
    onDeleteLab(department, lab);
  };
  
  return (
    <Card className="labs-list-card">
      <Card.Body>
        <InputGroup className="search-box">
          <Form.Control
            placeholder="Search labs or departments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <Button 
              variant="outline-secondary"
              onClick={() => setSearchTerm('')}
            >
              Clear
            </Button>
          )}
        </InputGroup>
        
        {filteredLabs.length === 0 ? (
          <div className="no-labs-message">
            {labs.length === 0 ? (
              <p>No labs have been added yet.</p>
            ) : (
              <p>No labs match your search.</p>
            )}
          </div>
        ) : (
          <Table striped bordered hover responsive className="labs-table">
            <thead>
              <tr>
                <th>Department</th>
                <th>Labs</th>
              </tr>
            </thead>
            <tbody>
              {filteredLabs.map((item) => (
                <tr key={item._id}>
                  <td>{item.department}</td>
                  <td>
                    <div className="labs-cell">
                      {item.labs.map((lab, idx) => (
                        <Badge 
                          bg="secondary" 
                          key={idx}
                          className="lab-badge"
                        >
                          {lab}
                          {item.labs.length > 1 && (
                            <Button 
                              variant="danger" 
                              size="sm" 
                              className="delete-lab-btn"
                              onClick={() => handleDeleteClick(item.department, lab)}
                            >
                              &times;
                            </Button>
                          )}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card.Body>
    </Card>
  );
};

export default LabsList;