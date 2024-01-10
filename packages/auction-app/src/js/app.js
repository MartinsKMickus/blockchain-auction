
class AuctionApp {
    constructor() {
        // Initialize variables
        this.blockchainUrl = 'http://127.0.0.1:7545'; // Blockchain node URL
        this.abi = null; // Contract ABI (Application Binary Interface)
        this.contractAddress = null; // Contract address on the blockchain
        this.contract = null;
        this.joinFee = 1000000;
        this.contracts = {}; // Object to store deployed contract instances
        this.names = []; // Array to store auction names
        this.organizer = null; // Organizer for the auction
        this.currentAccount = null; // Current user's account
        // console.log("Trying to get provider");
        this.provider = this.getDefaultWeb3Provider(); // Web3 provider (e.g., MetaMask)
        // .then((provider) => {
        // this.web3Provider = provider;
        // Initialize Web3 and contract
        this.initEthereum();
        this.initContract();
        this.bindEvents();
        this.getAuctionItems();
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
            this.web3 = new Web3(this.blockchainUrl);
            return new Web3.providers.HttpProvider(this.blockchainUrl); // USELESS
        }
    }

    async fetchContractABI() {
        // Implement logic to fetch or determine the contract ABI dynamically
        // For example, make an API request to fetch the ABI from a server
        return '...'; // Default or dynamically determined ABI
    }

    async determineContractAddress() {
        // Implement logic to determine the contract address dynamically
        // For example, prompt the user for the contract address or fetch it from a server
        return '...'; // Default or dynamically determined contract address
    }

    async initEthereum() {
        try {

            // Get the current user's account
            // const accounts = await this.web3.eth.getAccounts();
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            // console.log("Accounts: ", accounts);
            this.currentAccount = accounts[0];
            document.getElementById("address_welcome").textContent = "Welcome! " + this.currentAccount;

            // TODO: Implement watch for account changes
            // this.web3.currentProvider.on('accountsChanged', (newAccounts) => {
            //     this.currentAccount = newAccounts[0];
            //     document.getElementById("address_welcome").textContent = "Welcome! " + this.currentAccount;
            //     // Perform any necessary updates when the account changes
            // });

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
                    this.abi = voteArtifact.abi;
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
                // Call the handleRegister function
                this.handleRegister();
            }
            if (event.target.classList.contains('button-type-bid')) {
                var dataId = event.target.getAttribute('data-id');

                // Check if dataId is not null or undefined before proceeding
                if (dataId !== null && dataId !== undefined) {
                    // Convert dataId to a number if needed
                    var numericDataId = parseInt(dataId, 10);
                    console.log('Clicked button with data-id:', numericDataId);
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
                this.handleAddItem(0, 10000000, 500000);
            }
            if (event.target.classList.contains('button-type-get-price')) {
                var dataId = event.target.getAttribute('data-id');

                // Check if dataId is not null or undefined before proceeding
                if (dataId !== null && dataId !== undefined) {
                    // Convert dataId to a number if needed
                    var numericDataId = parseInt(dataId, 10);
                    console.log('Clicked button with data-id:', numericDataId);
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
        });
    }

    // Add methods for interacting with the contract and managing the auction

    // Example method to get auction names
    async getAuctionItems() {
        try {
            fetch('../items.json')
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Auction.json Unreachable!');
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
                            element.setAttribute('data-id', i.toString(10))
                        })
                        // template.content.querySelector('.btn').setAttribute('data-id', i.toString(10));
                        // template.content.querySelector('input').setAttribute('data-id', i.toString(10));

                        // Append the cloned template to the proposalsRow
                        proposalsRow.appendChild(template.content);

                        // Push the name to the App.names array
                        App.names.push(data[i].name);
                    }
                })
        } catch (error) {
            console.error('Error getting auction names:', error);
            return [];
        }
    }

    async handleRegister() {
        try {
            // const gasEstimate = await this.contract.new.estimateGas(1000000, 10);

            // console.log(gasEstimate);
            // Deploy the contract
            const deployedContract = await this.contract.new(1000000, 10, { from: this.currentAccount });

            // Retrieve the deployed contract address
            this.contractAddress = deployedContract.address;
            console.log("Contract deployed at:", this.contractAddress);
            console.log("Contract Instance:", deployedContract);

        } catch (error) {
            console.error('Error deploying contract:', error);
        }
        return
    }

    async handleBidding(itemid, bidvalue) {
        try {
            const contractInstance = await this.contract.at(this.contractAddress);
            // console.log(contractInstance);
            contractInstance.bid(itemid, { from: this.currentAccount, value: bidvalue });
        } catch (error) {
            console.error('Error while trying to bid:', error);
        }
        return
    }

    async handleAddItem(itemid, price, bidstep) {
        try {
            const contractInstance = await this.contract.at(this.contractAddress);
            // console.log(contractInstance);
            contractInstance.addItem(itemid, price, bidstep, { from: this.currentAccount, value: this.joinFee });
        } catch (error) {
            console.error('Error while trying to add item:', error);
        }
        return
    }

    async handleGetLastPrice(itemid) {
        try {
            const contractInstance = await this.contract.at(this.contractAddress);
            // console.log(contractInstance);
            return contractInstance.getLastPrice(itemid, { from: this.currentAccount });
        } catch (error) {
            console.error('Error while trying to bid:', error);
        }
        return "ERROR"
    }
}

