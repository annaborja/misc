function createNode(datum) {
  const node = {};

  Object.defineProperty(node, 'datum', {
    configurable: false,
    enumerable: true,
    writable: false,
    value: datum,
  });

  return node;
}

module.exports = createNode;
