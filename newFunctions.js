'use strict';

// filter an array of objects, returning a new array which
// has only a property of original objects that pass the condition
function addFilterObject () {
  Array.prototype.filterObject = function (callback, property, context) {
    var arr = [];
    for (var i = 0; i < this.length; i++) {
      if (callback.call (context, this[i], i, this)) {
        var elem = property.split ('.').reduce (function (prev, curr) {
          return prev ? prev[curr] : null;
        }, this[i]);

        arr.push (elem);
      }
    }
    return arr;
  };
}

module.exports = (function () {
  addFilterObject ();
}) ();
// //TEST
// var arr = [
//     {a: 1, b:2},
//     {a: 3, b:4},
//     {a: 5, b:6},
//     {a: 7, b:8},
//     {a: 9, b:10},
//     {a: 11, b:12},
//     {a: 13, b:14},
// ];
// console.log(arr.filterObject( item => {
//     return item.a > 6
// }, "b" ))
