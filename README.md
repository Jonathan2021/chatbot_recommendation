## Chatbot reccomendation project

# Description:

This project is a chatbot operational on Facebook Messenger and its main goal is to recommend books.

# Steps to make it work

To do the chatbot with Facebook Messenger we have to go on Facebook for developer create a page, generate a token, replace it in the code (development.json) 

Create a chatbot 
Create a page
Add the page on facebook for developers
After cratea a token
Put it in development.json in page access token
Create the verify token you want and put it in the development.json
Going in the setting basic secret key fb dev
Copy paste put in the secret key of dev.json
vs run server.js by `nodemon sever.js`
The install all the modul missing which are causing an error
To do this ` npm i <namemodul> ` until no error
The bot is running on port … -> mean is working
Stop it and run `npm i -g ngrok` in terminal in order to get ngrok
After: `ngrok http 3000`
you have a pop up and take the last url and put in the facebook dev in the weebook section of the messenger settings and you put you verify token too
you do not press the button to access because you go back in vs code to the server by nodemon server.js
after in fb dev you press the button to go
go in the webbook section of the messenger settings to choose messages 
then when you send a message it responde bonjour
