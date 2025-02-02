import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/HomePage";
import MyPosts from "./pages/MyPostsPage";
import { Container, Box } from "@mui/material";
import { UserContextProvider } from "./context/UserContext";
import Signup from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import { CookiesProvider } from "react-cookie";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CreatePostPage from "./pages/CreatePostPage";

const theme = createTheme({
  palette: {
    primary: {
      main: '#009688',
    },
    background: {
      default: '#cddc39', 
    },
  },
});


const App: React.FC = () => {
  return (
    <CookiesProvider>
      <UserContextProvider>
        <ThemeProvider theme={theme}>
          <Router>
            <Navbar />
            <Container maxWidth="lg">
              <Box sx={{ paddingTop: 4 }}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/my-posts" element={<MyPosts />} />
                  <Route path="/create-post" element={<CreatePostPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<Signup />} />
                </Routes>
              </Box>
            </Container>
          </Router>
        </ThemeProvider>
      </UserContextProvider>
    </CookiesProvider>
  );
};

export default App;
