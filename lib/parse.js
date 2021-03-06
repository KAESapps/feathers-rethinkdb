'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.default = parseQuery;
/**
 * Pass in a query object to get a ReQL query
 * Must be run after special query params are removed.
 */
function parseQuery(service, reQuery, params) {
  var r = service.options.r;

  Object.keys(params).forEach(function (qField) {
    var isFilter = false;
    var subQuery = void 0;
    // The queryObject's value: 'Alice'
    var qValue = params[qField];

    // If the qValue is an object, it will have special params in it.
    if ((typeof qValue === 'undefined' ? 'undefined' : _typeof(qValue)) === 'object') {
      switch (Object.keys(qValue)[0]) {
        /**
         *  name: { $in: ['Alice', 'Bob'] }
         *  becomes
         *  r.expr(['Alice', 'Bob']).contains(doc['name'])
         */
        case '$in':
          isFilter = true;
          reQuery = reQuery.filter(function (doc) {
            return service.options.r.expr(qValue.$in).contains(doc(qField));
          });
          break;
        case '$nin':
          isFilter = true;
          reQuery = reQuery.filter(function (doc) {
            return service.options.r.expr(qValue.$nin).contains(doc(qField)).not();
          });
          break;
        case '$search':
          isFilter = true;
          reQuery = reQuery.filter(function (doc) {
            return doc(qField).match(qValue.$search);
          });
          break;
        case '$lt':
          subQuery = r.row(qField).lt(params[qField].$lt);
          break;
        case '$lte':
          subQuery = r.row(qField).le(params[qField].$lte);
          break;
        case '$gt':
          subQuery = r.row(qField).gt(params[qField].$gt);
          break;
        case '$gte':
          subQuery = r.row(qField).ge(params[qField].$gte);
          break;
        case '$ne':
          subQuery = r.row(qField).ne(params[qField].$ne);
          break;
        case '$eq':
          subQuery = r.row(qField).eq(params[qField].$eq);
          break;
        case '$pointInBbox':
          var points = params[qField].$pointInBbox;
          var polygon = r.polygon(points[0], points[1], points[2], points[3]);
          subQuery = polygon.intersects(r.point(r.row(qField)(0), r.row(qField)(1)));
          break;
      }
    } else {
      subQuery = r.row(qField).eq(qValue);
    }

    // At the end of the current set of attributes, determine placement.
    if (subQuery) {
      reQuery = reQuery.filter(subQuery);
    } else if (!isFilter) {
      reQuery = reQuery.and(subQuery);
    }
  });
  return reQuery;
}
module.exports = exports['default'];