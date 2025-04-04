import React from 'react';
import styled from 'styled-components';

const FooterContainer = styled.footer`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #1a1a1a;
  color: #888;
  padding: 15px 20px;
  border-top: 1px solid #333;
`;

const Copyright = styled.div`
  font-size: 14px;
`;

const FooterLinks = styled.div`
  a {
    color: #C4CED4;
    text-decoration: none;
    margin-left: 20px;
    font-size: 14px;
    
    &:hover {
      color: #B30E16;
    }
  }
`;

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <FooterContainer>
      <Copyright>
        &copy; {currentYear} HockeyLeague. All rights reserved.
      </Copyright>
      <FooterLinks>
        <a href="#">Privacy Policy</a>
        <a href="#">Terms of Service</a>
        <a href="https://github.com/yourusername/hockeyleague" target="_blank" rel="noopener noreferrer">GitHub</a>
      </FooterLinks>
    </FooterContainer>
  );
};

export default Footer;
