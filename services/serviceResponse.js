const constants = require('../constants');
const serviceResponseTemplate = require('./serviceResponseTemplate');
const serviceResponseQuickReplies = require('./serviceResponseQuickReplies');
const { sendAPI } = require('./serviceSendAPI');

/*
* Handle the response to what the user said, based on Waton's response. 
* We end up responding the user on Facebook messenger with a coherent response.
* The response to user is based on Watson context, specifically on context.message_type
* template: respond user with a template
* quick_replies: respond user with quick replies options
* text: simply reply with the text Watson gave
*
*/
module.exports = function handleResponse(sender_psid, context, text_response) {
    const message_type = context.message_type;

    console.log('CONTEXT: ' + JSON.stringify(context, null))
    console.log('TEXT RESPONSE: ' + text_response)
    switch (message_type) {
        case "template": {
            handleTemplateResponse(sender_psid, text_response, context);
            break;
        }
        case "quick_replies": {
            handelQuickRepliesResponse(sender_psid, text_response, context);
            break;
        }
        case "dont_show": {
            //used when a response is just jumping to another and doesnt need to display anything
            break;
        }
        default: {
            // Directly respond to user
            sendAPI(sender_psid, { text: text_response }).catch((err) => { console.log(err); } );
            break;
        }
    }
}

// MOVIE MAIN PROCESS: date -> movie -> place
// MOVIE MAIN PROCESS*: date -> place -> movie 
/*
* Handle responses which are template-based, in which we dont simply reply a text, but a generic/list/.. template
* This templates are based on Facebook Messenger's possibilities
* Watson sets the metadata for the template on context:
*   template type: context.payload.template_type
*   image aspect ratio: context.payload.image_aspect_ratio
*   data to put on template: context.payload.data
*
*/
function handleTemplateResponse(sender_psid, text_response, context) {
    const watson_payload = context.payload;

    //Base response for templates
    let response = { attachment: { type: "template", payload: { elements: [] } } };
    response.attachment.payload.template_type = watson_payload.template_type || "generic";
    response.attachment.payload.image_aspect_ratio = watson_payload.image_aspect_ratio || "horizontal";

    //Generate elements depending on what string Watson gave on context.payload.data    
    for (var template_data in constants.templates){
        if (constants.templates[template_data] === watson_payload.data){
            serviceResponseTemplate[constants.templates[template_data]](sender_psid, response, context).catch((err) => console.log(err));            
        }
    }
    // switch (watson_payload.data) {
    //     case constants.GENERIC_TEMPLATE_MOVIES: {
    //         serviceResponseTemplate[constants.GENERIC_TEMPLATE_MOVIES](sender_psid, response, context).catch((err) => console.log(err));
    //         break;
    //     }
    //     case constants.GENERIC_TEMPLATE_MOVIES_GENRE: {
    //         serviceResponseTemplate[constants.GENERIC_TEMPLATE_MOVIES_GENRE](sender_psid, response, context).catch((err) => console.log(err));            
    //         break;
    //     }
    //     case constants.GENERIC_TEMPLATE_MOVIES_GENRE_PLACE: {
    //         serviceResponseTemplate[constants.GENERIC_TEMPLATE_MOVIES_GENRE_PLACE](sender_psid, response, context).catch((err) => console.log(err));          
    //         break;
    //     }
    //     case constants.GENERIC_TEMPLATE_SCHEDULE: {
    //         serviceResponseTemplate[constants.GENERIC_TEMPLATE_SCHEDULE](sender_psid, response, context).catch((err) => console.log(err));
    //         break;
    //     }
    //     case constants.GENERIC_TEMPLATE_MOVIES_PLACE: {
    //         serviceResponseTemplate[constants.GENERIC_TEMPLATE_MOVIES_PLACE](sender_psid, response, context).catch((err) => console.log(err));                             
    //         break;
    //     }
    // }
}
/*
* Handle responses which we offer Quick Replies. 
* Data for specifically what quick reply is given to user is set on Watson
* data for quick replies:  context.payload.data
*
*/
function handelQuickRepliesResponse(sender_psid, text_response, context) {
    const watson_payload = context.payload;
    let response = { text: text_response, quick_replies: [] };

    //Generate elements depending on what string Watson gave on context.payload.data    
    for (var quickReplies_data in constants.quickReplies){
        if (constants.quickReplies[quickReplies_data] === watson_payload.data){
            serviceResponseQuickReplies[constants.quickReplies[quickReplies_data]](sender_psid, response, context).catch((err) => console.log(err));
        }
    }
    // switch (watson_payload.data) {
    //     case constants.QUICK_REPLIES_LOCATIONS: {
    //         serviceResponseQuickReplies[constants.QUICK_REPLIES_LOCATIONS](sender_psid, response, context)
    //         break;
    //     };
    //     case constants.QUICK_REPLIES_DATE: {
    //         serviceResponseQuickReplies[constants.QUICK_REPLIES_DATE](sender_psid, response, context)            
    //         break;
    //     }
    //     case constants.QUICK_REPLIES_DATE_PLACE: {
    //         serviceResponseQuickReplies[constants.QUICK_REPLIES_DATE_PLACE](sender_psid, response, context)            
    //         break;
    //     }
    // };
}


