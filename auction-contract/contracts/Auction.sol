// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.19;

/** 
 * @title Auction
 * @dev Implements voting process along with vote delegation
 */
contract Auction {

    address organizer;

    // Same Phase will be used for contract as well as item
    enum Phase {Open,Stopped,Closed}
    // Check conversion or floating point (this is not possible)!!!
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
        mapping(address => Bidder) bidders;
        // To get bidder info after stopping item sale or contract closing
        address[] allBidders;
        Phase state;
    }
    mapping(uint => item) items;
    uint[] allItems;

    // Modifiers
    modifier onlyOrganizer() {
        require(msg.sender == organizer, "Only Auction Organizer Can Call This Function!");
        _;
    }

    // Constructor and functions
    constructor(uint sellerJoinFee, uint sellerSellFeePercentage) {
        organizer = msg.sender;
        joinFee = sellerJoinFee;
        sellFeePercentage = sellerSellFeePercentage;
    }

    function changeState(Phase p) private {
        require (state < p, "Invalid State Change Requested!");
        state = p;
    }

    function stopJoining() onlyOrganizer public {
        changeState(Phase.Stopped);
    }

    function addItem(uint itemid, uint price, uint bidstep) payable public {
        require(msg.value == joinFee, "Value Sent Is Not Same As Join Fee!");
        require(price > 0, "Price Must Be More Than 0!");
        require(bidstep >= 0, "Bid Step Must Be 0 Or More!");
        payable(organizer).transfer(msg.value);
    }
}