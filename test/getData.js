var fs = require('fs');
var Web3 = require('web3');
var web3;
var config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
var provider = require('./helpers/basicauthhttpprovider');

var contractABI = config.smartContract.abi;
if (typeof web3 !== 'undefined') {
  web3 = new Web3(web3.currentProvider);
} else {
  if (config.environment == "live")
    web3 = new Web3(new provider(config.smartContract.rpc[config.environment], config.smartContract.rpc.user, config.smartContract.rpc.pass));
  else 
    web3 = new Web3(new Web3.providers.HttpProvider(config.smartContract.rpc[config.environment]));
}

var contractAddress = config.smartContract.contractAddress[config.environment];

var wallet = "0x153ee44b33a061ec9bcbed0d974ddd0536248547";
var gistLink = "gist.github.com/vbaranov/5082f453613561d4e0f19f17c318b9a1";

getData();

function getData() {
	console.log("config:");
	console.log(config);
	if(!web3.isConnected()) {
		console.log('{code: 200, title: "Error", message: "check RPC"}');
	} else {
		console.log(web3.eth.accounts);
		web3.eth.defaultAccount = web3.eth.accounts[0];
		console.log("web3.eth.defaultAccount:");
		console.log(web3.eth.defaultAccount);

		attachToContract(function(err, contract) {

			contract.getPaymentByAddress.call(wallet, function(err, val) {
				console.log("getPaymentByAddress:");
				console.log("address: " + wallet);
				console.log("payment: " + val);
			});

			contract.getPaymentDataByAddress.call(wallet, function(err, val) {
				console.log("getPaymentDataByAddress:");
				console.log("address: " + wallet);
				console.log("paymentData: " + val);
			});

			contract.getGistLinkByAddress.call(wallet, function(err, val) {
				console.log("getGistLinkByAddress:");
				console.log("address: " + wallet);
				console.log("gist link: " + val);
			});

			contract.hasGistLink.call(wallet, function(err, val) {
				console.log("hasGistLink:");
				console.log("address: " + wallet);
				console.log("isJoined: " + val);
			});

			contract.getAddressByGistLink.call(gistLink, function(err, val) {
				console.log("getAddressByGistLink:");
				console.log("gist link: " + gistLink);
				console.log("address: " + val);
		});

		});
	}
}

function attachToContract(cb) {
	if(!web3.isConnected()) {
		if (cb) {
				cb({code: 200, title: "Error", message: "check RPC"}, null);
			}
	} else {
		console.log(web3.eth.accounts);
		web3.eth.defaultAccount = web3.eth.accounts[0];
		console.log("web3.eth.defaultAccount:");
		console.log(web3.eth.defaultAccount);
		
		var MyContract = web3.eth.contract(contractABI);

		contract = MyContract.at(contractAddress);
		
		if (cb) {
			cb(null, contract);
		}
	}
}