'use strict'
const crypto = require('crypto');
const fs = require('fs');
const { exec } = require('child_process');
const axios = require('axios');
/** 
 * 
 * ['eng', 'en-US', 'en-CA', '', 'spa', 'en-GB', 'fre', 'nl', 'ara',
       'por', 'ger', 'nor', 'jpn', 'en', 'vie', 'ind', 'pol', 'tur',
       'dan', 'fil', 'ita', 'per', 'swe', 'rum', 'mul', 'rus']
*/
function getLanguageCode(langs){
  const varDict = {
    'English':'eng',
    'Spanish':'spa',
    'French':'fre',
    'Italian':'ita',
    'Arabic':'ara'
  }
  try{
    var langCodes = [];
    langs.forEach(lang =>{langCodes.push(varDict[lang])});
    return langCodes;
  }
  catch(err){
    console.log(err);
  }
}
// async function getTitles(){
//   const fileName = 'title.txt';
//   let titles = [];
//   await fs.readFile(fileName, 'utf8', (err, data)=>{
//     if(err)throw err;
//     console.log(data);
//     titles = data;
//   })
//   console.log(titles);
//   titles = titles.split(',');
//   return titles;
// }
// function writeTitles(titles){
//   const fileName = 'title.txt';
//   titles = titles.join(', ');
//   console.log('in writin func');
//   console.log(titles);
//   fs.writeFile(fileName, titles, (err)=>{
//     if(err)throw err;
//   })
// }
class FBeamer {
  constructor({ pageAccessToken, verifyToken, appSecret }) {
    try {
      if (pageAccessToken && verifyToken && appSecret) {
        this.pageAccessToken = pageAccessToken;
        this.verifyToken = verifyToken;
        this.appSecret = appSecret;
      }
      else {
        throw "One or more tokens/credentials are missing!";
      }
    }
    catch (error) {
      console.log(error);
    }
  }

  registerHook(request, response) {
    const params = request.query;
    const mode = params['hub.mode'], token = params['hub.verify_token'], challenge = params['hub.challenge'];
    try {
      if ((mode && this.verifyToken) && mode === 'subscribe' && token === this.verifyToken) {
        console.log("Webhook registered!");
        return response.send(challenge);
      }
      else {
        console.log("Could not register webhook!");
        return response.sendStatus(400);
      }
    }
    catch (error) {
      console.log(error);
    }
  }

  verifySignature(request, response, buffer) {
    return (request, response, buffer) => {
      if (request.method === 'POST') {
        try {
          const signature = request.headers['x-hub-signature'].substr(5);
          const hash = crypto.createHmac('sha1', this.appSecret).update(buffer, 'utf-8').digest('hex');
          if (signature !== hash)
            throw 'Error verifying x hub signature';
        }
        catch (error) {
          console.log(error);
        }
      }
    }
  }

  incoming(request, response, callback) {
    response.sendStatus(200);
    // Extract the body of the POST request
    if (request.body.object === 'page' && request.body.entry) {
      const data = request.body;
      const messageObj = data.entry;
      if (!messageObj[0].messaging)
        console.log("Error message");
      else return callback(messageObj[0].messaging);
    }
  }

  messageHandler(obj) {
    const sender = obj[0].sender.id;
    const message = obj[0].message.text;
    const obj2 = {
      sender,
      type: 'text',
      content: message
    }
    return obj2;
  }

