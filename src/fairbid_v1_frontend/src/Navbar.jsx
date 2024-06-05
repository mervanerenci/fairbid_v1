import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import AccessibilityIcon from '@mui/icons-material/Accessibility';
import logo from './fairbid-logo-white-transparent.png';



import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Principal } from "@dfinity/principal";
import { AuthClient } from "@dfinity/auth-client";
import { Actor } from "@dfinity/agent";
import { fairbid_v1_backend } from '../../declarations/fairbid_v1_backend';

const pages = ['AuctionList', 'Create Auction', 'Blog'];
const settings = ['Profile', 'Dashboard', 'Logout'];

function Navbar() {
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const [principal, setPrincipal] = useState(undefined);
  const [needLogin, setNeedLogin] = useState(true);

  let actor = fairbid_v1_backend;

  const authClientPromise = AuthClient.create();

  // const signIn = async () => {
  //     const authClient = await authClientPromise;

  //     const internetIdentityUrl = import.meta.env.PROD
  //         ? undefined :
  //         `http://localhost:4943/?canisterId=${process.env.INTERNET_IDENTITY_CANISTER_ID}`;

  //         await new Promise((resolve) => {
  //             authClient.login({
  //                 identityProvider: internetIdentityUrl,
  //                 onSuccess: () => resolve(undefined),
  //             });
  //         });

  //     const identity = authClient.getIdentity();
  //     // updateIdentity(identity);
  //     setNeedLogin(false);
  // };

  async function login(event) {
    event.preventDefault();
    let authClient = await AuthClient.create();
    // start the login process and wait for it to finish
    await new Promise((resolve) => {
      authClient.login({
        identityProvider:
          process.env.DFX_NETWORK === "ic"
            ? "http://be2us-64aaa-aaaaa-qaabq-cai.localhost:4943"
            : `http://be2us-64aaa-aaaaa-qaabq-cai.localhost:4943`,
        onSuccess: resolve,
      });
    });
    const identity = authClient.getIdentity();

    // const agent = new HttpAgent({ identity });
    // actor = createActor(process.env.CANISTER_ID_FAIRBID_V1_BACKEND, {
    //     agent,
    // });
    updateIdentity(identity);
    setNeedLogin(false);
    return false;
  };

  const logout = async () => {
    const authClient = await authClientPromise;
    await authClient.logout();
    const identity = authClient.getIdentity();
    updateIdentity(identity);
    setNeedLogin(true);
  }

  const updateIdentity = (identity) => {
    setPrincipal(identity.getPrincipal());
    (Actor.agentOf(fairbid_v1_backend)).replaceIdentity(identity);
  }

  const setInitialIdentity = async () => {
    try {
      const authClient = await AuthClient.create();
      const identity = authClient.getIdentity();
      updateIdentity(identity);
      setNeedLogin(!await authClient.isAuthenticated());
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    setInitialIdentity();
  }, []);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  return (
    <AppBar position="static" sx={{
      // background: 'linear-gradient(118deg, #646cff, transparent)',
      backgroundColor: '#1C1C1C',
      // background: 'linear-gradient(45deg, #2f4f4f, #54597f)'
      height: '4.5rem',

      boxShadow: 0,


      backgroundImage: 'none',
      
  




    }} >


      <Container >
        <Toolbar disableGutters>
          {/* <AccessibilityIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} /> */}
          
          <Link to="/" >
            <img src={logo} style={{maxWidth:"10rem"}} alt="FairBid Logo" />
          </Link>
          

          {/* <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'Kanit',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'white',
              textDecoration: 'none',
              
            }}
          >
            FAIRBID
          </Typography> */}

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {/* {pages.map((page) => (
                <MenuItem key={page} onClick={handleCloseNavMenu}>
                    
                  <Typography textAlign="center" >New</Typography>
                </MenuItem>
              ))} */}
              <MenuItem onClick={handleCloseNavMenu}>

                <Typography textAlign="center" >Auction</Typography>
              </MenuItem>
            </Menu>
          </Box>
          <AccessibilityIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
          <Typography
            variant="h5"
            noWrap
            component="a"
            href="#app-bar-with-responsive-menu"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'Kanit',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            FAIRBID
          </Typography>


          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'flex-end' , marginRight:"3rem"}}>

            <Link to="/liveAuctions">
              <Button
                onClick={handleCloseNavMenu}
                sx={{ my: 2, color: '#D3D3D3', display: 'block', textTransform: 'none' }}

              >
                Live Auctions
              </Button>
            </Link>

            <Link to="/myAuctions">
              <Button
                onClick={handleCloseNavMenu}
                sx={{ my: 2, color: '#D3D3D3', display: 'block', textTransform: 'none' }}

              >
                My Auctions
                
              </Button>
            </Link>


            <Link to="/newAuction">
              <Button

                onClick={handleCloseNavMenu}
                sx={{ my: 2, color: '#D3D3D3', display: 'block', textTransform: 'none'}}
              >
                New Auction
              </Button>
            </Link>


          </Box>

          

          {needLogin ?
            <button style={{backgroundColor: "#FFA500"}} onClick={login}>
              Sign In
            </button>

            :

            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar alt="Remy Sharp" src="/static/images/avatar/2.jpg" />
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >

                <MenuItem onClick={handleCloseUserMenu}>
                  <Typography textAlign="center">Profile</Typography>
                </MenuItem>

                <MenuItem onClick={logout}>
                  <Typography textAlign="center">LogOut</Typography>
                </MenuItem>

              </Menu>
            </Box>
          }
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default Navbar;