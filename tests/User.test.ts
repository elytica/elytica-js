import { User } from '../src/User';

test('User constructor should create a new User object with correct properties', () => {
  const data = { id: 1, name: 'John Doe', email: 'john.doe@example.com', rate_limit: 10 };
  const user = new User(data);
  expect(user.id).toBe(1);
  expect(user.name).toBe('John Doe');
  expect(user.email).toBe('john.doe@example.com');
  expect(user.rate_limit).toBe(10);
});

