import './App.scss';
// import motoko from './assets/motoko.png';
import NewAuction from './NewAuction';
import LiveAuctions from './LiveAuctions';
import MyAuctions from './MyAuctions';
import Home from './Home';
import Navbar from './Navbar';
import AuctionDetail from './AuctionDetail';


import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';





const theme = createTheme({
  palette: {
    primary: {main: '#D3D3D3'},
    
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
    <BrowserRouter>
      {/* <div>
        <img src={motoko} className="logo" alt="Motoko logo" />
      </div> */}
      
      {/* <AppBar2 /> */}
      <Navbar />



      
      <div className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/liveAuctions" element={<LiveAuctions />} />
          <Route path="/newAuction" element={<NewAuction />} />
          <Route path="/viewAuction/:id" element={<AuctionDetail />} />
          <Route path="/myAuctions" element={<MyAuctions />} />

          

        </Routes>
      </div>
    </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
