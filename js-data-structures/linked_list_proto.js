const linkedListProto = {
  head: null,
  tail: null,
  size: 0,

  *[Symbol.iterator]() {
    for (let node = this.head; !!node; node = node.next) {
      yield node.datum;
    }

    return null;
  },

  find(datum, node, foundFn, prevNode = null) {
    if (!node) {
      return false;
    }

    // TODO: Allow for checking for deep equality in addition to object identity.
    if (Object.is(node.datum, datum)) {
      return foundFn(node, prevNode);
    }

    return this.find(datum, node.next, foundFn, node);
  },


  contains(datum) {
    return this.find(datum, this.head, () => true);
  },
};

module.exports = linkedListProto;
