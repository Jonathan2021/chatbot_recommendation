'use strict';
const bodyparser = require('body-parser');

const express = require('express');
const config = require('./config');
const FBeamer = require('./fbeamer');

const server = express();
const PORT = process.env.PORT || 3000;

const FB = new FBeamer(config.FB);

server.get('/', (request, response) => FB.registerHook(request, response));
server.listen(PORT, () => console.log(`FBeamer Bot Service running on Port ${PORT}`));
server.post('/', bodyparser.json({ verify: FB.verifySignature.call(FB) }));
server.post('/', (request, response, data) => {
  return FB.incoming(request, response, data => {
    const userData = FB.messageHandler(data);
    console.log(userData);
    const resp = FB.getResponse(userData);
    console.log(resp);
    FB.sendMessage("RESPONSE", userData.sender, resp);
  });
});
//you cannot use ngrok with the pole internet because of security reasons
