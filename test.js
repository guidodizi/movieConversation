const timers = require('timers')
var Conversation = require('watson-developer-cloud/conversation/v1');
const database = require('./database');

// var conversation = new Conversation({
//   username: '7677ee2f-26f8-4b61-a88a-2af9f78e26db',
//   password: 'xGBbYUSWXkJd',
//   url: 'https://gateway.watsonplatform.net/conversation/api',
//   version_date: '2018-02-16'
// });

// const CONTEXT = {} ;
// const WORKSPACE_ID = '3ce95775-ab09-49ff-99cf-2293efc166d4';


// conversation.message(
//   {
//     input: { text: 'quiero comprar un seguro' },
//     context: CONTEXT['primer'] || {},
//     workspace_id: WORKSPACE_ID
//   },
//   function (err, watsonResponse) {
//     if (err) {
//       console.error(err);
//     } else {
//       console.log(watsonResponse)
//       console.log(watsonResponse.output.text[0])
//       console.log('context')
//       console.log(watsonResponse.context)
//       CONTEXT['primer'] = watsonResponse.context
//     }
//   })

// timers.setTimeout(() => {
//   console.log(CONTEXT['primer']);
//   conversation.message(
//     {
//       input: { text: 'asd' },
//       context: CONTEXT['primer'] || {},
//       workspace_id: WORKSPACE_ID
//     },
//     function (err, watsonResponse) {
//       if (err) {
//         console.error(err);
//       } else {
//         console.log(watsonResponse)

//       }
//     })
// }, 5000)

console.log(JSON.stringify(database.peliculas, null, 2))

// [
//   {
//    "title":"Welcome to Peter'\''s Hats",
//    "image_url":"https://petersfancybrownhats.com/company_image.png",
//    "subtitle":"We'\''ve got the right hat for everyone.",
//    "default_action": {
//      "type": "web_url",
//      "url": "https://peterssendreceiveapp.ngrok.io/view?item=103",
//      "messenger_extensions": true,
//      "webview_height_ratio": "tall",
//      "fallback_url": "https://peterssendreceiveapp.ngrok.io/"
//    },
//    "buttons":[
//      {
//        "type":"web_url",
//        "url":"https://petersfancybrownhats.com",
//        "title":"View Website"
//      },{
//        "type":"postback",
//        "title":"Start Chatting",
//        "payload":"DEVELOPER_DEFINED_PAYLOAD"
//      }              
//    ]      
//  }
// ]