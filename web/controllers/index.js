module.exports = function (app) {
	var attachToContract = app.attachToContract;
	var https = app.https;
	var parseCookies = app.parseCookies;
	var uuid = app.uuid;

	app.get('/', function(request, response) {
		var proofSessionId = parseCookies(request)["proofSessionId"];
		console.log(proofSessionId);
		if (!proofSessionId) {
			var proofSessionId = uuid.v4();
			response.cookie('proofSessionId', proofSessionId, { maxAge: 100*365*60*60*1000 });
		}
		var cookieIdHash = app.crypto.createHmac('sha256', app.config.salt)
	               	.update(proofSessionId)
	               	.digest('hex');
		attachToContract(function(err, contract) {
			if (err) {
				response.render("index", {
					"address": app.contractAddress,
					"cookieIdHash": cookieIdHash
				});
			} else {
				response.render("index", {
					"address": app.contractAddress,
					"cookieIdHash": cookieIdHash
				});
			}
		});
	});

	app.post('/getMessageHash', function(request, response) {
		var globalToken = request.body.globalToken;
		if (globalToken == app.config.globalToken) {
			if (request.body.gistContent) {
				var hash = app.crypto.createHmac('sha256', app.config.salt)
	               	.update(request.body.gistContent)
	               	.digest('hex');
				response.send({
			      success : {
			        code : 200,
			        title : "Success",
			        message : hash
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

	app.post('/checkGistContent', function(request, response) {
		var globalToken = request.body.globalToken;
		var gistLink = request.body.gistLink;
		var gistId = gistLink.split("/").slice(-1)[0];
		if (gistLink.indexOf('gist.github.com') > -1) {
			var path = gistLink.split('gist.github.com')[1] + "/raw";
			if (globalToken == app.config.globalToken) {
				//var path = '/vbaranov/5082f453613561d4e0f19f17c318b9a1/raw/';
		    
			    var get_options = {
			      host: app.config.githubAPI.host,
			      port: '443',
			      path: app.config.githubAPI.path + "/" + gistId,
			      method: 'GET',
			      headers: {
			          'Content-Type': 'application/json',
			          'User-Agent': 'Awesome-Octocat-App'
			      }
			    };

			    console.log(get_options);

			    // Set up the request
			    var get_req = https.request(get_options, function(res) {
			      res.setEncoding('utf8');

			      var body = "";
			      res.on('data', function(resData) {
			          body += resData;
			      });

			      res.on('end', function () {
			        console.log("##############");
			        console.log('Output: ');
			        console.log(body);
			        console.log("##############");
			        var outputJSON = JSON.parse(body);
			        console.log(outputJSON.files);

			        var files = outputJSON.files;
			        var file0;
					for(var key in files) {
					    if(files.hasOwnProperty(key)) {
					        file0 = files[key];
					        break;
					    }
					}
					
					response.send({
				      success : {
				        code : 200,
				        title : "Success",
				        content : file0.content,
				        public : outputJSON.public
				      }
				    });
			      });
			    });

			    get_req.end();
			} else {
				response.send({
			      error : {
			        code : 401,
			        title : "Unauthorized",
			        message : "Wrong app token"
			      }
			    });
			}
		} else {
			response.send({
		      error : {
		        code : 500,
		        title : "Error",
		        message : "Invalid gist url"
		      }
		    });
		}
	});
}