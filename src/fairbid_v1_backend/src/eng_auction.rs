use ic_cdk::*;
use ic_cdk_timers::set_timer;
use std::time::Duration;
use candid::{Principal};
use qrcode_generator::QrCodeEcc;

use crate::{ITEMS, ENGLISH_AUCTION_MAP, CONVERSATION_MAP, QUESTION_MAP, Conversation, Auction, Item, ItemDetails, Bid, AuctionId, AuctionOverview, AuctionDetails, QuestionId, QuestionMap};


// FUNCTIONS //

// Create a new auction
// Duration is in seconds
#[ic_cdk::update]
fn new_auction(item: Item, price: u64, duration: u64, contact: String, location: String, image: Vec<u8>) {
    let item_clone = item.clone();
    ENGLISH_AUCTION_MAP.with(|am| {
        let mut auction_map = am.borrow_mut();
        let id = auction_map.len() as AuctionId;

        let auction = Auction {
            id: id,
            item: item_clone,
            bid_history: Vec::new(),
            end_time: api::time() + duration * 1_000_000_000,
            remaining_time: duration,
            starting_price: Some(price),
            originator: api::caller(),
            contact: contact,
            location: location,

        };

        

        // Clone the auction before inserting it into the map
        let auction_clone = auction.clone();
        let auction_id = auction.id;
        auction_map.insert(id, auction_clone);

        ITEMS.with(|items| {
            let mut items_map = items.borrow_mut();
            items_map.insert(auction_id, ItemDetails {
                item: item,
                image: image,
            });
        });

        // Schedule the end_auction function to be called after duration seconds
        set_timer(Duration::from_secs(duration), move || {
            end_auction(auction.id).unwrap();
        });
    });

    
}

#[ic_cdk::query]
fn get_auction(id: AuctionId) -> Option<Auction> {
    ENGLISH_AUCTION_MAP.with(|am| {
        let auction_map = am.borrow();
        auction_map.get(&id).clone()
    })
}

#[ic_cdk::query]
fn get_all_auctions_by_originator() -> Vec<Auction> {
    ENGLISH_AUCTION_MAP.with(|am| {
        let auction_map = am.borrow();
        auction_map
            .iter()
            .filter(|(_, auction)| auction.originator == api::caller())
            .map(|(_, auction)| auction.clone())
            .collect()
    })
}




#[ic_cdk::update]
fn end_auction(id: AuctionId) -> Result<(), &'static str> {
    if api::caller() != api::id() {
        return Err("Only the canister itself can call this function");
    }

    ENGLISH_AUCTION_MAP.with(|am| {
        let mut auction_map = am.borrow_mut();
        if let Some(mut auction) = auction_map.get(&id).clone() {
            auction.remaining_time = 0;
            auction_map.insert(id, auction);
        }
    });

    Ok(())
}

#[ic_cdk::update]
fn make_bid(id: AuctionId, price: u64) -> Result<(), &'static str> {
    ENGLISH_AUCTION_MAP.with(|am| {
        let mut auction_map = am.borrow_mut();
        if let Some(mut auction) = auction_map.get(&id).clone() {
            if auction.remaining_time == 0 {
                return Err("Auction has ended");
            }

            if price <= auction.starting_price.unwrap() {
                return Err("Bid must be higher than the starting price");
            }

            if let Some(highest_bid) = auction.bid_history.last() {
                if price <= highest_bid.price {
                    return Err("Bid must be higher than the current highest bid");
                }
            }

            let bid = Bid {
                price: price,
                time: api::time(),
                originator: api::caller(),
            };

            auction.bid_history.push(bid);
            auction_map.insert(id, auction);
            Ok(())
        } else {
            Err("Auction not found")
        }
    })
}

// 
#[ic_cdk::query]
fn get_auction_details(id: AuctionId) -> Option<AuctionDetails> {
    ENGLISH_AUCTION_MAP.with(|am| {
        let auction_map = am.borrow();
        auction_map.get(&id).map(|auction| AuctionDetails {
            item: auction.item.clone(),
            bid_history: auction.bid_history.clone(),
            end_time: auction.end_time,
            starting_price: auction.starting_price,
            originator: auction.originator,
            contact: auction.contact.clone(),
            location: auction.location.clone(),
        })
    })
}

