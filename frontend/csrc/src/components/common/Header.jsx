import React from 'react';
import './Header.css';
import logo from '../../assets/PSG.png'; // Adjust the path to your PSG.png logo

const Header = () => {
  return (
    <div className="sub-header">
      <div className="container">
        <div className="row">
          <div className="col-lg-10 col-md-10">
            <h2 style={{ color: 'rgb(55, 81, 126)' }}>
              <b>Centre for Sponsored Research and Consultancy</b>
            </h2>
            <h3 style={{ color: 'rgb(55, 81, 126)', textAlign: 'left' }}>
              <b>PSG College of Technology</b>
            </h3>
          </div>
          <div className="col-lg-2 col-md-2">
            <img src={logo} alt="PSG Logo" className="college-logo" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;