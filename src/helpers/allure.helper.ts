import { test } from '@playwright/test';

export function allureStep(name: string) {
  return function (
    _target: unknown,
    _propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: unknown[]) {
      return test.step(name, async () => {
        return originalMethod.apply(this, args);
      });
    };
    return descriptor;
  };
}

export async function step(name: string, fn: () => Promise<void>): Promise<void> {
  await test.step(name, fn);
}