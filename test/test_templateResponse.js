const database_file_test = require('./database_file_test');
const moment = require('moment-timezone');
const constants = require('../constants');
const { test } = require('../handleResponse/templateResponse');
const assert = require('assert')

/**
 * Test all functions on templateResponse
 */
describe('Response movie', () => {
    describe('#Movies from 0 - 8', () => {
        var response;
        before(() => {
           response = { attachment: { type: "template", payload: { elements: [] } } };
            var context = {
                data: {
                    movies_pageview: 0
                }
            }
            test.response_movies(response, context, database_file_test);
            
        });
        it ('should return 10 items', () => {
            assert.equal(response.attachment.payload.elements.length, 10);            
        })
        it('should return movies from 0 to 8 and \"Ver mas\" button', () => {
            var database_movie_titles = database_file_test.movies.slice(0, 9).map(movie => movie.content.title);
            response.attachment.payload.elements.forEach((elem, index) => {
                if (index < response.attachment.payload.elements.length - 1) {
                    assert.notEqual(database_movie_titles.indexOf(elem.title), -1)
                }
            })

            var database_movie_subtitles = database_file_test.movies.slice(0, 9).map(movie => movie.content.synopsis);
            response.attachment.payload.elements.forEach((elem, index) => {
                if (index < response.attachment.payload.elements.length - 1) {
                    assert.notEqual(database_movie_subtitles.indexOf(elem.subtitle), -1)
                }
            })

            var database_movie_posterUrl = database_file_test.movies.slice(0, 9).map(movie => movie.content.posterUrl);
            response.attachment.payload.elements.forEach((elem, index) => {
                if (index < response.attachment.payload.elements.length - 1) {
                    assert.notEqual(database_movie_posterUrl.indexOf(elem.image_url), -1)
                }
            })

            assert.deepStrictEqual(response.attachment.payload.elements[9], {
                title: "Ver más opciones",
                subtitle: "Clickea el botón debajo para ver más opciones de películas",
                image_url: "http://iponline.in/images/view-more.png",
                buttons: [{
                    type: "postback",
                    title: "Ver más",
                    payload: "ver mas"
                }]
            })
        })
        it('all movie buttons on response are correctly formed', () => {
            var database_movie_titles = database_file_test.movies.slice(0, 9).map(movie => movie.content.title);
            response.attachment.payload.elements.forEach((elem, index) => {
                if (index < response.attachment.payload.elements.length - 1) {
                    var i = database_movie_titles.indexOf(elem.buttons[0].payload)
                    assert.deepStrictEqual(elem.buttons, [
                        {
                            type: "postback",
                            title: "Elegir",
                            payload: database_movie_titles[i]
                        }
                    ])
                }
            })
        })
    })

    describe('#Movies from 9-17 ', () => {
        var response;
        before(() => {
            response = { attachment: { type: "template", payload: { elements: [] } } };
            var context = {
                data: {
                    movies_pageview: 1
                }
            }
            test.response_movies(response, context, database_file_test);
        })
        it ('should return 10 items', () => {
            assert.equal(response.attachment.payload.elements.length, 10);            
        })
        it('should return movies from 9 to 17 and \"Ver mas\" button', () => {

            var database_movie_titles = database_file_test.movies.slice(9, 18).map(movie => movie.content.title);
            response.attachment.payload.elements.forEach((elem, index) => {
                if (index < response.attachment.payload.elements.length - 1) {
                    assert.notEqual(database_movie_titles.indexOf(elem.title), -1)
                }
            })
        })
    })

    describe('#Movies from 18 - 26', () => {
        var response;
        before(() => {
            response = { attachment: { type: "template", payload: { elements: [] } } };
            var context = {
                data: {
                    movies_pageview: 2
                }
            }
            test.response_movies(response, context, database_file_test);
        })
        it ('should return 6 items', () => {
            assert.equal(response.attachment.payload.elements.length, 6);            
        })
        it('should return movies from 18 to 23 and \"Ver mas\" button', () => {

            var database_movie_titles = database_file_test.movies.slice(18, 24).map(movie => movie.content.title);
            response.attachment.payload.elements.forEach((elem, index) => {
                if (index < response.attachment.payload.elements.length - 1) {
                    assert.notEqual(database_movie_titles.indexOf(elem.title), -1)
                }
            })
        })
    })
})
        
