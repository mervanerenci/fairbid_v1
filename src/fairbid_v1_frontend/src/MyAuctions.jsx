import './MyAuctions.scss';
import { useEffect, useState } from "react";
import { fairbid_v1_backend } from "../../declarations/fairbid_v1_backend";
import { Link, useNavigate } from "react-router-dom";
import { getImageSource } from './common';
import Button from '@mui/material/Button';


function MyAuctions() {
    const [list, setList] = useState();
    const [dataUrl, setDataUrl] = useState();
    const [text, setText] = useState("google.com");
    const navigate = useNavigate();
    const navigationLink = (auctionId) => "/viewAuction/" + auctionId;
    const actor = fairbid_v1_backend;

    const fetchAuction = async () => {
        console.log("Fetching auctions");
        // console.log(actor);
        // console.log(fairbid_v1_backend);
        let result = await fairbid_v1_backend.get_all_auctions_by_originator();
        let data = await getDataUrl("fairbid_auction_item");

        setDataUrl(data);



        setList(result);
    }

    useEffect(() => {
        fetchAuction();
    }, []);



    function convertToDataUrl(blob) {
        return new Promise((resolve, _) => {
            const fileReader = new FileReader();
            fileReader.readAsDataURL(blob);
            fileReader.onloadend = function () {
                resolve(fileReader.result);
            }
        });
    }

    async function getDataUrl(id) {
        let input = "http://127.0.0.1:4943/viewAuction/" + id;
        let qr_result;
        qr_result = await fairbid_v1_backend.get_qr_code(input);
        console.log("qr_res:", qr_result);
        const image = qr_result.Image;
        const blob = new Blob([qr_result], { type: 'image/png' });
        let dataUrl = await convertToDataUrl(blob);
        console.log(dataUrl);
        return dataUrl;
    }


    const overviewList = list?.map(overview => {
        const id = +overview.id.toString();


        return (
            <>
                <li key={id} className="gallery-item" onClick={(_) => navigate(navigationLink(id))}>
                    <div className="auction-title">{overview.item.title}</div>
                    {/* <div className="auction-description">{overview.item.description}</div> */}
                    {!!overview.item.image?.length && <img src={getImageSource(overview.item.image)} alt="Auction image" />}
                    {dataUrl && <img src={dataUrl} alt="QR Code" />}

                    <div className="gallery-item-link">
                        <Link to={navigationLink(id)}>VIEW</Link>
                    </div>


                    {/* <Button variant="contained" size="large" ><Link to={navigationLink(id)}>JOIN</Link></Button> */}




                </li>

                
            </>
        );
    });

    return (
        <>  
            <h1 style={{color:"lightgray", fontSize: "2.2rem" , display: " flex", justifyContent:'flex-start', marginLeft: "8rem", marginTop: "3rem", fontWeight:100}} >My Auctions</h1>  
        <hr className='hr-style'  />
            {list == null &&
                <div className="section">Loading</div>
            }
            {list?.length == 0 &&
                <div className="section">No active auctions so far</div>
            }
            {list != null && list.length > 0 &&
                <ul className="gallery">
                    {overviewList}
                </ul>
            }
        </>
    );
}

export default MyAuctions;
