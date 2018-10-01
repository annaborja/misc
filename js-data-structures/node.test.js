const Node = require('./node');

test('creates a node for a datum', () => {
  expect(new Node(42).datum).toBe(42);
});

test('does not allow setting its datum', () => {
  const node = new Node(42);

  node.datum = 123;

  expect(node.datum).toBe(42);
});
