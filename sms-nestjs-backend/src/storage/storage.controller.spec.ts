import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../auth/roles.decorator';
import { StorageController } from './storage.controller';

describe('storage controller role metadata', () => {
  const reflector = new Reflector();

  it('allows principals to use shared storage uploads including staff avatars', () => {
    expect(reflector.get(ROLES_KEY, StorageController)).toEqual(
      expect.arrayContaining(['PRINCIPAL']),
    );
  });
});
