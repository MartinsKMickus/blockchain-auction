const auction = artifacts.require("Auction");

module.exports = function (deployer) {
  deployer.deploy(auction);
};
