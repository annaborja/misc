const SinglyLinkedList = require('./singly_linked_list');

describe('initialization', () => {
  describe('when no argument is passed in', () => {
    test('creates an empty list', () => {
      const list = new SinglyLinkedList();

      expect(list.head).toBeNull();
      expect(list.tail).toBeNull();
      expect(list.size).toBe(0);
      expect([...list]).toEqual([]);
    });
  });

  describe('when an iterator is passed in', () => {
    test('creates a list from the data', () => {
      const list = new SinglyLinkedList([1, 2, 3]);

      expect(list.head.datum).toBe(1);
      expect(list.tail.datum).toBe(3);
      expect(list.size).toBe(3);
      expect([...list]).toEqual([1, 2, 3]);
    });
  });
});

describe('iterator', () => {
  describe('when the list is empty', () => {
    test('iterates through the list', () => {
      expect([...new SinglyLinkedList()]).toEqual([]);
    });
  });

  describe('when the list contains one element', () => {
    test('iterates through the list', () => {
      expect([...new SinglyLinkedList([1])]).toEqual([1]);
    });
  });

  describe('when the list contains multiple elements', () => {
    test('iterates through the list', () => {
      expect([...new SinglyLinkedList([1, 2, 3])]).toEqual([1, 2, 3]);
    });
  });
});

describe('reverseIterator', () => {
  describe('when the list is empty', () => {
    test('iterates backward through the list', () => {
      const list = new SinglyLinkedList();

      expect([...list.reverseIterator()]).toEqual([]);
      expect([...list]).toEqual([]);
    });
  });

  describe('when the list contains one element', () => {
    test('iterates backward through the list', () => {
      const list = new SinglyLinkedList([1]);

      expect([...list.reverseIterator()]).toEqual([1]);
      expect([...list]).toEqual([1]);
    });
  });

  describe('when the list contains multiple elements', () => {
    test('iterates backward through the list', () => {
      const list = new SinglyLinkedList([1, 2, 3]);

      expect([...list.reverseIterator()]).toEqual([3, 2, 1]);
      expect([...list]).toEqual([1, 2, 3]);
    });
  });
});

describe('append', () => {
  describe('when the list is empty', () => {
    test('adds an element to the end of the list', () => {
      const list = new SinglyLinkedList();

      list.append(42);

      expect(list.tail.datum).toBe(42);
      expect(list.size).toBe(1);
      expect([...list]).toEqual([42]);
    });
  });

  describe('when the list contains one element', () => {
    test('adds an element to the end of the list', () => {
      const list = new SinglyLinkedList([1]);

      list.append(42);

      expect(list.tail.datum).toBe(42);
      expect(list.size).toBe(2);
      expect([...list]).toEqual([1, 42]);
    });
  });

  describe('when the list contains multiple elements', () => {
    test('adds an element to the end of the list', () => {
      const list = new SinglyLinkedList([1, 2, 3]);

      list.append(42);

      expect(list.tail.datum).toBe(42);
      expect(list.size).toBe(4);
      expect([...list]).toEqual([1, 2, 3, 42]);
    });
  });
});

describe('prepend', () => {
  describe('when the list is empty', () => {
    test('adds an element to the start of the list', () => {
      const list = new SinglyLinkedList();

      list.prepend(42);

      expect(list.head.datum).toBe(42);
      expect(list.size).toBe(1);
      expect([...list]).toEqual([42]);
    });
  });

  describe('when the list contains one element', () => {
    test('adds an element to the start of the list', () => {
      const list = new SinglyLinkedList([1]);

      list.prepend(42);

      expect(list.head.datum).toBe(42);
      expect(list.size).toBe(2);
      expect([...list]).toEqual([42, 1]);
    });
  });

  describe('when the list contains multiple elements', () => {
    test('adds an element to the start of the list', () => {
      const list = new SinglyLinkedList([1, 2, 3]);

      list.prepend(42);

      expect(list.head.datum).toBe(42);
      expect(list.size).toBe(4);
      expect([...list]).toEqual([42, 1, 2, 3]);
    });
  });
});

