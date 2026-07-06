const { nanoid } = require('nanoid');

describe('Room ID generation', () => {
  it('should generate unique room IDs of expected length', () => {
    const id1 = nanoid(8);
    const id2 = nanoid(8);

    expect(id1).toHaveLength(8);
    expect(id2).toHaveLength(8);
    expect(id1).not.toBe(id2);
  });
});