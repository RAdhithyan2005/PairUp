const bcrypt = require('bcryptjs');

describe('Password hashing', () => {
  it('should hash a password and verify it correctly', async () => {
    const password = 'mySecretPassword123';
    const hashed = await bcrypt.hash(password, 10);

    expect(hashed).not.toBe(password);

    const isMatch = await bcrypt.compare(password, hashed);
    expect(isMatch).toBe(true);

    const isWrongMatch = await bcrypt.compare('wrongPassword', hashed);
    expect(isWrongMatch).toBe(false);
  });
});