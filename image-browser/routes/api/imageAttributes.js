var express = require('express');
var router = express.Router();
var fs = require('fs');
var oboe = require('oboe');

/**
 * Returns all attributes that images can be grouped by.
 */
router.get('/', function(req, res) {
  const result = [
    'languageCode',
    'movieId',
  ].sort();

  // DEV: Uncomment to simulate slow API response.
  // setTimeout(() => res.send(result), 3000);
  res.send(result);
});

/**
 * Returns a set of all the unique values of the requested attribute.
 */
router.get('/:attribute', function(req, res) {
  const values = new Set();

  oboe(fs.createReadStream('./payload.json'))
    .on('node', '!.*', image => {
      values.add(image[req.params.attribute]);

      // Oboe saves read nodes by default. Drop node to save memory.
      return oboe.drop;
    })
    .done(() => {
      // DEV: Uncomment to simulate slow API response.
      // setTimeout(() => res.send(Array.from(values).sort()), 3000);
      res.send(Array.from(values).sort());
    });
});

module.exports = router;
