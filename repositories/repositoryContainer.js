const repositoryResponseQuickReplies = require('./repositoryResponseQuickReplies');
const repositoryResponseTemplate = require('./repositoryResponseTemplate');
const repositorySchedule = require('./repositorySchedule');


/**
 * Export a function that creates container with dirname of database.
 * This container requires database and saves it on object this.
 * A proxy is then implemented for each function on container, specifying that
 * any function call, should be called with the this set to container's this (container's this has this.database set)
 */
module.exports = db => {
    var container = {};
    /**
     * Add to target object all functions from all repositories
     * This object is a container of all repositories function
     * We will use this object to insert a Proxy in each of its function.
     * Proxy will make that function calls use the target object as this.
     */
    container = {...repositoryResponseQuickReplies, ...repositoryResponseTemplate, ...repositorySchedule }
    Object.values(container).map(func => {
        return new Proxy(func, {
            apply: function (target, thisArg, ...args) {
                try {
                    return target.apply(thisArg, ...args)   
                }
                catch (err) { console.log(err) }
            }
        })
    })
    container.database = db;
    return container;
}


