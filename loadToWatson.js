const database = require('./database/database_file');
const moment = require('moment');
var prompt = require('prompt');

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

const deleteEntity = (entity) => {
    if (typeof entity !== 'string') { throw Error('Parameter must be a string'); }
    return new Promise((resolve, reject) => {
        var params = {
            workspace_id: process.env.WORKSPACE_ID,
            entity: entity
        };
        conversation.deleteEntity(params, function (err, response) {
            if (err) {
                reject(err);
            } else {
                resolve(`ALL ${entity.toUpperCase()} DELETED`);
            }

        });
    })
};


/**
 * then recreate the movie entity but empty
 */
const createEntity = (entity, options) => {
    if (typeof entity !== 'string') { throw Error('Parameter must be a string'); }
    return new Promise((resolve, reject) => {

        var params = {
            workspace_id: process.env.WORKSPACE_ID,
            entity: entity
        };

        //Add options to params
        Object.assign(params, options);

        conversation.createEntity(params, function (err, response) {
            if (err) {
                reject(err);
            } else {
                resolve(`${entity.toUpperCase()} ENTITY CREATED`);
            }
        });
    })
}


/**
 * Add new movie values
 */
const addValuesMovie = () => {
    return new Promise((resolve, reject) => {
        let pushed = 0;
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
                    pushed++;
                    console.log(`Success adding ${item.title}: item n° ${index + 1}`);
                    if (pushed === database.movies_id.length)
                        resolve("All done here.");
                }
            });

        });


    })
};

/**
 * Add new genre values
 */
const addValuesGenre = () => {
    return new Promise((resolve, reject) => {
        //all genres array
        const genres = [];
        database.movies.forEach(movie => {
            //Array of this movie genres
            const movie_genres = movie.content.genre.split(', ').join(',').split(',').map(elem => elem.trim());
            movie_genres.forEach(genre => {
                //If genre not already on all genres array, add it
                if (genres.indexOf(genre) === -1) {
                    genres.push(genre);
                }
            })
        })

        let pushed = 0;        
        genres.forEach( (genre, index) => {
            var params = {
                workspace_id: process.env.WORKSPACE_ID,
                entity: 'genre',
                value: genre
            };

            conversation.createValue(params, function (err, response) {
                if (err) {
                    reject(err);
                } else {
                    pushed++;
                    console.log(`Success adding ${genre}: item n° ${index + 1}`);
                    if (pushed === genres.length)
                        resolve("All done here.");
                }
            });
        })

    })
};

async function loadMovies() {
    await deleteEntity('movie').then(result => console.log(result)).catch(err => console.log(err));
    await createEntity('movie').then(result => console.log(result)).catch(err => console.log(err));
    await addValuesMovie().then(result => console.log(result)).catch(err => console.log(err));
};
async function loadGenres() {
    await deleteEntity('genre').then(result => console.log(result)).catch(err => console.log(err));
    await createEntity('genre', { fuzzy_match: true }).then(result => console.log(result)).catch(err => console.log(err));
    await addValuesGenre().then(result => console.log(result)).catch(err => console.log(err));
};

(function () {
    console.log(` Welcome to Movie Conversation Loader:
    Select an action to load to Watson's workspace
        1) loadMovies => Load database movies as entities on Watson
        2) loadGenres => Load genres from database movies as entities on Watson
        3) exit
    `)
    prompt.start();
    prompt.get(['action'], function (err, result) {
        console.log('Selected action:');
        console.log(result.action);
        switch (result.action) {
            case ("1" || 'loadMovies'): {
                loadMovies();
                break;
            }
            case ("2" || 'loadGenres'): {
                loadGenres();
                break;
            }
            case ("3" || 'exit'): {
                break;
            }
        }
    });

})();

