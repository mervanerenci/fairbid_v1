import './NewAuction.scss';
import { useState } from "react";
import { fairbid_v1_backend } from "../../declarations/fairbid_v1_backend"
import { useNavigate } from "react-router-dom";
import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';

function NewAuction() {
    const [title, setTitle] = useState("My Auction");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState(Uint8Array.of());
    const [duration, setDuration] = useState(120);
    const [startingPrice, setStartingPrice] = useState(1);
    const [contact, setContact] = useState("");
    const [location, setLocation] = useState("");
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();

    const createAuction = async () => {
        setSaving(true);
        try {
            let item = {
                title,
                description,
            };
            console.log("New Auction: ", item, startingPrice, BigInt(duration), contact, location, image);
            console.log("Location: ", location)
            console.log("Contact: ", contact)
            await fairbid_v1_backend.new_auction(item, startingPrice, BigInt(duration), contact, location, image);
            navigate("/liveAuctions");
        } catch (error) {
            console.log(error);
        } finally {
            setSaving(false);
        }
    }




    const changeFile = async (file) => {
        let data = Uint8Array.of();
        if (file != null) {
            const stream = await file.stream();
            const reader = stream.getReader();
            while (true) {
                const part = await reader.read();
                const chunk = part.value;
                if (chunk == null) {
                    break;
                }
                data = concatUint8Arrays(data, chunk);
            }
        }
        setImage(data);
    }

    // TODO: Faster way of concatenation
    const concatUint8Arrays = (left, right) => {
        let temporary = [];
        for (let element of left) {
            temporary.push(element);
        }
        for (let element of right) {
            temporary.push(element);
        }
        return Uint8Array.from(temporary);
    }

    return (
        <>
            <h1 style={{ fontFamily: "Kanit", fontSize: " 2.5rem", fontWeight: "500", color: "#D3D3D3" }} > New Auction</h1>




            <div className="auction-form" style={{ opacity: saving ? 0.5 : 1 }}>

                <div style={{ marginBottom: "20px" }} >

                    <div className="auction-form-row" style={{ fontFamily: "Kanit" }}>
                        <div className="auction-form-label">Title </div>
                    </div>

                    <div className="auction-form-row" style={{ fontFamily: "Kanit" }}>
                        <div className="auction-form-input">
                            <TextField id="outlined-basic" label="Title" variant="filled" sx={{ fontFamily: "Kanit", fontWeight: 900, backgroundColor: "#3B464B" }} onChange={(e) => setTitle(e.target.value)} />
                            {/* <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} /> */}
                        </div>
                    </div>

                </div>
                <div style={{ marginBottom: "20px" }}>
                    <div className="auction-form-row" style={{ fontFamily: "Kanit" }}>

                        <div className="auction-form-label">Description </div>
                    </div>

                    <div className="auction-form-row" style={{ fontFamily: "Kanit" }}>

                        {/* <div className="auction-form-label">Description: </div> */}
                        <div className="auction-form-input">
                            {/* <textarea value={description} onChange={(e) => setDescription(e.target.value)} /> */}
                            <TextField
                                id="filled-multiline-static"
                                label="Description"
                                multiline
                                rows={4}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                fontFamily="Kanit"

                                variant="filled"
                                sx={{ backgroundColor: "#3B464B", color: "#D3D3D3" }}
                            />
                        </div>
                    </div>
                </div>


                <div style={{ marginBottom: "20px" }}>
                    <div className="auction-form-row" style={{ fontFamily: "Kanit" }}>

                        <div className="auction-form-label">Picture (PNG only) </div>
                    </div>

                    <div className="auction-form-row" style={{ fontFamily: "Kanit" }} >
                        {/* <div className="auction-form-label">Picture (PNG only): </div> */}
                        <div className="auction-form-input" style={{ fontSize: "16px" }} >
                            <input type="file" accept='.png' onChange={(e) => changeFile(e.target.files?.[0])} />
                        </div>
                    </div>
                </div>


                <div style={{ marginBottom: "20px" }}>
                    <div className="auction-form-row" style={{ fontFamily: "Kanit" }}>

                        <div className="auction-form-label">Duration </div>
                    </div>


                    <div className="auction-form-row" style={{ fontFamily: "Kanit" }}>
                        {/* <div className="auction-form-label">Duration: </div> */}
                        <div className="auction-form-input" style={{ minWidth: "31rem" }}>
                            {/* <input type="range" min={60} max={600} value={duration}  /> */}
                            <Slider sx={{}} defaultValue={50} min={60} max={600} aria-label="Default" valueLabelDisplay="auto" onChange={(e) => setDuration(parseInt(e.target.value))} />
                            <p>{duration} seconds</p>

                        </div>
                    </div>
                </div>


                <div style={{ marginBottom: "20px" }}>
                    <div className="auction-form-row" style={{ fontFamily: "Kanit" }}>

                        <div className="auction-form-label">Starting Price </div>
                    </div>


                    <div className="auction-form-row" style={{ fontFamily: "Kanit" }}>
                        {/* <div className="auction-form-label">Starting Price: </div> */}
                        <div className="auction-form-input">
                            {/* <input type="number" value={startingPrice}  /> */}
                            <TextField id="outlined-basic" label="Starting Price" variant="filled" sx={{ fontFamily: "Kanit", fontWeight: 900, backgroundColor: "#3B464B" }} onChange={(e) => setStartingPrice(parseInt(e.target.value))} />
                        </div>
                    </div>
                </div>

                <div style={{ marginBottom: "20px" }}>

                    <div className="auction-form-row" style={{ fontFamily: "Kanit" }}>
                        <div className="auction-form-label">Contact</div>
                    </div>


                    <div className="auction-form-row" style={{ fontFamily: "Kanit" }}>
                        <div className="auction-form-input">
                            <TextField id="outlined-basic" label="Contact" variant="filled" sx={{ fontFamily: "Kanit", fontWeight: 900, backgroundColor: "#3B464B" }} onChange={(e) => setContact(e.target.value)} />
                        </div>
                    </div>

                </div>

                <div style={{ marginBottom: "20px" }}>

                    <div className="auction-form-row" style={{ fontFamily: "Kanit" }}>
                        <div className="auction-form-label">Location</div>
                        
                    </div>


                    <div className="auction-form-row" style={{ fontFamily: "Kanit" }}>
                        <div className="auction-form-input">
                            <TextField id="outlined-basic" label="Location(Global, EU, etc.)" variant="filled" sx={{ fontFamily: "Kanit", fontWeight: 900, backgroundColor: "#3B464B" }} onChange={(e) => setLocation(e.target.value)} />
                        </div>
                    </div>
                    
                </div>




                <div className="auction-form-footer" style={{ fontFamily: "Kanit" }}>
                    {/* <button className='auction-form-button' onClick={newAuction} disabled={saving}>
                        Create new auction
                    </button> */}
                    <Button variant="contained" size="large" onClick={createAuction} sx={{ fontWeight:"900", backgroundColor: "#FFA500", color: "#004445", textTransform:"none" }}>Create</Button>
                </div>
            </div>
        </>
    );
}

export default NewAuction;
