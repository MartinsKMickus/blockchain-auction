
function ethToWei(ethVal) {
    return (ethVal * 1e18).toString();
}

function weiToEth(weiVal) {
    // console.log(weiVal);
    return (weiVal / 1e18).toString();
}

class AuctionApp {
    constructor() {
        // Initialize variables
        this.blockchainUrl = 'http://127.0.0.1:7545'; // Blockchain node URL
        // this.abi = null; // Contract ABI (Application Binary Interface) Not used
        this.contractAddress = null; // Contract address on the blockchain
        this.contract = null;
        this.joinFee = null;
        // this.joinFee = 1000000;
        // this.contracts = {}; // Object to store deployed contract instances
        // this.names = []; // Array to store auction names
        // this.organizer = null; // Organizer for the auction
        this.currentAccount = null; // Current user's account
        // console.log("Trying to get provider");
        this.provider = this.getDefaultWeb3Provider(); // Web3 provider (e.g., MetaMask)
        // .then((provider) => {
        // this.web3Provider = provider;
        // Initialize Web3 and contract
        this.initEthereum();
        this.initContract();
        this.bindEvents();
        this.determineContractAddress()
            .then(() => this.getAuctionItems())
            .catch((error) => {
                console.error(error);
            })

        // }); 
    }

    // Not used???
    getDefaultWeb3Provider() {
        // Implement logic to determine the default Web3 provider
        // For example, check if MetaMask is available and use it
        // Otherwise, use a default provider or prompt the user to install MetaMask
        if (typeof ethereum !== 'undefined') {
            console.log("Wallet is installed!");
            return ethereum;
        } else {
            console.warn("Wallet is not installed browser!");
            document.documentElement.style.display = 'none';
            alert("Please install browser wallet extension such as Coinbase (maybe MetaMask)");
            // this.web3 = new Web3(this.blockchainUrl);
            // return new Web3.providers.HttpProvider(this.blockchainUrl); // USELESS
        }
    }

    // async fetchContractABI() {
    //     // Implement logic to fetch or determine the contract ABI dynamically
    //     // For example, make an API request to fetch the ABI from a server
    //     return '...'; // Default or dynamically determined ABI
    // }

    async determineContractAddress() {
        await fetch('auctionAddress.json')
            .then(response => {
                if (!response.ok) {
                    alert("Smart Contract Is Not Initialized! Please Create One!")
                    throw new Error('Problem getting auction address!');
                }
                return response.json();
            })
            .then(data => {
                // for (var i = 0; i < data.length; i++) {
                // console.log(data);
                this.contractAddress = data.contractAddress;
                this.joinFee = data.joinFee;

                console.log(`Contract address loaded: ${data.contractAddress}`);
                console.log(`Contract join fee loaded: ${weiToEth(data.joinFee)}ETH`);
                document.getElementById("register_div").style.display = 'none';
                document.getElementById("add_item_form").style.display = '';
                document.getElementById("closeopenbuttons").style.display = '';
                // }
            })
        // .catch(error => {
        //     console.error('Error getting contract address:', error);
        // })
    }

    async initEthereum() {
        try {

            // Get the current user's account
            // const accounts = await this.web3.eth.getAccounts();
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            // console.log("Accounts: ", accounts);
            this.currentAccount = accounts[0];
            document.getElementById("address_welcome").textContent = "Welcome! " + this.currentAccount;

            // Watch for account changes
            ethereum.on('accountsChanged', function (accounts) {
                location.reload();
                // this.currentAccount = accounts[0];
                // document.getElementById("address_welcome").textContent = "Welcome! " + this.currentAccount;
            })

        } catch (error) {
            console.error('Error initializing Web3:', error);
        }
    }

