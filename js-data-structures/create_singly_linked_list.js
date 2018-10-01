const linkedListProto = require('./linked_list_proto');
const createNode = require('./create_node');

function createCustomNode(datum) {
  return Object.assign(createNode(datum), { next: null });
}

const proto = {
  *reverseIterator() {
    let node = this.tail;

    if (!node) {
      return null;
    }

    for (let prevNode = this.head; !Object.is(node, this.head); node = prevNode, prevNode = this.head) {
      while (!Object.is(prevNode.next, node)) {
        prevNode = prevNode.next;
      }

      yield node.datum;
    }

    yield node.datum;

    return null;
  },

  append(datum) {
    const node = createCustomNode(datum);

    if (this.tail) {
      this.tail.next = node;
      this.tail = node;
    } else {
      this.head = node;
      this.tail = this.head;
    }

    this.size++;
  },

  prepend(datum) {
    const node = createCustomNode(datum);

    if (this.head) {
      node.next = this.head;
      this.head = node;
    } else {
      this.head = node;
      this.tail = this.head;
    }

    this.size++;
  },

  remove(datum) {
    return this.find(datum, this.head, (function(node, prevNode) {
      if (!prevNode) {
        if (Object.is(this.head, this.tail)) {
          this.head = null;
          this.tail = null;
        } else {
          this.head = this.head.next;
        }
      } else {
        prevNode.next = node.next;

        if (!prevNode.next) {
          this.tail = prevNode;
        }
      }

      this.size--;

      return true;
    }).bind(this));
  },

  reverse() {
    let prevNode = null;

    for (let node = this.head, nextNode = null; !!node; prevNode = node, node = nextNode) {
      nextNode = node.next;
      node.next = prevNode;
    }

    this.tail = this.head;
    this.head = prevNode;
  },
};

function createSinglyLinkedList(data = []) {
  const list = Object.assign(Object.create(linkedListProto), proto);

  [...data].forEach(datum => list.append(datum));

  return list;
}

module.exports = createSinglyLinkedList;
