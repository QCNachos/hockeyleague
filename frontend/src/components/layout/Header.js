import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { logout } from '../../store/slices/authSlice';

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

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const NavLink = styled(Link)`
  color: #C4CED4;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
  
  &:hover {
    color: #B30E16;
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

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };
  
  return (
    <HeaderContainer>
      <Logo to="/">
        <h1>
          Hockey<span>League</span>
        </h1>
      </Logo>
      
      <NavLinks>
        {isAuthenticated ? (
          <>
            <span>Welcome, {user?.username}</span>
            <AuthButton onClick={handleLogout}>Logout</AuthButton>
          </>
        ) : (
          <>
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/register">Register</NavLink>
          </>
        )}
      </NavLinks>
    </HeaderContainer>
  );
};

export default Header;
