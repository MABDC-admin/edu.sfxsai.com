import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../auth/roles.decorator';
import { EnrollmentApplicationsController } from './enrollment-applications.controller';

describe('enrollment applications controller role metadata', () => {
  const reflector = new Reflector();

  it('allows principals to read enrollment applications without granting write access', () => {
    expect(reflector.get(ROLES_KEY, EnrollmentApplicationsController.prototype.findAll)).toEqual(
      expect.arrayContaining(['PRINCIPAL']),
    );
    expect(reflector.get(ROLES_KEY, EnrollmentApplicationsController.prototype.findOne)).toEqual(
      expect.arrayContaining(['PRINCIPAL']),
    );

    expect(reflector.get(ROLES_KEY, EnrollmentApplicationsController.prototype.create)).toEqual(['REGISTRAR']);
    expect(reflector.get(ROLES_KEY, EnrollmentApplicationsController.prototype.update)).toEqual(['REGISTRAR']);
    expect(reflector.get(ROLES_KEY, EnrollmentApplicationsController.prototype.remove)).toEqual(['REGISTRAR', 'ADMIN']);
  });
});
