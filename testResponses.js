const database = require('./database');
const moment = require('moment');
const newFunctions = require('./newFunctions')
const { getIdMovies } = require('./handleResponse/dataFunctions')
require('dotenv').config();


console.log(getIdMovies('2018-03-13', 'movie portones'))

