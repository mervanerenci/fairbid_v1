use candid::{CandidType, Decode, Deserialize, Encode, Principal};
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{BoundedStorable, DefaultMemoryImpl, StableBTreeMap, Storable};
use std::{borrow::Cow, cell::RefCell};
use std::collections::HashMap;
use ic_cdk::*;
use ic_cdk::call;

mod eng_auction;

// TYPES START //

type Memory = VirtualMemory<DefaultMemoryImpl>;
type Items = HashMap<AuctionId, ItemDetails>;


type QuestionMap = HashMap<QuestionId, Conversation>;
type ConversationMap = HashMap<AuctionId, Vec<u64>>;
type BuyCodes = HashMap<AuctionId, u64>;

type QuestionId = u64;

// tOdO: 
// type DutchAuctions = HashMap<AuctionId, DutchAuction>; 
// type SbAuctions = HashMap<AuctionId, SbAuction>;
// ...

const MAX_VALUE_SIZE: u32 = 5000;
const IMAGE_SIZE_IN_PIXELS: u32 = 1024;


#[derive(CandidType, Deserialize, Clone)]
pub struct Item {
    title: String,
    description: String,
    // owner: Principal,
}

#[derive(CandidType, Deserialize, Clone)]
pub struct ItemDetails {
    item: Item,
    image: Vec<u8>,
}

#[derive(CandidType, Deserialize, Clone)]
pub struct Bid {
    price: u64,
    time: u64,
    originator: Principal,
}

pub type AuctionId = u64;

#[derive(CandidType)]
pub struct AuctionOverview {
    id: AuctionId,
    item: Item,
}

#[derive(CandidType)]
pub struct AuctionDetails {
    item: Item,
    bid_history: Vec<Bid>,
    end_time: u64,
    starting_price: Option<u64>,
    originator: Principal,
    contact: String,
    location: String,
}

#[derive(CandidType, Deserialize, Clone)]
pub struct Auction {
    id: AuctionId,
    item: Item,
    bid_history: Vec<Bid>,
    end_time: u64,
    remaining_time: u64,
    starting_price: Option<u64>,
    originator: Principal,
    contact: String,
    location: String,
}

#[derive(CandidType, Deserialize, Clone)]
pub struct Conversation {
    question: String,
    answer: String,
    originator: Principal,
    is_private: bool,
}

// pub enum AuctionType {
//     English,
//     Dutch,
//     SealedBid,
// }

//TYPES END //

impl Storable for Auction {
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }
}

impl BoundedStorable for Auction {
    const MAX_SIZE: u32 = MAX_VALUE_SIZE;
    const IS_FIXED_SIZE: bool = false;
}

thread_local! {

    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> = RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));
    pub static ENGLISH_AUCTION_MAP: RefCell<StableBTreeMap<AuctionId, Auction, Memory>> = RefCell::new(StableBTreeMap::init(MEMORY_MANAGER.with(|mm| mm.borrow().get(MemoryId::new(0)))));
    pub static ITEMS: RefCell<Items> = RefCell::default();
    pub static CONVERSATION_MAP: RefCell<ConversationMap> = RefCell::default();
    pub static QUESTION_MAP: RefCell<QuestionMap> = RefCell::default();
    static BUY_CODE_MAP: RefCell<BuyCodes> = RefCell::default();

    // tOdO:
    // static DUTCH_AUCTION_MAP: RefCell<DutchAuctions> = RefCell::default();
    // static SB_AUCTION_MAP: RefCell<SbAuctions> = RefCell::default();
    // CREDITS
    // USERS
    // SCHEDULED_AUCTIONS_MAP
    // ASK_MAP
    // BUY_CODE_MAP
    
}


// FUNCTIONS START //

// get secret random number for secure communication between highest bidder and auctioneer
#[ic_cdk::update]
pub async fn random_number() -> u64 {
    let (random_bytes,): (Vec<u8>,) = call(Principal::management_canister(), "raw_rand", ()).await.unwrap();
    let mut number: u32 = 0;
    for i in 0..4 {
        number = (number << 8) | (random_bytes[i] as u32);
    }
    (number % 1_000_000).into()
}

#[ic_cdk::update]
// assign buy code to auction id for secure communication between highest bidder and auctioneer
pub async fn assign_buy_code(auction_id: AuctionId) {
    // if buy code is already assigned, return
    if BUY_CODE_MAP.with(|buy_code_map| buy_code_map.borrow().contains_key(&auction_id)) {
        return;
    }

    let buy_code = random_number().await;
    BUY_CODE_MAP.with(|buy_code_map| {
        buy_code_map.borrow_mut().insert(auction_id, buy_code);
    });
}

#[ic_cdk::query]
// get buy code for auction id
pub fn get_buy_code(auction_id: AuctionId) -> u64 {
    // if caller is not the auction owner nor the highest bidder, return

    BUY_CODE_MAP.with(|buy_code_map| {
        buy_code_map.borrow().get(&auction_id).unwrap().clone()
    })
}

// who_am_i function to get the caller's principal
#[ic_cdk::query]
pub fn who_am_i() -> Principal {
    api::caller()
}