#[ic_cdk::query]
fn get_auction_originator(id: AuctionId) -> Option<Principal> {
    ENGLISH_AUCTION_MAP.with(|am| {
        let auction_map = am.borrow();
        auction_map.get(&id).map(|auction| auction.originator)
    })
}

#[ic_cdk::query]
fn get_item_image(id: AuctionId) -> Vec<u8> {
    ITEMS.with(|items| {
        let items_map = items.borrow();
        items_map.get(&id).map(|item| item.image.clone()).unwrap()
    })
}


// Returns in Nanoseconds
#[ic_cdk::query]
fn get_remaining_time(id: AuctionId) -> Option<u64> {

    ENGLISH_AUCTION_MAP.with(|am| {
        let auction_map = am.borrow();
        auction_map.get(&id).map(|auction|

            if auction.remaining_time == 0 {
                0
            } else {
                auction.end_time - api::time()
            }
            
            )

    })
}

#[ic_cdk::query]
fn get_overview_list() -> Vec<AuctionOverview> {
    ENGLISH_AUCTION_MAP.with(|am| {
        let auction_map = am.borrow();
        auction_map
            .iter()
            .map(|(id, auction)| AuctionOverview {
                id: id, // remove the dereference operator here
                item: auction.item.clone(),
            })
            .collect()
    })
}

#[ic_cdk::query]
fn get_active_auctions() -> Vec<AuctionOverview> {
    ENGLISH_AUCTION_MAP.with(|am| {
        let auction_map = am.borrow();
        auction_map
            .iter()
            .filter(|(_, auction)| auction.remaining_time > 0)
            .map(|(id, auction)| AuctionOverview {
                id: id, // remove the dereference operator here
                item: auction.item.clone(),
            })
            .collect()
    })
}

#[ic_cdk::query]
fn get_ended_auctions() -> Vec<AuctionOverview> {
    ENGLISH_AUCTION_MAP.with(|am| {
        let auction_map = am.borrow();
        auction_map
            .iter()
            .filter(|(_, auction)| auction.remaining_time == 0)
            .map(|(id, auction)| AuctionOverview {
                id: id, // remove the dereference operator here
                item: auction.item.clone(),
            })
            .collect()
    })
}


#[ic_cdk::query]
fn get_all_auctions() -> Vec<AuctionOverview> {
    ENGLISH_AUCTION_MAP.with(|am| {
        let auction_map = am.borrow();
        auction_map
            .iter()
            .map(|(id, auction)| AuctionOverview {
                id: id, // remove the dereference operator here
                item: auction.item.clone(),
            })
            .collect()
    })
}



#[ic_cdk::query]
fn get_highest_bid_details(id: AuctionId) -> Option<Bid> {
    ENGLISH_AUCTION_MAP.with(|am| {
        let auction_map = am.borrow();
        auction_map
            .get(&id)
            .and_then(|auction| auction.bid_history.last().map(|bid| bid.clone()))
    })
}

// get highest bidder's principal id
#[ic_cdk::query]
fn get_highest_bidder(id: AuctionId) -> Option<Principal> {
    ENGLISH_AUCTION_MAP.with(|am| {
        let auction_map = am.borrow();
        auction_map
            .get(&id)
            .and_then(|auction| auction.bid_history.last().map(|bid| bid.originator.clone()))
    })
}

// delete the Option part if error persists
#[ic_cdk::query]
fn get_all_bids(id: AuctionId) -> Option<Vec<Bid>> {
    ENGLISH_AUCTION_MAP.with(|am| {
        let auction_map = am.borrow();
        auction_map.get(&id).map(|auction| auction.bid_history.clone())
    })
}