  sendMessage(msgType, id, text) {
    const payload = {
      "messaging_type": msgType,
      "recipient": {
        "id": id
      },
      "message": {
        "text": text
      }
    };
    return new Promise((resolve, reject) => {
      axios({
        method: 'post',
        url: `https://graph.facebook.com/v6.0/me/messages?access_token=${this.pageAccessToken}`,
        headers: { 'Content-Type': 'application/json' },
        data: payload
      }, (error, response, body) => {
        if (!error && response.statusCode === 200) {
          resolve({
            messageId: body.message_id
          });
        } else {
          reject(error);
        }
      });
    });
  }
  getResponse(message){
    if(message['type'] === 'text'){
      let bookTypes = [];
      let writers = [];
      let bookTitlesLiked = [];//this list is going to contain titles of books liked by the reader
      let bookSizes = [];
      let languages = [];
      let hireg = /hi|hello|buna ziua|bonjour/gi;
      let textMessage = message['content'];
      if(textMessage.match(hireg)){
        let resp = 'Hello reader!';
        return resp;
      }
      let words = textMessage.split(" ");
      if(words[0].match(/how/gi) && words[1].match(/are/gi) && words[2].match(/you/gi))
      {
        let resp = 'I am fine. Doing robot stuf...';
        return resp;
      }
      if(words[0].match(/i/gi) && words[1].match(/want/gi) && words[2].match(/a/gi) && words[3].match(/book/gi)){
        let resp = 'What kind of books do you like? Can you tell me more about your preferinces?';
        let resp2 = 'What other books do you like? Can you tell me titles you like or gendres of books?';
        return resp2;
      }
      if(words[0].match(/asdf/gi)){return 'merge ticule';}
      if(words[0].match(/My/gi) && words[1].match(/favorite/gi) && words[2].match(/book|books/gi) && words[3].match(/are|is/gi)){
        let resp = 'Nice books. Noticed!'
        words.splice(0, 4);
        words = words.join();
        console.log(words);
        words = words.split(',');
        console.log(words);
        bookTitlesLiked = words;
        exec(`python -c "import sys; sys.path.append('.'); from recommender.api import *; print(get_similar_user(1))"`, function (error, stdout, stderr) {
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);
        if (error !== null) {
             console.log('exec error: ' + error);
        }});
        return resp;
      }
      if(words[0].match(/what/gi) && words[1].match(/books|book/gi) && words[2].match(/i/gi) && words[3].match(/liked/gi)){
        bookTitlesLiked = getTitles();
        let resp = 'You liked: ';
        bookTitlesLiked.forEach(book => {
          resp = resp.concat(book);
          resp = resp.concat(', ');
        });
        resp = resp.concat('.');
        return resp;
      }
      if(words[0].match(/the/gi) && words[1].match(/writers|writer|author|authors/gi) && words[2].match(/that/gi) && words[3].match(/i/gi) && words[4].match(/like/gi) && words[5].match(/are|is/gi)){
        var writer_name = [];
        for(var i = 6; i< words.length; i++){
          if(words[i].match(/,/g))
          {
            var word = words[i];
            word = word.replace(',', '');
            writer_name.push(word);
            writers.push(title);
            writer_name = [];
          }
          else{
            writer_name.push(words[i]);
            if(i === words.length-1){writers.push(title);}
          }
          console.log(writers)  ;
        }
        let resp = 'What a culter there. I noticed the authors. Can you tell me the language';
        return resp;
      }
      if(words[0].match(/what/gi) && words[1].match(/writer|writers|author|authors/gi) && words[2].match(/i/gi) && words[3].match(/liked/gi)){
        let resp = 'You liked: ';
        writers.forEach(function(it, i){
          it.forEach(function(word, index){
            resp = resp.concat(word);
            resp = resp.concat(' ');
          })

          resp = resp.concat(', ');
        })
        return resp;
      }
      if(words[0].match(/my/gi) && words[1].match(/favorite/gi) && words[2].match(/types?|gendres?|kinds?/gi) && words[3].match(/are:?|is:?/gi)){
        words.splice(0, 4);//we discard the the first 4 words in order to have just the book types
        let types = words.join(' ');//we make the again a single string
        bookTypes = types.split(',')//in order to split regarding to the comma
        console.log(bookTypes);
        let resp = 'You liked this book gendres:  ';
        bookTypes.forEach(element => resp.concat(element));
        return resp;
      }
      if(words[0].match(/I/gi) && words[1].match(/this/gi) && words[2].match(/types?:?|gendres?:?|kinds?:?/gi)){
        words.splice(0, 3);//we discard the the first 4 words in order to have just the book types
        let types = words.join(' ');//we make the again a single string
        bookTypes = types.split(',')//in order to split regarding to the comma
        console.log(bookTypes);
        let resp = 'You liked this book gendres:  ';
        bookTypes.forEach(element => resp.concat(element));
        return resp;
      }
    
      if(words[0].match(/I/gi) && words[1].match(/the/gi) && words[2].match(/the/gi) && words[3].match(/books?/gi) && words[4].match(/to/gi) &&
      words[5].match(/be/gi) && words[6].match(/in:?/gi)){
        words.splice(0, 7);
        languages = words.join();
        languages = languages.split(',');
        console.log(languages);
        let resp = 'You selected the languages:';
        let languages = getLanguageCode(languages);
        languages.forEach(lang => resp.concat(element));
        return resp;
      }
      if(words[0].match(/the/gi) && words[1].match(/languages?:?/gi)){
        words.splice(0, 2);
        languages = words.join();
        languages = languages.split(',');
        console.log(languages);
        let resp = 'You selected the languages:';
        let languages = getLanguageCode(languages);
        languages.forEach(lang => resp.concat(element));
        return resp;
      }
      if(words[0].match(/the/gi) && words[1].match(/language:?/gi) && words[2].match(/I/gi) && words[3].match(/want/gi) && words[4].match(/are:?/gi)){
        words.splice(0, 5);
        languages = words.join();
        languages = languages.split(',');
        console.log(languages);
        let resp = 'You selected the languages:';
        let languages = getLanguageCode(languages);
        languages.forEach(lang => resp.concat(element));
        return resp;
      }
    }
    return 'Hi! I do not think we speak the same language. default message';
  }
}

module.exports = FBeamer;