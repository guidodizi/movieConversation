const repositoryResponseQuickReplies = require ('./repositoryResponseQuickReplies');
const repositoryResponseTemplate = require ('./repositoryResponseTemplate');
const repositorySchedule = require ('./repositorySchedule');

/**
 * Constructor function for repository container. It recieves what databse to use as a parameter
 * Object instatiated with this function has access to all repositories functions
 */
module.exports = function (db) {
  var container = {};

  container = {
    ...repositoryResponseQuickReplies,
    ...repositoryResponseTemplate,
    ...repositorySchedule,
  };
  container.database = db;
  return container;
};
