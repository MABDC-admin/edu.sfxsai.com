import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../auth/roles.decorator';
import { StudentsController } from './students.controller';

describe('students controller role metadata', () => {
  const reflector = new Reflector();

  it('allows principals to read the student masterlist and learner profiles', () => {
    expect(reflector.get(ROLES_KEY, StudentsController.prototype.findAll)).toEqual(
      expect.arrayContaining(['PRINCIPAL']),
    );
    expect(reflector.get(ROLES_KEY, StudentsController.prototype.findOne)).toEqual(
      expect.arrayContaining(['PRINCIPAL']),
    );
  });

  it('allows admins to delete enrollment-backed student records explicitly', () => {
    expect(reflector.get(ROLES_KEY, StudentsController.prototype.remove)).toEqual(['REGISTRAR', 'ADMIN']);
  });

  it('exposes registrar-owned enrollment approval with automatic section assignment', () => {
    const source = require('fs').readFileSync(require('path').join(__dirname, 'students.controller.ts'), 'utf8');
    const serviceSource = require('fs').readFileSync(require('path').join(__dirname, 'students.service.ts'), 'utf8');

    expect(source).toMatch(/@Patch\(':id\/approve-enrollment'\)/);
    expect(source).toMatch(/approveEnrollment\(@Param\('id'\) id: string, @Body\(\) body: any\)/);
    expect(serviceSource).toMatch(/approveEnrollment\(id: string, data: Record<string, unknown>/);
    expect(serviceSource).toMatch(/schema\.section/);
    expect(serviceSource).not.toMatch(/enrollmentStatus:\s*'Assigned'/);
  });
});
