import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import { NewMessage } from "telegram/events/index.js";
import input from "input";
import fs from "fs";

// get the phone pass, if exists
var phonePass;
try {
  if(fs.existsSync('phonePass.txt'))
    phonePass = fs.readFileSync('phonePass.txt', 'utf8');
} catch (err) {
  console.error(err);
}

// api keys and phone pass init
const apiId = "put your own here";
const apiHash = "put your own here";
const stringSession = new StringSession(phonePass);

// telegram listener
(async () => {

  // init
  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });

  // if there's no saved pass, get one
  await client.start({
    phoneNumber: async () => await input.text("Please enter your number: "),
    password: async () => await input.text("Please enter your password: "),
    phoneCode: async () => await input.text("Please enter the code you received: "),
    onError: (err) => console.log(err)
  });

  // saving phone pass for the next runs
  try {
    if(!fs.existsSync('phonePass.txt')) {
      fs.writeFileSync('phonePass.txt', client.session.save(), { flag: 'w+' });
      console.log('Session saved successfully, you will not have to provide those credentials again');
    }
  } catch (err) {
    console.error(err)
  }

  // begin to listen
  console.log("You are now connected.");
  console.log("Listening for new messages...");

  async function eventPrint(event) {
    const message = event.message;
    const sender = await message.getSender();

    // if sender is coinkoeng, proceed
    if(sender.username == "coinkoeng"){

      // console log the message
      console.log('new message:');
      console.log('---------------------------');
      console.log(message.message);
      console.log('---------------------------');

      // saving the message to messages.txt
      try {
        const messageToSave = message.message + "\n---------------------------\n";
        fs.writeFileSync('messages.txt', messageToSave, { flag: 'a+' });
        console.log('Message saved successfully'); console.log('');
      } catch (err) {
        console.error(err)
      }
    }
  }

  client.addEventHandler(eventPrint, new NewMessage({}));

})();