App = {
    web3Provider: null,
    abi: null,
    contracts: {},
    names: new Array(),
    url: 'http://127.0.0.1:7545',
    organizer: null,
    currentAccount: null,
    init: function () {
        $.getJSON('../proposals.json', function (data) {
            var proposalsRow = $('#proposalsRow');
            var proposalTemplate = $('#proposalTemplate');

            for (i = 0; i < data.length; i++) {
                proposalTemplate.find('.panel-title').text(data[i].name);
                proposalTemplate.find('img').attr('src', data[i].picture);
                proposalTemplate.find('input').attr('id', "a" + i.toString(10));

                proposalsRow.append(proposalTemplate.html());
                App.names.push(data[i].name);
            }
        });
        return App.initWeb3();
    },

    initWeb3: function () {
        // Is there is an injected web3 instance?
        if (typeof web3 !== 'undefined') {
            App.web3Provider = web3.currentProvider;
            console.log("Web3 provider is current provider");
        } else {
            // If no injected web3 instance is detected, fallback to the TestRPC
            App.web3Provider = new Web3.providers.HttpProvider(App.url);
            console.log("Web3 provider is new HTTP provider");
        }
        // web3 = new Web3(App.web3Provider);

        ethereum.enable();

        App.populateAddress();

        return App.initContract();
    },

    initContract: function () {
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
                App.abi = voteArtifact.abi;
                App.contracts.vote = TruffleContract(voteArtifact);
                // Set the provider for our contract
                App.contracts.vote.setProvider(App.web3Provider);
                return App.bindEvents();
            })
            .catch(error => {
                console.error("Fetch error:", error);
            })
        // $.getJSON('Auction.json', function (data) {
        //     // Get the necessary contract artifact file and instantiate it with truffle-contract
        //     var voteArtifact = data;
        //     App.contracts.vote = TruffleContract(voteArtifact);

        //     // Set the provider for our contract
        //     App.contracts.vote.setProvider(App.web3Provider);

        //     App.getChairperson();
        //     return App.bindEvents();
        // });
    },

    bindEvents: function () {
        $(document).on('click', '#register', App.handleRegister);
        // $(document).on('click', '#vote', App.handleVote);
        // $(document).on('click', '#finalResults', App.handleWinner);
        // $(document).on('click', '#preResults', App.handlePreRez);
        // $(document).on('click', '#register', function () { var ad = $('#enter_address').val(); App.handleRegister(ad); });
        // $(document).on('click', '#startreg', App.handleStartReg);
        // $(document).on('click', '#startvote', App.handleStartVote);
        // $(document).on('click', '#endvote', App.handleEndVote);
        // $(document).on('click', '#state', App.handleGetState);
    },

    // Populates address list
    populateAddress: function () {
        // const web3 = new Web3(new Web3.providers.HttpProvider(App.url));
        web3.eth.getAccounts()
            .then(accounts => {
                console.log(web3);
                accounts.forEach(function (account) {
                    // if (web3.eth.coinbase !== account) {
                    var optionElement = document.createElement('option');
                    optionElement.value = account;
                    optionElement.textContent = account;
                    document.getElementById('enter_address').appendChild(optionElement);
                    // }
                });
            });
        console.log("Adresses are populated");
    },

    // getChairperson: function () {
    //     App.contracts.vote.deployed().then(function (instance) {
    //         return instance;
    //     }).then(function (result) {
    //         App.organizer = result.constructor.currentProvider.selectedAddress.toString();
    //         App.currentAccount = web3.eth.coinbase;
    //         if (App.organizer != App.currentAccount) {
    //             jQuery('#address_div').css('display', 'none');
    //             jQuery('#register_div').css('display', 'none');
    //         } else {
    //             jQuery('#address_div').css('display', 'block');
    //             jQuery('#register_div').css('display', 'block');
    //         }
    //     })
    // },

    handleRegister: async function (addr) {

        const accounts = await web3.eth.getAccounts();
        // console.log(App.accounts);
        return
        const contract = new web3.eth.Contract(App.abi);

        const deploy = contract.deploy({
            data: '0x' + evm.bytecode.object,
            arguments: [1000000, 10], // Replace with your constructor arguments
        });
        const gas = await deploy.estimateGas();
        const gasPrice = await web3.eth.getGasPrice();
        const deployedContract = await deploy.send({
            from: accounts[0], // Use the deploying account
            gas,
            gasPrice,
        });
        console.log('Contract deployed at:', deployedContract.options.address);
        // var voteInstance;
        // App.contracts.vote.deployed().then(function (instance) {
        //     voteInstance = instance;
        //     return voteInstance.registerVoter(addr);
        // }).then(function (result, err) {
        //     if (result) {
        //         if (parseInt(result.receipt.status) == 1)
        //             alert(addr + " registration done successfully")
        //         else
        //             alert(addr + " registration not done successfully due to revert")
        //     } else {
        //         alert(addr + " registration failed")
        //     }
        // });
    },

    // handleVote: function () {

    //     var voteInstance;
    //     var votes = [];

    //     for (i = 0; i < App.names.length; i++) {
    //         votes[i] = Number(document.getElementById("a" + i.toString(10)).value);
    //     }


    //     web3.eth.getAccounts(function (error, accounts) {
    //         var account = accounts[0];

    //         App.contracts.vote.deployed().then(function (instance) {
    //             voteInstance = instance;
    //             alert(votes[0].toString(10) + " " + votes[1].toString(10) + " " + votes[2].toString(10) + " " + votes[3].toString(10) + " " + votes[4].toString(10) + " " + votes[5].toString(10) + " " + votes[6].toString(10));
    //             return voteInstance.vote(votes[0], votes[1], votes[2], votes[3], votes[4], votes[5], votes[6]);
    //         }).then(function (result, err) {
    //             if (result) {
    //                 console.log(result.receipt.status);
    //                 if (parseInt(result.receipt.status) == 1)
    //                     alert(account + " voting done successfully")
    //                 else
    //                     alert(account + " voting not done successfully due to revert")
    //             } else {
    //                 alert(account + " voting failed")
    //             }
    //         });
    //     });
    // },

    // handleWinner: function () {
    //     console.log("To get final results");
    //     var voteInstance;
    //     var carNr;
    //     carNr = Number(document.getElementById("finNr").value);
    //     App.contracts.vote.deployed().then(function (instance) {
    //         voteInstance = instance;
    //         return voteInstance.getFinalResults(carNr);
    //     }).then(function (res) {
    //         console.log(res);
    //         alert(App.names[carNr] + "  has " + res + " points!");
    //     }).catch(function (err) {
    //         console.log(err.message);
    //     })
    // },

    // handlePreRez: function () {
    //     console.log("To get preliminary results");
    //     var voteInstance;
    //     var carNr;
    //     carNr = Number(document.getElementById("preNr").value);
    //     App.contracts.vote.deployed().then(function (instance) {
    //         voteInstance = instance;
    //         return voteInstance.getPreliminaryResults(carNr);
    //     }).then(function (res) {
    //         console.log(res);
    //         alert(App.names[carNr] + "  has " + res + " points!");
    //     }).catch(function (err) {
    //         console.log(err.message);
    //     })
    // },

    // handleGetState: function () {
    //     console.log("To get state");
    //     var voteInstance;
    //     App.contracts.vote.deployed().then(function (instance) {
    //         voteInstance = instance;
    //         return voteInstance.getState();
    //     }).then(function (res) {
    //         console.log(res);
    //         alert("State is " + res);
    //     }).catch(function (err) {
    //         console.log(err.message);
    //     })
    // },

    // handleStartReg: function () {
    //     console.log("To start registering");
    //     var voteInstance;
    //     App.contracts.vote.deployed().then(function (instance) {
    //         voteInstance = instance;
    //         return voteInstance.startRegistering();
    //     }).then(function (res) {
    //         console.log(res);
    //     }).catch(function (err) {
    //         console.log(err.message);
    //     })
    // },

    // handleStartVote: function () {
    //     console.log("To start voting");
    //     var voteInstance;
    //     App.contracts.vote.deployed().then(function (instance) {
    //         voteInstance = instance;
    //         return voteInstance.startVoting();
    //     }).then(function (res) {
    //         console.log(res);
    //     }).catch(function (err) {
    //         console.log(err.message);
    //     })
    // },

    // handleEndVote: function () {
    //     console.log("To start voting");
    //     var voteInstance;
    //     App.contracts.vote.deployed().then(function (instance) {
    //         voteInstance = instance;
    //         return voteInstance.endVoting();
    //     }).then(function (res) {
    //         console.log(res);
    //     }).catch(function (err) {
    //         console.log(err.message);
    //     })
    // }

};

// jQuery way:
// $(function () {
//     $(window).load(function () {
//         App.init();
//     });
// });

// Pure JavaScript way:
document.addEventListener('DOMContentLoaded', function () {
    window.addEventListener('load', function () {
        const _ = new AuctionApp();
    });
});
