import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';

const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #121212;
`;

const LoginForm = styled.form`
  width: 100%;
  max-width: 400px;
  padding: 30px;
  background-color: #1e1e1e;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
`;

const Title = styled.h1`
  margin-bottom: 20px;
  color: #C4CED4;
  text-align: center;
`;

const InputGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  color: #C4CED4;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  background-color: #333;
  border: 1px solid #444;
  border-radius: 4px;
  color: white;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: #B30E16;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 12px;
  background-color: #B30E16;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #950b12;
  }
  
  &:disabled {
    background-color: #555;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.p`
  color: #B30E16;
  margin-bottom: 15px;
  text-align: center;
`;

const RegisterLink = styled.p`
  margin-top: 20px;
  text-align: center;
  color: #C4CED4;
  
  a {
    color: #B30E16;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    const result = await login(email, password);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
  };
  
  return (
    <LoginContainer>
      <LoginForm onSubmit={handleSubmit}>
        <Title>Login</Title>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <InputGroup>
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </InputGroup>
        
        <InputGroup>
          <Label htmlFor="password">Password</Label>
          <Input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </InputGroup>
        
        <SubmitButton type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </SubmitButton>
        
        <RegisterLink>
          Don't have an account? <Link to="/register">Register</Link>
        </RegisterLink>
      </LoginForm>
    </LoginContainer>
  );
};

export default Login;
