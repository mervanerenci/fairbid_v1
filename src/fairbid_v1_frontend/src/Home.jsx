import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Link } from "react-router-dom";
import "./Home.scss";


// import image here
import logo from './fairbid-logo-white-transparent.png';

// LANDING PAGE COMPONENT

function Home() {
    return (
        <>

        

        <Grid container spacing={3} className='text-color' sx={{marginTop:"10rem"}}  >
            {/* left half introduction and 2 buttons 1 fore live auction 1 fore new auction, right half is just image */}
            <Grid item xs={12} sx={{marginBottom:"3rem"}} >
                <Typography variant="h3" sx={{textTransform:'uppercase', fontWeight:"900", fontSize:"7rem"}} >Welcome to FairBid</Typography>
                <Typography variant="h6" sx={{textTransform:'uppercase', fontWeight:"550", fontSize:"1.2rem"}}>The BEST p2p Auction Marketplace</Typography>
                <Link to="/liveAuctions"><Button variant="contained" color="primary" sx={{background:"#008080", color:"white", textTransform:"capitalize", fontWeight:"450", marginTop:"0.3rem", boxShadow: "rgb(33, 66, 64) 0px 30px 50px -10px"}}>Discover</Button></Link>
                

            </Grid>
            {/* <Grid item xs={6} sx={{justifyContent:"flex-start"}}>
                
                    
                <Typography variant="h5" sx={{textTransform:'uppercase', fontWeight:"800", fontSize:"3rem"}} >About FairBid</Typography>
                <Typography variant="h6" sx={{textTransform:'uppercase', fontWeight:"550", fontSize:"1.5rem"}}>The best platform for selling</Typography>
                <Typography variant="h6" sx={{textTransform:'uppercase', fontWeight:"550", fontSize:"1.5rem"}}>The best platform for selling</Typography>
                <Typography variant="h6" sx={{textTransform:'uppercase', fontWeight:"550", fontSize:"1.5rem"}}>The best platform for selling</Typography>
                <Typography variant="h6" sx={{textTransform:'uppercase', fontWeight:"550", fontSize:"1.5rem"}}>The best platform for selling</Typography>
                <Typography variant="h6" sx={{textTransform:'uppercase', fontWeight:"550", fontSize:"1.5rem"}}>The best platform for selling</Typography>
                <Link to="/liveAuctions">
                <Button  sx={{background:"#008080", justifyContent:"flex-end" }} >
                    See Auctions

                </Button></Link>
                


            </Grid>

            <Grid item xs={6} sx={{}}>
                <img src="https://i0.wp.com/hyperallergic-newspack.s3.amazonaws.com/uploads/2015/08/auc2-1F.jpg?w=640&quality=95&ssl=1" style={{}} alt="FairBid Logo" />
            </Grid> */}

            
                
            
        </Grid>
        </>
    );
}

export default Home;