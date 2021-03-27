## Chatbot reccomendation project

# Description:

This project is a chatbot operational on Facebook Messenger and its main goal is to recommend books.

# Steps to make it work  

In order to test the chatbot you have to pull the files and to set up an conda environment with specifying the requirements from the requirements.txt file.  
To do so you have to open an anacoda terminal:  
`conda create --name fastai --file requirements.txt`  
  
We call it fastai because we have been inspired by the book fastai that you can find on github. Thus, we used pytorch to build our model for the recomandation system.  

After you have to activate the enviroment so you have to run the command `conda activate fastai`;  
  
Now you can run our chatbot by running the server.js. You have to make sure that node.js and npm are installed on the machine.  
  
After, to make the running easier if you do any changes to the code you can run it with `nodemon`. To do so you can install it by:  
`npm i nodemon`  
Now you can run the server by `nodemon server.js`. Make sure you are in the right directory.  

After if errors of missing packages occures. You can fix them by running in the console the command `npm i <missing package name>` and run again the server.js. Repete this process untill all the packages are installed.
When it runs. You have one more thing to install. Which is the ngrok. You can install it by `npm i ngrok` and after you have to run it with the command `ngrok http 3000` in order to get the webhook for our chatbot.  
We have to go on the page of our application from Facebook for developer and register the webhook and the access token that have been set in the file `development.json`.  
Right before register it, you have to make sure that the server is running and after you can register the webhook.  
Only step left is to go on `Facebook Messenger`, search the page `First Page` and to send the messages you want in order to get some recommended books for you. :)
