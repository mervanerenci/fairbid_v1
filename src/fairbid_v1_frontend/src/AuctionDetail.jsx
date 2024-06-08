import './AuctionDetail.scss';
import { useEffect, useState } from "react";
import { fairbid_v1_backend } from "../../declarations/fairbid_v1_backend";
import { useParams } from "react-router-dom";
import { getImageSource } from './common';
import { AuthClient } from '@dfinity/auth-client';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';

function AuctionDetail() {
    const { id } = useParams();
    const auctionId = BigInt(id);

    const [auctionDetails, setAuctionDetails] = useState(undefined);
    const [newPrice, setNewPrice] = useState(0);
    const [lastError, setLastError] = useState(undefined);
    const [saving, setSaving] = useState(false);
    const [authenticated, setAuthenticated] = useState(false);
    const [qrData, setQrData] = useState("");
    const [imageData, setImageData] = useState("");
    const [remainingTime, setRemainingTime] = useState(0);
    const [secretCode, setSecretCode] = useState("");
    const [conversations, setConversations] = useState([undefined]);
    const [conversationIds, setConversationIds] = useState([undefined]);
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [user, setUser] = useState(undefined);
    // const [caller, setCaller] = useState("");
    const [visible, setVisible] = useState();



    ////////////////////// FETCH DATA FROM BACKEND //////////////////////
    const fetchFromBackend = async () => {
        const result = await fairbid_v1_backend.get_auction_details(auctionId);
        const result_object = result[0];
        setAuctionDetails(result_object);
        // console.log("Auction Details: ", result_object);

        const remaining_time_nano = await fairbid_v1_backend.get_remaining_time(auctionId);
        const remaining_time = convertNanoToSeconds(remaining_time_nano);
        setRemainingTime(remaining_time);

        // set user 

        const _conversations = await fairbid_v1_backend.get_questions(auctionId);
        setConversations(_conversations);
        console.log("Conversations: ", _conversations);

        const _conversationIds = await fairbid_v1_backend.get_question_ids_by_auction_id(auctionId);
        setConversationIds(_conversationIds);
        console.log("Conversation Ids: ", _conversationIds);



        const authClient = await AuthClient.create();
        setAuthenticated(await authClient.isAuthenticated());

        // const _caller = await fairbid_v1_backend.who_am_i();
        // const _callerString = _caller.toString();
        // setCaller(_callerString);
        // console.log("Caller: ", caller.toString());



        const identity = authClient.getIdentity()
        // console.log("Identity: ", identity.getPrincipal().toString());
        setUser(identity.getPrincipal().toString());

    };

    const fetchImage = async () => {
        const image = await fairbid_v1_backend.get_item_image(auctionId);


        const blob = new Blob([image], { type: 'image/png' });
        let image_png = await convertToDataUrl(blob);


        setImageData(image_png);
    }

    useEffect(() => {
        fetchFromBackend();
        setInterval(fetchFromBackend, 1000);
    }, [auctionId]);

    useEffect(() => {
        // console.log(auctionDetails);
    }, [auctionDetails]);

    useEffect(() => {

        getQrCode(auctionId);
        fetchImage();

    }, []);


    //////////////////////////////////////////////////////////////

    ////////////////////// HELPER FUNCTIONS //////////////////////

    // For calculating remaining time
    function convertNanoToSeconds(nanoSeconds) {
        return Math.floor(nanoSeconds / 1000000000);
    }

    function convertUnixToDateTime(unixTime) {

        const date = new Date(unixTime / 1000000);


        const timeString = date.toLocaleString();


        return timeString;

    }

    function convertUnixToDate(unixTime) {
        const date = new Date(unixTime / 1000000).toDateString();
        const timeString = date.toLocaleString();

        return timeString;
    }


    // For converting blob to data url to get image
    function convertToDataUrl(blob) {
        return new Promise((resolve, _) => {
            const fileReader = new FileReader();
            fileReader.readAsDataURL(blob);
            fileReader.onloadend = function () {
                resolve(fileReader.result);
            }
        });
    }


    async function getQrCode(id) {

        let input = "http://127.0.0.1:4943/viewAuction/" + id;

        // console.log("Getting data url with input: ", input);
        let qr_result;
        qr_result = await fairbid_v1_backend.get_qr_code(input);


        const blob = new Blob([qr_result], { type: 'image/png' });
        let dataUrl = await convertToDataUrl(blob);
        // console.log("Qr_Data_Url: ", dataUrl);

        setQrData(dataUrl);
    }

    async function getBuyCode() {
        await fairbid_v1_backend.assign_buy_code(auctionId);
        const code = await fairbid_v1_backend.get_buy_code(auctionId);
        const secret = Number(code);
        // console.log("Buy Code: ", secret);
        setSecretCode(secret);

    }

    async function askQuestion() {
        await fairbid_v1_backend.ask_question(auctionId, question);

    }

    async function answerQuestion(id) {
        console.log("Answering question: ", id);
        if (visible) {
            await fairbid_v1_backend.answer_question(id, answer);

        } else {
            await fairbid_v1_backend.answer_question_private(id, answer);

        }



    }

    ////////////////////////////////////////////////////////

    //////////////////////// ELEMENTS //////////////////////


    const historyElements = auctionDetails?.bid_history.map(bid =>

        <tr key={+bid.price.toString()}>
            <td>
                {bid.price.toString()} ETH
            </td>
            <td>
                {convertUnixToDateTime(Number(bid.time.toString()))}
            </td>
            <td>
                {bid.originator.toString()}
            </td>
        </tr>
    );

    const conversationElements = conversations?.map((conversation, index) => {
        // console.log("__Conversation: ", conversation);
        // console.log("__user: ", user);
        // console.log("__originator: ", auctionDetails.originator.toString());

        // if (user == conversation.originator) {
        //     console.log("User is conversation originator")
        // }
        if (!conversation) {
            return null; // or some fallback JSX
        }




        return (
            <>

                {
                    <div key={index}>
                        {conversation.is_private ?


                            <div>

                                {user == conversation.originator.toString() &&

                                    <div>
                                        <hr className='hr-style' />
                                        <h3 style={{ marginBottom: 0 }} >Question: {conversation.question}</h3>
                                        <p className='small-text'>by {conversation.originator.toString()} </p>
                                        {conversation.answer && <p>Answer: {conversation.answer}</p>}

                                    </div>

                                }
                                {user == auctionDetails.originator.toString() &&

                                    <div>
                                        <hr className='hr-style' />
                                        <h3 style={{ marginBottom: 0 }}>Question: {conversation.question}</h3>
                                        <p className='small-text'>by {conversation.originator.toString()} </p>
                                        {conversation.answer && <p>Answer: {conversation.answer}</p>}

                                    </div>
                                }

                            </div>
                            :
                            <div>
                                <hr className='hr-style' />
                                <h3 style={{ marginBottom: 0 }}>Question: {conversation.question}</h3>
                                <p className='small-text'>by {conversation.originator.toString()} </p>
                                {conversation.answer && <p>Answer: {conversation.answer}</p>}


                            </div>


                        }




                        {user == auctionDetails.originator && remainingTime !== 0 && conversation.answer == "" &&

                            <div>
                                <input onChange={(e) => setAnswer(e.target.value)} type="text" placeholder="Answer the question" />
                                <input type="checkbox" onChange={(e) => setVisible(e.target.checked)} /> Public

                                <button onClick={() => answerQuestion(conversationIds[index])}>Answer</button>


                            </div>
                        }
                    </div>
                }
            </>



        );
    });

    ////////////////////////////////////////////////////////
    //////////////////////// BID SECTION ///////////////////

    // MAKE NEW OFFER //
    const makeNewOffer = async () => {
        try {
            setSaving(true);
            await fairbid_v1_backend.make_bid(auctionId, BigInt(newPrice));
            setLastError(undefined);
            setNewPrice(newPrice + 1);
            fetchFromBackend();
        } catch (error) {
            // change error handling here ->
            const errorText = error.toString();
            if (errorText.indexOf("Price too low") >= 0) {
                setLastError("Price too low");
            } else if (errorText.indexOf("Auction closed") >= 0) {
                setLastError("Auction closed");
            } else {
                setLastError(errorText);
            }
            return;
        } finally {
            setSaving(false);
        }
    };

    // get last bid
    const getLastBid = () => {
        if (auctionDetails == null) {
            return null;
        }
        let history = auctionDetails.bid_history;
        if (history.length == 0) {
            return null;
        }
        return history[history.length - 1];
    }

    if (newPrice == 0) {
        const currentBid = getLastBid();
        const proposedPrice = currentBid == null ? 1 : +currentBid.price.toString() + 1;
        setNewPrice(proposedPrice);
    }


    // HANDLE INPUTS //
    const handleNewPriceInput = (input) => {
        try {
            const value = parseInt(input);
            if (value >= 0) {
                setNewPrice(value);
            }
        } catch (error) {
            console.error(error);
        }
    }


    ////////////////////// DISPLAY SECTION //////////////////////


    const displayItem = (item) => {


        return (
            <>
                <div className='auction-show'>
                    <h1 className='color-gray' >{item.title}</h1>
                    <p className="color-gray" style={{ fontWeight: 200 }}>Starting Price: {auctionDetails?.starting_price.toString()} ETH</p>
                    <div className="auction-overview" style={{ fontWeight: 200 }}>

                        <div className="overview-description" style={{ fontWeight: 200 }}>{item.description}</div>

                        {imageData !== "" && (
                            <div className="overview-image"><img style={{ width: "30rem" }} src={imageData} alt="Auction Image" /></div>
                        )

                        }
                    </div>
                    {remainingTime !== 0 &&
                        <div style={{ marginBottom: "10rem", color: "lightgray" }} >
                            <h2>Remaining Time</h2>
                            <p>{remainingTime} seconds</p>
                        </div>
                    }
                    <p className="color-gray" style={{ fontWeight: 300 }}>Owner: {auctionDetails?.originator.toString()}</p>
                    
                    <p className="color-gray" style={{ fontWeight: 300 }}>Contact: {auctionDetails?.contact.toString()}</p>
                    <p className="color-gray" style={{ fontWeight: 300 }}>Location: {auctionDetails?.location.toString()}</p>


                </div>
            </>
        );
    }

    // SHOW HISTORY //
    const showHistory = () => {
        return (

            <div className="section">
                {/* remainig time */}



                <h2>History</h2>

                <table className='bid-table'>
                    <thead>
                        <tr>
                            <th>Price</th>
                            <th>Time </th>
                            <th>Originator</th>
                        </tr>
                    </thead>
                    <tbody>
                        {historyElements}
                    </tbody>
                </table>




            </div>
        );
    }

    // SHOW QUESTIONS AND ANSWERS //
    const showQuestions = () => {
        return (


            <div className="questions">
                {conversationElements}
            </div>

        );
    }


    // SHOW BID FORM //
    const showBidForm = () => {
        if (!authenticated) {
            return (<h2 className="error-message">Need to sign in to bid</h2>);
        }
        return (
            <div className="section" style={{ marginTop: 0, paddingTop: 0 }}>
                <h3>Auction ends at: {convertUnixToDateTime(Number(auctionDetails?.end_time.toString()))}</h3>
                <h2>New Bid</h2>


                <div className="bid-form">
                    <input type="number" value={newPrice} onChange={(e) => handleNewPriceInput(e.target.value)} />
                    <button onClick={makeNewOffer} disabled={saving} style={{ opacity: saving ? 0.5 : 1 }}>
                        Bid {newPrice} ETH
                    </button>
                </div>
                {lastError != null &&
                    <p className="error-message">{lastError}</p>
                }
            </div>
        );
    }

    // show ask form
    const showAskForm = () => {
        if (!authenticated) {
            return (<h4 className="error-message">Need to sign in to ask question</h4>);
        }
        return (
            <div className="ask-form">
                <h2 style={{ color: "lightgray" }}>Ask to Seller</h2>
                <div className="ask-form">
                    <TextField
                        id="filled-multiline-static"
                        label="Ask a question"
                        multiline
                        rows={1}
                        onChange={(e) => setQuestion(e.target.value)}
                        fontFamily="Kanit"

                        variant="filled"
                        sx={{ backgroundColor: "#3B464B", color: "white" }}


                    />
                    {/* <input onChange={ (e) => setQuestion(e.target.value) } type="text" placeholder="Ask a question" /> */}
                    <button onClick={askQuestion}>Ask</button>

                </div>
            </div>
        );
    }

    // SHOW REVEAL SECRET CODE BUTTON //
    const showRevealSecretCode = () => {
        if (remainingTime == 0) {
            return (
                <div className="section">
                    <h2>Buy Code</h2>
                    <p>{secretCode}</p>
                    <button style={{ background: "white", color: "black" }} onClick={getBuyCode} >Click to Reveal</button>


                </div>
            );
        }
    }


    ////////////////////// RENDER ALL PAGE //////////////////////
    const showAuction = () => {
        if (auctionDetails == null) {
            throw Error("undefined auction");
        }
        const currentBid = getLastBid();
        return (
            <>

                <h1 style={{ color: "lightgray", fontSize: "1.8rem", display: " flex", justifyContent: 'flex-start', marginLeft: "8rem", marginTop: "3rem", fontWeight: 100 }}>Auction No {Number(auctionId).toString()}</h1>
                <hr className='hr-style' />
                <Grid container spacing={1} sx={{ marginTop: "4rem" }} >
                    <Grid item xs={6} >

                        {displayItem(auctionDetails.item)}

                    </Grid>

                    <Grid item xs={6} sx={{ paddingLeft: "10rem", paddingRight: "10rem" }}>
                        {
                            currentBid != null &&
                            <div className="section">
                                <h2>{remainingTime == 0 ? "Final Deal" : "Current Bid"}</h2>
                                <p className="main-price">{currentBid.price.toString()} ETH</p>
                                <p>by {currentBid.originator.toString()}</p>
                                <p>{convertUnixToDateTime(Number(currentBid.time.toString()))}</p>

                            </div>

                        }
                        {showRevealSecretCode()}
                        {remainingTime !== 0 ?
                            showBidForm()
                            :
                            <h2 className="error-message">Auction Closed</h2>
                        }
                        {showHistory()}


                    </Grid>
                </Grid>

                <hr className='hr-style' />
                {conversations !== undefined && showQuestions()}
                {remainingTime !== 0 && showAskForm()}


                <h2>QR Code</h2>
                {qrData !== "" && (
                    <div className="overview-image"><img src={qrData} alt="Auction Image/Qr Code" /></div>
                )}




            </>
        );
    }



    return (
        <>
            {auctionDetails == null ?
                <div className="section">Loading</div>
                :
                showAuction()
            }
        </>
    );
}

export default AuctionDetail;
