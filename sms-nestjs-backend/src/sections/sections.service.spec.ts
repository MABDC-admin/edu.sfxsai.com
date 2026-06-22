import { SectionsService } from './sections.service';
import { createDrizzleMock } from '../test/drizzle-mock';
import * as schema from '../drizzle/schema';

describe('SectionsService', () => {
  function createService() {
    const db = createDrizzleMock({
      query: {
        section: {
          findFirst: jest.fn(),
        },
        student: {
          findMany: jest.fn(),
        },
      },
    });
    return {
      db,
      service: new SectionsService({ db } as never),
    };
  }

  it('assigns selected learners to the section without changing enrollment status', async () => {
    const { db, service } = createService();
    (db.query.section.findFirst as jest.Mock).mockResolvedValue({
      id: 'section-nursery',
      sectionName: 'SFXSAI',
      gradeLevel: 'Nursery',
      capacity: 30,
      enrolled: 11,
      availableSlots: 19,
    });

    db.__queue.push('update', { id: 'learner-1', section: 'SFXSAI', enrollmentStatus: 'Officially Enrolled' });
    db.__queue.push('update', { id: 'section-nursery', enrolled: 12, availableSlots: 18 });

    await service.batchAssign('section-nursery', ['learner-1']);

    expect(db.update).toHaveBeenNthCalledWith(1, schema.student);
    const studentUpdate = db.update.mock.results[0].value;
    expect(studentUpdate.set).toHaveBeenCalledWith({ section: 'SFXSAI' });
  });
});