describe('contains', () => {
  describe('when the list is empty', () => {
    test('returns false', () => {
      expect(new SinglyLinkedList().contains(42)).toBe(false);
    });
  });

  describe('when the list contains one element', () => {
    describe('when an element contains the datum', () => {
      test('returns true', () => {
        expect(new SinglyLinkedList([42]).contains(42)).toBe(true);
      });
    });

    describe('when no element contains the datum', () => {
      test('returns false', () => {
        expect(new SinglyLinkedList([1]).contains(42)).toBe(false);
      });
    });
  });

  describe('when the list contains multiple elements', () => {
    describe('when an element contains the datum', () => {
      test('returns true', () => {
        expect(new SinglyLinkedList([1, 42, 3]).contains(42)).toBe(true);
      });
    });

    describe('when no element contains the datum', () => {
      test('returns false', () => {
        expect(new SinglyLinkedList([1, 2, 3]).contains(42)).toBe(false);
      });
    });
  });
});

describe('remove', () => {
  describe('when the list is empty', () => {
    test('does not remove an element from the list', () => {
      const list = new SinglyLinkedList();

      expect(list.remove(42)).toBe(false);

      expect(list.size).toBe(0);
      expect([...list]).toEqual([]);
    });
  });

  describe('when the list contains one element', () => {
    describe('when an element contains the datum', () => {
      test('removes the datum element from the list', () => {
        const list = new SinglyLinkedList([42]);

        expect(list.remove(42)).toBe(true);

        expect(list.head).toBeNull();
        expect(list.tail).toBeNull();
        expect(list.size).toBe(0);
        expect([...list]).toEqual([]);
      });
    });

    describe('when no element contains the datum', () => {
      test('does not remove an element from the list', () => {
        const list = new SinglyLinkedList([1]);

        expect(list.remove(42)).toBe(false);

        expect(list.size).toBe(1);
        expect([...list]).toEqual([1]);
      });
    });
  });

  describe('when the list contains multiple elements', () => {
    describe('when the element at the start contains the datum', () => {
      test('removes the datum element from the list', () => {
        const list = new SinglyLinkedList([42, 1, 2]);

        expect(list.remove(42)).toBe(true);

        expect(list.head.datum).toBe(1);
        expect(list.size).toBe(2);
        expect([...list]).toEqual([1, 2]);
      });
    });

    describe('when an element in the middle contains the datum', () => {
      test('removes the datum element from the list', () => {
        const list = new SinglyLinkedList([1, 42, 3]);

        expect(list.remove(42)).toBe(true);

        expect(list.size).toBe(2);
        expect([...list]).toEqual([1, 3]);
      });
    });

    describe('when the element at the end contains the datum', () => {
      test('removes the datum element from the list', () => {
        const list = new SinglyLinkedList([1, 2, 42]);

        expect(list.remove(42)).toBe(true);

        expect(list.tail.datum).toBe(2);
        expect(list.size).toBe(2);
        expect([...list]).toEqual([1, 2]);
      });
    });

    describe('when no element contains the datum', () => {
      test('does not remove an element from the list', () => {
        const list = new SinglyLinkedList([1, 2, 3]);

        expect(list.remove(42)).toBe(false);

        expect(list.size).toBe(3);
        expect([...list]).toEqual([1, 2, 3]);
      });
    });
  });
});

describe('reverse', () => {
  describe('when the list is empty', () => {
    test('reverses the list', () => {
      const list = new SinglyLinkedList();

      list.reverse();

      expect([...list]).toEqual([]);
    });
  });

  describe('when the list contains one element', () => {
    test('reverses the list', () => {
      const list = new SinglyLinkedList([1]);

      list.reverse();

      expect([...list]).toEqual([1]);
    });
  });

  describe('when the list contains multiple elements', () => {
    test('reverses the list', () => {
      const list = new SinglyLinkedList([1, 2, 3]);

      list.reverse();

      expect([...list]).toEqual([3, 2, 1]);
    });
  });
});