    async initContract() {
        try {
            fetch('Auction.json')
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Auction.json Unreachable!');
                    }
                    return response.json();
                })
                .then(data => {
                    // console.log(data);
                    var voteArtifact = data;
                    // this.abi = voteArtifact.abi; Not used
                    this.contract = TruffleContract(voteArtifact);
                    // Set the provider for our contract
                    this.contract.setProvider(ethereum);
                })
        } catch (error) {
            console.error('Error initializing contract:', error);
        }
    }

    async bindEvents() {
        // $(document).on('click', '#register', App.handleRegister);
        document.addEventListener('click', (event) => {
            // Check if the clicked element has the id 'register'
            if (event.target.id === 'register') {
                var joinFee = document.getElementById("joiningFee").value;
                var sellingFee = document.getElementById("sellFee").value;
                joinFee = ethToWei(joinFee);
                // console.log(joinFee);
                // console.log(sellingFee);
                // Call the handleRegister function
                this.handleRegister(joinFee, sellingFee);
            }
            if (event.target.id === 'stopJoining') {
                this.handleStopJoining();
            }
            if (event.target.id === 'closeContract') {
                this.handleCloseContract();
            }
            if (event.target.classList.contains('button-type-bid')) {
                var dataId = event.target.getAttribute('data-id');

                // Check if dataId is not null or undefined before proceeding
                if (dataId !== null && dataId !== undefined) {
                    // Convert dataId to a number if needed
                    var numericDataId = parseInt(dataId, 10);
                    // console.log('Clicked button with data-id:', numericDataId);
                    var inputElement = document.querySelector(`[data-id="${numericDataId}"]`);
                    if (inputElement) {
                        // Get the value of the input field
                        var inputValue = inputElement.value;
                        this.handleBidding(numericDataId, inputValue);
                    } else {
                        alert('Input element not found. Call developers!');
                    }

                    // Call the handleRegister function
                } else {
                    alert('Something went wrong! Call developers!');
                }
            }
            if (event.target.id === 'addItem') {
                // TODO: Replace with actual variables
                var itemName = document.getElementById("item-name-input").value;
                var itemPrice = ethToWei(document.getElementById("item-price-input").value);
                var itemBidStep = ethToWei(document.getElementById("item-bid-step-input").value);
                var input = document.getElementById('itemImageFile');
                if (! "files" in input || input.files.length == 0) {
                    alert("Please choose an image!");
                    return;
                }
                var imageFile = input.files[0];
                console.log("Item name: ", itemName);
                console.log("Item price: ", itemPrice);
                console.log("Item bid step: ", itemBidStep);
                this.handleAddItem(imageFile, itemName, itemPrice, itemBidStep);
            }
            if (event.target.classList.contains('button-type-get-price')) {
                var dataId = event.target.getAttribute('data-id');

                // Check if dataId is not null or undefined before proceeding
                if (dataId !== null && dataId !== undefined) {
                    // Convert dataId to a number if needed
                    var numericDataId = parseInt(dataId, 10);
                    // console.log('Clicked button with data-id:', numericDataId);
                    var inputElement = document.querySelector(`[data-id="${numericDataId}"].price-output`);
                    if (inputElement) {
                        // Get the value of the input field
                        // inputElement.value = 1000;
                        this.handleGetLastPrice(numericDataId)
                            .then(bidAmount => {
                                inputElement.value = bidAmount;
                            })
                    } else {
                        alert('Input element not found. Call developers!');
                    }

                    // Call the handleRegister function
                } else {
                    alert('Something went wrong! Call developers!');
                }
            }
            if (event.target.classList.contains('button-type-get-bid-step')) {
                var dataId = event.target.getAttribute('data-id');

                // Check if dataId is not null or undefined before proceeding
                if (dataId !== null && dataId !== undefined) {
                    // Convert dataId to a number if needed
                    var numericDataId = parseInt(dataId, 10);
                    // console.log('Clicked button with data-id:', numericDataId);
                    var inputElement = document.querySelector(`[data-id="${numericDataId}"].bid-step-output`);
                    if (inputElement) {
                        // Get the value of the input field
                        // inputElement.value = 1000;
                        this.handleGetBidStep(numericDataId)
                            .then(bidAmount => {
                                inputElement.value = bidAmount;
                            })
                    } else {
                        alert('Input element not found. Call developers!');
                    }

                    // Call the handleRegister function
                } else {
                    alert('Something went wrong! Call developers!');
                }
            }
            if (event.target.classList.contains('button-type-stop-bid')) {
                var dataId = event.target.getAttribute('data-id');

                // Check if dataId is not null or undefined before proceeding
                if (dataId !== null && dataId !== undefined) {
                    // Convert dataId to a number if needed
                    var numericDataId = parseInt(dataId, 10);
                    // console.log('Clicked button with data-id:', numericDataId);
                    var inputElement = document.querySelector(`[data-id="${numericDataId}"].bid-step-output`);
                    if (inputElement) {
                        // Get the value of the input field
                        // inputElement.value = 1000;
                        this.handleStopBid(numericDataId)
                            .then(() => {
                                return;
                            })
                    } else {
                        alert('Input element not found. Call developers!');
                    }

                    // Call the handleRegister function
                } else {
                    alert('Something went wrong! Call developers!');
                }
            }
            if (event.target.classList.contains('button-type-get-winner')) {
                var dataId = event.target.getAttribute('data-id');

                // Check if dataId is not null or undefined before proceeding
                if (dataId !== null && dataId !== undefined) {
                    // Convert dataId to a number if needed
                    var numericDataId = parseInt(dataId, 10);
                    // console.log('Clicked button with data-id:', numericDataId);
                    var inputElement = document.querySelector(`[data-id="${numericDataId}"].bid-step-output`);
                    if (inputElement) {
                        // Get the value of the input field
                        // inputElement.value = 1000;
                        this.handleGetWinner(numericDataId)
                            .then((winner) => {
                                alert(`Winner is: ${winner}`);
                            })
                    } else {
                        alert('Input element not found. Call developers!');
                    }

                    // Call the handleRegister function
                } else {
                    alert('Something went wrong! Call developers!');
                }
            }
        });
    }

    // Add methods for interacting with the contract and managing the auction

    // Example method to get auction names
    async getAuctionItems() {
        try {
            await fetch('items.json')
                .then(response => {
                    if (!response.ok) {
                        throw new Error('items.json Unreachable!');
                    }
                    return response.json();
                })
                .then(data => {
                    var proposalsRow = document.getElementById('itemsRow');
                    var proposalTemplate = document.getElementById('proposalTemplate');

                    for (var i = 0; i < data.length; i++) {
                        // Clone the template content
                        var template = document.createElement('template');
                        template.innerHTML = proposalTemplate.innerHTML;

                        // Update the cloned template content with data
                        template.content.querySelector('.card-title').textContent = "ID: " + data[i].id + " " + data[i].name;
                        template.content.querySelector('img').setAttribute('src', data[i].picture);
                        var elementsForId = template.content.querySelectorAll('.btn, input');
                        elementsForId.forEach(function (element) {
                            element.setAttribute('data-id', data[i].id.toString(10))
                        })
                        // template.content.querySelector('.btn').setAttribute('data-id', i.toString(10));
                        // template.content.querySelector('input').setAttribute('data-id', i.toString(10));

                        // Append the cloned template to the proposalsRow
                        proposalsRow.appendChild(template.content);
                    }
                })
                .catch(error => {
                    console.error('Error getting auction items:', error);
                })
        } catch (error) {
            return;
        }
    }

    async handleRegister(joinFee, sellFee) {
        try {
            // const gasEstimate = await this.contract.new.estimateGas(1000000, 10);

            // console.log(gasEstimate);
            // Deploy the contract
            joinFee = joinFee.toString();
            const deployedContract = await this.contract.new(joinFee, sellFee, { from: this.currentAccount });

            // Retrieve the deployed contract address
            this.contractAddress = deployedContract.address;
            console.log("Contract deployed at:", this.contractAddress);
            console.log("Contract Instance:", deployedContract);

            const jsonData = {
                contractAddress: this.contractAddress,
                joinFee: joinFee,
            };
            const url = 'http://localhost:3000/registrateAuction';
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // Specify that you're sending JSON data
                },
                body: JSON.stringify(jsonData), // Convert JSON data to a string
            };
            fetch(url, options)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json(); // Parse the response body as JSON
                })
                .then((data) => {
                    console.log('Response:', data); // Handle the response data
                })
                .catch((error) => {
                    console.error('There was a problem with the fetch operation:', error);
                });
            location.reload();

        } catch (error) {
            console.error('Error deploying contract:', error);
        }
        return
    }

    async handleBidding(itemid, bidvalue) {
        try {
            const contractInstance = await this.contract.at(this.contractAddress);
            bidvalue = ethToWei(bidvalue)
            // console.log(contractInstance);
            await contractInstance.bid(itemid, { from: this.currentAccount, value: bidvalue });
        } catch (error) {
            console.error('Error while trying to bid:', error);
            alert(`Failure while bidding: ${error.message}`);
        }
        return
    }

    async getNewID() {
        return await fetch('items.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('items.json Unreachable!');
                }
                return response.json();
            })
            .then(data => {
                const maxId = Math.max(...data.map(item => item.id));
                // console.log(" Max ID: ", maxId);
                return (maxId + 1).toString();
            })
            .catch(() => {
                // First Item
                return "1";
            })
    }

    async handleAddItem(imageFile, itemname, price, bidstep) {
        try {
            const contractInstance = await this.contract.at(this.contractAddress);
            // console.log(contractInstance);
            // Get highest Item ID
            const itemid = await this.getNewID();
            // console.log(itemid);
            await contractInstance.addItem(itemid, price, bidstep, { from: this.currentAccount, value: this.joinFee });
            const jsonData = {
                id: itemid,
                name: itemname,
                picture: `picture${itemid}.jpg`,
            };
            const data = new FormData();
            data.append('file', imageFile);
            data.append("JSON", JSON.stringify(jsonData));
            console.log(jsonData);
            const url = 'http://localhost:3000/addItem';
            const options = {
                method: 'POST',
                // headers: {
                //     'Content-Type': 'application/json', // Specify that you're sending JSON data
                // },
                body: data, // Convert JSON data to a string
            };
            await fetch(url, options)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json(); // Parse the response body as JSON
                })
                .then((data) => {
                    console.log('Response:', data); // Handle the response data
                    location.reload();
                })
                .catch((error) => {
                    console.error('There was a problem with the fetch operation:', error);
                });

        } catch (error) {
            console.error('Error while trying to add item:', error);
            alert(`Adding item failed: ${error.message}`);
        }
        return
    }

    async handleGetLastPrice(itemid) {
        try {
            const contractInstance = await this.contract.at(this.contractAddress);
            // console.log(contractInstance);
            return weiToEth(await contractInstance.getLastPrice(itemid, { from: this.currentAccount }));
        } catch (error) {
            console.error('Error while trying to get last price:', error);
        }
        return "ERROR"
    }
    async handleGetBidStep(itemid) {
        try {
            const contractInstance = await this.contract.at(this.contractAddress);
            // console.log(contractInstance);
            return weiToEth(await contractInstance.getBidStep(itemid, { from: this.currentAccount }));
        } catch (error) {
            console.error('Error while trying to bid:', error);
        }
        return "ERROR"
    }
    async handleStopBid(itemid) {
        try {
            const contractInstance = await this.contract.at(this.contractAddress);
            // console.log(contractInstance);
            await contractInstance.stopBidding(itemid, { from: this.currentAccount });
        } catch (error) {
            console.error('Error while trying stop bidding:', error);
            alert(`Stop bid fail: ${error.message}`);
        }
        return "ERROR"
    }
    async handleGetWinner(itemid) {
        try {
            const contractInstance = await this.contract.at(this.contractAddress);
            // console.log(contractInstance);
            return await contractInstance.getWinner(itemid, { from: this.currentAccount });
        } catch (error) {
            console.error('Error while trying to get winner:', error);
            alert(`Get winner fail: ${error.message}`);
        }
        return "ERROR"
    }
    async handleStopJoining() {
        try {
            const contractInstance = await this.contract.at(this.contractAddress);
            // console.log(contractInstance);
            await contractInstance.stopJoining({ from: this.currentAccount });
        } catch (error) {
            console.error('Error while trying to stop joining:', error);
            alert(`Stop joining fail: ${error.message}`);
        }
        return "ERROR"
    }
    async handleCloseContract() {
        try {
            const contractInstance = await this.contract.at(this.contractAddress);
            // console.log(contractInstance);
            await contractInstance.closeContract({ from: this.currentAccount });
        } catch (error) {
            console.error('Error while trying to close contract:', error);
            alert(`Close contract fail: ${error.message}`);
        }
        return "ERROR"
    }
}

document.addEventListener('DOMContentLoaded', function () {
    window.addEventListener('load', function () {
        const _ = new AuctionApp();
    });
});
