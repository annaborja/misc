class LinkedList {
  constructor(data = []) {
    this.head = null;
    this.tail = null;
    this.size = 0;

    [...data].forEach(datum => this.append(datum));
  }

  *[Symbol.iterator]() {
    for (let node = this.head; !!node; node = node.next) {
      yield node.datum;
    }

    return null;
  }

  find(datum, node, foundFn, prevNode = null) {
    if (!node) {
      return false;
    }

    // TODO: Allow for checking for deep equality in addition to object identity.
    if (Object.is(node.datum, datum)) {
      return foundFn(node, prevNode);
    }

    return this.find(datum, node.next, foundFn, node);
  }

  contains(datum) {
    return this.find(datum, this.head, () => true);
  }
}

module.exports = LinkedList;
