module.exports = function (app) {
	var web3 = app.web3;

	var contract;
	app.attachToContract = attachToContract;

	var contractABI = app.config.smartContract.abi;

	function attachToContract(cb) {
		if(!web3.isConnected()) {
			if (cb) {
					cb({code: 200, title: "Error", message: "check RPC"}, null);
				}
		} else {
			console.log(web3.eth.accounts);
			web3.eth.defaultAccount = web3.eth.accounts[1];
			console.log("web3.eth.defaultAccount:");
			console.log(web3.eth.defaultAccount);
			
			var MyContract = web3.eth.contract(contractABI);

			contract = MyContract.at(app.contractAddress);
			
			if (cb) {
				cb(null, contract);
			}
		}
	}

	function newGistLinkToAddr(wallet, gistLink, userId, cb) {
		if(!web3.isConnected()) {
			cb({code: 500, title: "Error", message: "check RPC"}, null);
		} else {
			contract.newGistLinkToAddr.sendTransaction(wallet, gistLink, userId, {gas: 160000, from: web3.eth.defaultAccount}, function(err, result) {
				cb(err, result);
			});
		}
	}

	app.post('/newGistLinkToAddr', function(request, response) {
		var globalToken = request.body.globalToken;
		if (globalToken == app.config.globalToken) {
			var gistLink = request.body.gistLink;
			var userId = request.body.userId;
			var wallet = request.body.wallet;
			var gistContent = request.body.gistContent;
			console.log(wallet);
			console.log(request.body.wallet);
			var isHex  = /^0x[0-9A-Fa-f]{40}$/i.test(wallet);
			if (isHex) {
				contract.getPaymentByAddress.call(wallet, function(err, val) {
					console.log("err:");
					console.log(err);
					console.log("val:");
					console.log(val);
					if (val > 0) {
						contract.getPaymentDataByAddress.call(wallet, function(err, paymentData) {
							console.log("err:");
							console.log(err);
							console.log("paymentData:");
							console.log(paymentData);


							var hash = app.crypto.createHmac('sha256', app.config.salt)
		                   	.update(gistContent)
		                   	.digest('hex');

		                   	console.log("hash:");
		                   	console.log(hash);

		                   	//var hashBuf = new Buffer(hash, 'binary').toString('hex');
							//console.log("hashBuf:");
		                   	//console.log(hashBuf.toString());
		                   	
		                   	console.log(paymentData.substring(2) + " == " + hash);
							if (paymentData.substring(2) == hash) {
								newGistLinkToAddr(wallet, gistLink, userId, function(err, result) {
									if (err) {
										console.log(err);
										response.send({
									      error : {
									        code : 500,
									        title : "Error",
									        message : "Oops, error arised"
									      }
									    });
									} else {
										console.log(result);
										response.send({
									      success : {
									        code : 200,
									        title : "Success",
									        message : "Gist link successfully joined"
									      }
									    });
									}
								});
							} else {
								response.send({
							      error : {
							        code : 1000,
							        title : "Warning",
							        message : "Sent message doesn't match with the one displayed on the page"
							      }
							    });
							}
						});
					} else {
						response.send({
					      error : {
					        code : 1000,
					        title : "Warning",
					        message : "Payment wasn't sent yet"
					      }
					    });
					}
				});
			} else {
				response.send({
			      error : {
			        code : 500,
			        title : "Error",
			        message : "Not valid address"
			      }
			    });
			}
		} else {
			response.send({
		      error : {
		        code : 401,
		        title : "Unauthorized",
		        message : "Wrong app token"
		      }
		    });
		}
	});

	app.post('/getGistLinkByAddress', function(request, response) {
		var globalToken = request.body.globalToken;
		if (globalToken == app.config.globalToken) {
			var wallet = request.body.wallet;
			var isHex  = /^0x[0-9A-Fa-f]{40}$/i.test(wallet)
			if (isHex) {
				contract.getGistLinkByAddress.call(wallet, function(err, gistLink) {
					console.log("err:");
					console.log(err);
					console.log("gistLink:");
					console.log(gistLink);
					response.send({
				      success : {
				        code : 200,
				        title : "Success",
				        message : "Gist link successfully joined",
				        gistLink: gistLink,
				        userId: getUserIdFromGistLink(gistLink)
				      }
				    });
				});
			} else {
				response.send({
			      error : {
			        code : 500,
			        title : "Error",
			        message : "Not valid address"
			      }
			    });
			}
		} else {
			response.send({
		      error : {
		        code : 401,
		        title : "Unauthorized",
		        message : "Wrong app token"
		      }
		    });
		}
	});

	app.post('/getAddressByUserId', function(request, response) {
		var globalToken = request.body.globalToken;
		if (globalToken == app.config.globalToken) {
			var userId = request.body.userId;
			contract.getAddressByUserId.call(userId, function(err, address) {
				console.log(address);

				var isHex  = /^0x[0-9A-Fa-f]{40}$/i.test(address)
				if (isHex) {
					contract.getGistLinkByAddress.call(address, function(err, gistLink) {
						console.log("err:");
						console.log(err);
						console.log("gistLink:");
						console.log(gistLink);
						response.send({
					      success : {
					        code : 200,
					        title : "Success",
					        message : "Gist link successfully joined",
					        gistLink: gistLink,
					        addr: address
					      }
					    });
					});
				} else {
					response.send({
				      error : {
				        code : 500,
				        title : "Error",
				        message : "Not valid address"
				      }
				    });
				}
			});
		} else {
			response.send({
		      error : {
		        code : 401,
		        title : "Unauthorized",
		        message : "Wrong app token"
		      }
		    });
		}
	});

	function getUserIdFromGistLink(gistLink) {
		userId = "";
		if (gistLink) {
			var arr = gistLink.split("/");
			userId = arr[arr.length - 2];
		}
		return userId;
	}
};