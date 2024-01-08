
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
        } else {
            // If no injected web3 instance is detected, fallback to the TestRPC
            App.web3Provider = new Web3.providers.HttpProvider(App.url);
        }
        web3 = new Web3(App.web3Provider);

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
        const web3 = new Web3(new Web3.providers.HttpProvider(App.url));
        web3.eth.getAccounts()
        .then(accounts => {
            // console.log(data);
            accounts.forEach(function (account) {
                // if (web3.eth.coinbase !== account) {
                    var optionElement = document.createElement('option');
                    optionElement.value = account;
                    optionElement.textContent = account;
                    document.getElementById('enter_address').appendChild(optionElement);
                // }
            });
        });
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

$(function () {
    $(window).load(function () {
        App.init();
    });
});
