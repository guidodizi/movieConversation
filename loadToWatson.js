const database = require('./database');
const moment = require('moment');
const Conversation = require('watson-developer-cloud/conversation/v1');
require('dotenv').config();


var conversation = new Conversation({
    username: process.env.WATSON_USERNAME,
    password: process.env.WATSON_PASSWORD,
    version_date: '2018-02-16'
});

/**
 * first delete all movies -> delete movies entity
 */

const deleteMovie = () => {
    return new Promise((resolve, reject) => {
        var params = {
            workspace_id: process.env.WORKSPACE_ID,
            entity: 'movie'
        };
        conversation.deleteEntity(params, function (err, response) {
            if (err) {
                reject(err);
            } else {
                resolve("ALL MOVIES DELETED");
            }

        });
    })
};


/**
 * then recreate the movie entity but empty
 */
const createMovie = () => {
    return new Promise((resolve, reject) => {

        var params = {
            workspace_id: process.env.WORKSPACE_ID,
            entity: 'movie'
        };

        conversation.createEntity(params, function (err, response) {
            if (err) {
                reject(err);
            } else {
                resolve("MOVIE ENTITY CREATED");
            }
        });
    })
}


/**
 * and then add new values
 */
const addValuesMovie = () => {
    return new Promise((resolve, reject) => {
        let pushed_movies = 0;
        database.movies_id.forEach((item, index) => {
            var params = {
                workspace_id: process.env.WORKSPACE_ID,
                entity: 'movie',
                value: item.title
            };

            conversation.createValue(params, function (err, response) {
                if (err) {
                    reject(err);
                } else {
                    pushed_movies++;
                    console.log(`Success adding ${item.title}: item n° ${index + 1}`);
                    if (pushed_movies === database.movies_id.length)
                        resolve("All done here.");
                }
            });

        });


    })
};

(async function () {
    await deleteMovie().then(result => console.log(result)).catch(err => console.log(err));
    await createMovie().then(result => console.log(result)).catch(err => console.log(err));
    await addValuesMovie().then(result => console.log(result)).catch(err => console.log(err));
})();
