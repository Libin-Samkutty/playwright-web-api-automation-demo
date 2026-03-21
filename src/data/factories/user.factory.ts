import { faker } from '@faker-js/faker';

export interface UserData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export class UserFactory {
  static validUser(overrides: Partial<UserData> = {}): UserData {
    const password = overrides.password ?? faker.internet.password({ length: 12 });
    return {
      name: overrides.name ?? faker.person.fullName(),
      email: overrides.email ?? faker.internet.email({ provider: 'testmail.dev' }),
      password,
      confirmPassword: overrides.confirmPassword ?? password,
      ...overrides,
    };
  }

  static defaultLogin(): LoginCredentials {
    return {
      username: 'practice',
      password: 'SuperSecretPassword!',
    };
  }

  static invalidLogin(): LoginCredentials {
    return {
      username: faker.internet.username(),
      password: faker.internet.password(),
    };
  }

  static mismatchedPasswords(): UserData {
    return {
      name: faker.person.fullName(),
      email: faker.internet.email({ provider: 'testmail.dev' }),
      password: 'ValidPass123!',
      confirmPassword: 'DifferentPass456!',
    };
  }

  static uniqueUser(workerIndex: number): UserData {
    const password = `TestPass${workerIndex}!${Date.now()}`;
    return {
      name: `Worker${workerIndex} ${faker.person.lastName()}`,
      email: `worker${workerIndex}_${Date.now()}@testmail.dev`,
      password,
      confirmPassword: password,
    };
  }
}