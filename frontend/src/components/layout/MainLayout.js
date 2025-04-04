import React from 'react';
import { Outlet } from 'react-router-dom';
import styled from 'styled-components';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #121212;
  color: #ffffff;
`;

const MainContent = styled.div`
  display: flex;
  flex: 1;
`;

const SidebarWrapper = styled.div`
  width: 250px;
  background-color: #1e1e1e;
  border-right: 1px solid #333;
`;

const ContentWrapper = styled.main`
  flex: 1;
  padding: 20px;
  overflow: auto;
`;

const MainLayout = () => {
  return (
    <LayoutContainer>
      <Header />
      <MainContent>
        <SidebarWrapper>
          <Sidebar />
        </SidebarWrapper>
        <ContentWrapper>
          <Outlet />
        </ContentWrapper>
      </MainContent>
      <Footer />
    </LayoutContainer>
  );
};

export default MainLayout;
