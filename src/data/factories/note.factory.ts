import { faker } from '@faker-js/faker';

export interface NoteData {
  title: string;
  description: string;
  category: 'Home' | 'Work' | 'Personal';
  completed?: boolean;
}

export class NoteFactory {
  private static readonly CATEGORIES: NoteData['category'][] = [
    'Home',
    'Work',
    'Personal',
  ];

  static validNote(overrides: Partial<NoteData> = {}): NoteData {
    return {
      title: overrides.title ?? faker.lorem.sentence({ min: 3, max: 6 }),
      description:
        overrides.description ?? faker.lorem.paragraph({ min: 1, max: 3 }),
      category:
        overrides.category ??
        faker.helpers.arrayElement(NoteFactory.CATEGORIES),
      completed: overrides.completed ?? false,
    };
  }

  static updatedNote(original: NoteData): NoteData {
    return {
      ...original,
      title: `Updated: ${original.title}`,
      description: `Updated: ${original.description}`,
    };
  }

  static missingTitle(): Partial<NoteData> {
    return {
      description: faker.lorem.paragraph(),
      category: 'Work',
    };
  }

  static longTitle(): NoteData {
    return {
      title: faker.string.alpha(1000),
      description: faker.lorem.paragraph(),
      category: 'Personal',
    };
  }

  static batch(count: number): NoteData[] {
    return Array.from({ length: count }, () => NoteFactory.validNote());
  }
}