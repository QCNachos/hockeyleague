import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';

const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 70px;
  background-color: #323232;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  text-decoration: none;
  
  h1 {
    margin: 0;
    color: #C4CED4;
    font-size: 1.8rem;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    
    span {
      color: #B30E16;
    }
  }
`;

const AuthButton = styled.button`
  background: #B30E16;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #950b12;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const UserName = styled.span`
  color: #C4CED4;
  font-weight: 500;
`;

const RightContent = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const Header = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <HeaderContainer>
      <Logo to="/">
        <h1>
          Hockey<span>League</span>
        </h1>
      </Logo>
      
      <RightContent>
        {isAuthenticated() ? (
          <UserInfo>
            <UserName>{user?.username || 'User'}</UserName>
            <AuthButton onClick={handleLogout}>Logout</AuthButton>
          </UserInfo>
        ) : (
          <UserInfo>
            <AuthButton onClick={() => navigate('/login')}>Login</AuthButton>
          </UserInfo>
        )}
      </RightContent>
    </HeaderContainer>
  );
};

export default Header;
