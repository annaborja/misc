const createNode = require('./create_node');

test('creates a node for a datum', () => {
  expect(createNode(42).datum).toBe(42);
});

test('does not allow setting its datum', () => {
  const node = createNode(42);

  node.datum = 123;

  expect(node.datum).toBe(42);
});