// #[ic_cdk::query]
// fn get_highest_bid(id: AuctionId) -> Option<u64> {
//     AUCTION_MAP.with(|am| {
//         let auction_map = am.borrow();
//         auction_map
//             .get(&id)
//             .and_then(|auction| auction.bid_history.last().map(|bid| bid.price))
//     })
// }


////  q&a functions ////

// ask for an item
#[ic_cdk::update]
fn ask_question(id: AuctionId, question: String) {
    // record question to question map
    QUESTION_MAP.with(|qm| {
        let mut question_map = qm.borrow_mut();
        let _id = question_map.len() as QuestionId;

        let question = Conversation {
            question: question,
            answer: "".to_string(),
            originator: api::caller(),
            is_private: true,
        };

        question_map.insert(_id, question.clone());

        // add questions id to Conversation (AuctionId,Vec<u64> )map(u64-vec<u64>)
        CONVERSATION_MAP.with(|cm| {
            let mut conversation_map = cm.borrow_mut();
            if let Some(question_ids) = conversation_map.get_mut(&id) {
                question_ids.push(_id);
            } else {
                conversation_map.insert(id, vec![_id]);
            }
        });
    });
}

// answer a question
#[ic_cdk::update]
fn answer_question(id: u64, answer: String) {
    QUESTION_MAP.with(|qm| {
        let mut question_map = qm.borrow_mut();
        if let Some(question) = question_map.get(&id).cloned() {
            let mut question = question;
            question.answer = answer;
            question.is_private = false;
            question_map.insert(id, question);
        }
    });
}

//answer a question privately
#[ic_cdk::update]
fn answer_question_private(id: u64, answer: String) {
    QUESTION_MAP.with(|qm| {
        let mut question_map = qm.borrow_mut();
        if let Some(question) = question_map.get(&id).cloned() {
            let mut question = question;
            question.answer = answer;
            question_map.insert(id, question);
        }
    });
}


#[ic_cdk::query]
fn get_questions(id: u64) -> Vec<Conversation> {
    let mut questions = Vec::new();
    let mut question_ids = Vec::new();
    question_ids = get_question_ids_by_auction_id(id);

    questions = get_questions_by_ids(question_ids);

    questions
        
}

// get question by its id 
#[ic_cdk::query]
fn get_question(id: u64) -> Option<Conversation> {
    QUESTION_MAP.with(|qm| {
        let question_map = qm.borrow();
        question_map.get(&id).cloned()
    })
}


// get questions by auction id
#[ic_cdk::query]
fn get_question_ids_by_auction_id(id: u64) -> Vec<u64> {
    let mut question_ids = Vec::new();

    // Access the CONVERSATION_MAP using the provided id
    CONVERSATION_MAP.with(|cm| {
        let conversation_map = cm.borrow();

        // If the id exists in the CONVERSATION_MAP, get the vector of question ids
        if let Some(ids) = conversation_map.get(&id) {
            question_ids = ids.clone();
        }
    });

    question_ids
}

#[ic_cdk::query]
fn get_questions_by_ids(ids: Vec<u64>) -> Vec<Conversation> {
    let mut conversations = Vec::new();

    // For each id in the vector, access the QUESTION_MAP and get the Conversation
    QUESTION_MAP.with(|qm| {
        let question_map = qm.borrow();
        for id in ids {
            if let Some(conversation) = question_map.get(&id) {
                conversations.push(conversation.clone());
            }
        }
    });

    conversations
}



// delete a question
#[ic_cdk::update]
fn delete_question(id: u64) {
    CONVERSATION_MAP.with(|am| {
        let mut ask_map = am.borrow_mut();
        ask_map.remove(&id);
    });
}


#[ic_cdk::update]
fn get_qr_code(string: String ) -> Vec<u8> {
    let result: Vec<u8> = qrcode_generator::to_png_to_vec(string, QrCodeEcc::Low, 1024).unwrap();
    result
}




// http call to convert local currency to usd, using convert.rs http call
// #[ic_cdk::update]
// async fn get_conversion_to_usd(from: String, amount: f64) -> String {
//     let conversion = convert::convert_to_usd(from, amount).await;
//     conversion
// }
