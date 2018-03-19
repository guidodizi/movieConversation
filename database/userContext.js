
const USER_CONTEXT = {};

function getUserContext (sender_psid) {
    return USER_CONTEXT[sender_psid];
}
function updateUserContext (sender_psid, context = {}) {
    USER_CONTEXT[sender_psid] = context;
}
function mergeUserContext (sender_psid, data){
    if (typeof data !== 'object' || data instanceof Array) throw new Error('Data passed to update user context must be an object. The object attributes will merge with sender_psid context')

    const new_user_context = Object.assign({}, USER_CONTEXT[sender_psid]);
    if (typeof data === 'object'){
        for (const property in data){
            if (data.hasOwnProperty(property)){
                //all data added to the context must always be on context.data
                if (!new_user_context.data) new_user_context.data = {};
                new_user_context.data[property] = data[property];
            } 
        }
    }
    updateUserContext(sender_psid, new_user_context);
    
    return new_user_context;
}

exports.getUserContext = getUserContext;
exports.updateUserContext = updateUserContext;
exports.mergeUserContext = mergeUserContext;