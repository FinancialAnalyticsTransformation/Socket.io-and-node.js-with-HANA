'use strict';
const content = require('fs').readFileSync(__dirname + '/index.html', 'utf8');
const httpServer = require('http').createServer((req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Content-Length', Buffer.byteLength(content));
  res.end(content);
});
const io = require('socket.io')(httpServer);
var hana = require('@sap/hana-client');
var dbStream = require('@sap/hana-client/extension/Stream');

io.on('connection', socket => {
	socket.on('Run Procedure!', data => {
		console.log('Received request from client to Run Procedure!');
		var connOptions = {
			serverNode: '<@HDBUSERKEY>',  
//			serverNode: '<HOST>:<PORT>',
//			UID: '<username>',
//			PWD: '<password>',
			sslValidateCertificate: 'false',  
			};
		var connection = hana.createConnection();
		connection.connect(connOptions, function(err) {
			if (err) {
				return console.error(err);
			}
			dbStream.createProcStatement(connection, 'CALL "<SCHEMA>"."<PROCEDURENAME>" (?)', function (err, stmt) {
				if (err) {
					return console.error('createProcStatement error:', err);
				}
				var param = '<PARAMETER>';
				stmt.exec({ <PARAMETERNAME_IN_UPPERCASE>: param }, function (err, parameters, TableRows ) {
					if (err) {
						return console.error('exec error:', err);
					}
					stmt.drop(function (err) {
						if (err) {
							return console.error('drop error:', err);
						}
						console.log('parameter:', param);
						console.log('Table rows:', TableRows);
						socket.emit('all done!');
					});
				});
			});
		});
	});
});

httpServer.listen(3030, () => {
  console.log('go to http://localhost:3030');
});



