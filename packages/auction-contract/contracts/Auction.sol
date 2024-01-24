// SPDX-License-Identifier: UNLICENSED

pragma solidity 0.8.19;

/** 
 * @title Auction
 * @dev Implements auction process
 */
contract Auction {

    address organizer;

    // Same Phase will be used for contract as well as item. Invalid for empty items.
    enum Phase {Invalid,Open,Stopped,Closed}
    uint joinFee;
    uint sellFeePercentage;
    Phase state = Phase.Open;

    struct Bidder {
        address bidder;
        // Amount DANGER of what currency???
        uint amount;
    }
    struct item {
        address seller;
        uint itemID; // Probably won't need if items will be mapping and mapping will have itemID
        uint bidStep;
        uint lastPrice;
        address winner;
        // mapping(address => Bidder) bidders;
        // To get bidder info after stopping item sale or contract closing
        // address[] allBidders;
        Phase state;
    }
    mapping(uint => item) items;
    uint[] allItems;

    // Modifiers
    modifier onlyOrganizer() {
        require(msg.sender == organizer, "Only Auction Organizer Can Call This Function!");
        _;
    }

    modifier onlySeller(uint itemid) {
        require(items[itemid].seller == msg.sender, "Only Seller Of This Item Can Call This Function!");
        _;
    }

    modifier validPhase(Phase requiredPhase) {
        require(state == requiredPhase, "Current Contract State Is Wrong!");
        _;
    }

    modifier validItemPhase(uint itemid) {
        require(items[itemid].state == Phase.Open, "Item Phase Is Closed And Function Cannot Be Called!");
        _;
    }

    // Constructor and functions
    constructor(uint sellerJoinFee, uint sellerSellFeePercentage) {
        require(0 <= sellerSellFeePercentage && sellerSellFeePercentage <= 100, "Sell Fee Percentage Wrong!");
        organizer = msg.sender;
        joinFee = sellerJoinFee;
        sellFeePercentage = sellerSellFeePercentage;
    }

    function changeState(Phase p) private {
        require (state < p, "Invalid State Change Requested!");
        state = p;
    }

    function stopJoining() onlyOrganizer validPhase(Phase.Open) public {
        changeState(Phase.Stopped);
    }

    function closeItemBidding(uint itemid) private returns (bool) {
        items[itemid].state = Phase.Closed;
        if (items[itemid].winner == address(0)) {
            return false;
        }
        uint organizerFee = sellFeePercentage*items[itemid].lastPrice/100;
        payable(organizer).transfer(organizerFee);
        // items[itemid].lastPrice -= organizerFee;
        payable(items[itemid].seller).transfer(items[itemid].lastPrice - organizerFee);
        return true;
    }

    function closeContract() onlyOrganizer public {
        require(state != Phase.Closed);
        // Iterate through items, change their phase and transfer money
        for (uint i = 0; i < allItems.length; i++) 
        {
            if (items[allItems[i]].state != Phase.Closed) {
                closeItemBidding(allItems[i]);
            }
        }
        state = Phase.Closed;
    }

    function addItem(uint itemid, uint price, uint bidstep) validPhase(Phase.Open) payable public {
        require(msg.value == joinFee, "Value Sent Is Not Same As Join Fee!");
        require(price > 0, "Price Must Be More Than 0!");
        require(bidstep >= 0, "Bid Step Must Be 0 Or More!");
        // Check if item wasn't in sale already
        require(items[itemid].state == Phase.Invalid, "Item Already Exists!");
        items[itemid].seller = msg.sender;
        items[itemid].bidStep = bidstep;
        items[itemid].lastPrice = price;
        // At start seller is winner
        // items[itemid].winner = msg.sender;
        items[itemid].state = Phase.Open;
        allItems.push(itemid);
        payable(organizer).transfer(msg.value);
    }

    // Returns true if there is a winner
    function stopBidding(uint itemid) onlySeller(itemid) public returns(bool) {
        require(items[itemid].state == Phase.Open, "Cannot Stop Bidding Because Item Is Not In Sale!");
        return closeItemBidding(itemid);
    }

    function getWinner(uint itemid) public view returns(address) {
        return items[itemid].winner;
    }

    function getLastPrice(uint itemid) public view returns(uint) {
        return items[itemid].lastPrice;
    }

    function getBidStep(uint itemid) public view returns(uint) {
        return items[itemid].bidStep;
    }

    function bid(uint itemid) public payable {
        require(items[itemid].state == Phase.Open, "Item Is Not On Sale!");
        require(items[itemid].bidStep <= msg.value - items[itemid].lastPrice, "Bid Step Is Higher Than Bidding!");
        if (items[itemid].winner != address(0)) {
            payable(items[itemid].winner).transfer(items[itemid].lastPrice);
        }
        items[itemid].lastPrice = msg.value;
        items[itemid].winner = msg.sender;
    }
}