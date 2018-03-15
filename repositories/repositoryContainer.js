const repositoryResponseQuickReplies = require('./repositoryResponseQuickReplies');
const repositoryResponseTemplate = require('./repositoryResponseTemplate');
const repositorySchedule = require('./repositorySchedule');


/**
 * Constructor function for repository container. It recieves what databse to use as a parameter
 * Object instatiated with this function has access to all repositories functions
 */
module.exports = function(db) {
    var container = {};

    container = {...repositoryResponseQuickReplies, ...repositoryResponseTemplate, ...repositorySchedule }
    container.database = db;
    return container;
}







//LEGACY CODE

/**
 * Export a function that creates container with dirname of database.
 * This container requires database and saves it on object this.
 * A proxy is then implemented for each function on container, specifying that
 * any function call, should be called with the this set to container's this (container's this has this.database set)
 */

/**
 * Add to target object all functions from all repositories
 * This object is a container of all repositories function
 * We will use this object to insert a Proxy in each of its function.
 * Proxy will make that function calls use the target object as this.
 */

// Object.values(container).map(func => {
//     return new Proxy(func, {
//         apply: function (target, thisArg, ...args) {
//             return target.apply(thisArg, ...args)
//         }
//     })
// })