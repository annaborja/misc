var express = require('express');
var router = express.Router();
var fs = require('fs');
var oboe = require('oboe');

/**
 * Returns image data, accepting parameters such as `attributeValue`, `limit`, and `offset`.
 */
router.get('/', function(req, res) {
  const images = [];
  const limit = parseInt(req.query.limit, 10) || 10;
  const offset = parseInt(req.query.offset, 10) || 0;

  let offsetCount = 0;
  let totalCount = 0;

  oboe(fs.createReadStream('./payload.json'))
    .on('node', '!.*', image => {
      if (
        !req.query.attribute || image[req.query.attribute].toString() === req.query.attributeValue
      ) {
        totalCount++;

        if (offsetCount < offset) {
          offsetCount++;
        } else if (images.length < limit) {
          images.push(image);
        }
      }

      // Oboe saves read nodes by default. Drop node to save memory.
      return oboe.drop;
    })
    .done(() => {
      // DEV: Uncomment to simulate slow API response.
      // setTimeout(() => res.send({ images, totalCount }), 3000);
      res.send({ images, totalCount });
    });
});

module.exports = router;
