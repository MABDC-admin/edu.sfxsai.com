import { BadRequestException, Injectable } from '@nestjs/common';
import { and, asc, count, desc, eq, ilike, or, type SQL } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { DrizzleService } from '../drizzle/drizzle.service';
import * as schema from '../drizzle/schema';
import { normalizeStandardGradeLevel } from '../sections/standard-sections.util';

const DEFAULT_STUDENT_PASSWORD = 'ChangeMe123!';
const DEFAULT_APPROVAL_SECTION = 'SFXSAI';

function toNumber(value: number | string | bigint | null | undefined) {
  if (typeof value === 'number') return value;
  if (typeof value === 'bigint') return Number(value);
  return Number(value || 0);
}

function withoutPassword<T extends { users?: Array<{ password?: string } | null> | null }>(record: T | null) {
  if (!record || !record.users?.length) {
    return record;
  }

  const [firstUser] = record.users;
  if (!firstUser) {
    return { ...record, user: null, users: [] } as T & { user: null; users: [] };
  }

  const { password, ...userWithoutPassword } = firstUser;
  void password;
  return {
    ...(record as T),
    user: userWithoutPassword,
    users: [userWithoutPassword],
  } as T & { user: typeof userWithoutPassword; users: typeof record['users'] };
}

@Injectable()
export class StudentsService {
  constructor(private drizzle: DrizzleService) {}

  private assertCreatePayload(payload: Record<string, unknown>) {
    if (!payload?.firstName || !payload?.lastName) {
      throw new BadRequestException('Student first name and last name are required.');
    }
  }

  private normalizeSearchPattern(search?: string) {
    return `%${(search ?? '').trim().replace(/%/g, '\\%')}%`;
  }

  async create(data: Record<string, unknown>) {
    this.assertCreatePayload(data);
    const normalizedPayload: any = {
      ...data,
      gradeLevel: data?.gradeLevel ? normalizeStandardGradeLevel(data.gradeLevel as string) : data.gradeLevel,
    };
    const [{ count: currentCount }] = await this.drizzle.db
      .select({ count: count(schema.student.id) })
      .from(schema.student);

    const sequence = (toNumber(currentCount) + 1).toString().padStart(3, '0');
    const studentNo = `STU-2026-${sequence}`;
    const providedLrn = data.lrn && String(data.lrn).trim() !== '' ? data.lrn : `TBA-${crypto.randomUUID().split('-')[0].toUpperCase()}`;

    const [created] = await this.drizzle.db
      .insert(schema.student)
      .values({
        id: crypto.randomUUID(),
        studentNo,
        ...normalizedPayload,
        lrn: providedLrn,
        lastUpdated: new Date().toISOString(),
      } as typeof schema.student.$inferInsert)
      .returning();

    return created;
  }

  async findAll(ayId?: string, search?: string) {
    const filters: SQL<unknown>[] = [];
    if (ayId) {
      filters.push(eq(schema.student.academicYearId, ayId));
    }
    if (search?.trim()) {
      const pattern = this.normalizeSearchPattern(search);
      const searchFilter = or(
        ilike(schema.student.firstName, pattern),
        ilike(schema.student.lastName, pattern),
        ilike(schema.student.lrn, pattern),
        ilike(schema.student.studentNo, pattern),
      );
      if (searchFilter) {
        filters.push(searchFilter);
      }
    }

    const where = filters.length ? and(...filters) : undefined;
    return this.drizzle.db.query.student.findMany({
      where,
      orderBy: [desc(schema.student.lastUpdated), asc(schema.student.firstName)],
      limit: search ? 5 : undefined,
    });
  }

  async findOne(id: string) {
    const row = await this.drizzle.db.query.student.findFirst({
      where: eq(schema.student.id, id),
      with: {
        behaviorRecords: true,
        studentFees: true,
        studentSiblings: true,
        users: true,
      },
    });

    if (!row) return null;

    const user = row.users?.[0] ?? null;
    const fees = row.studentFees ?? [];
    const siblings = row.studentSiblings ?? [];
    const withPasswordRemoved = withoutPassword({ ...row, user: user as { password?: string } | null, users: row.users });
    return {
      ...withPasswordRemoved,
      user: withPasswordRemoved?.user ?? null,
      fees,
      siblings,
    };
  }

  async update(id: string, data: Record<string, unknown>) {
    const student = await this.drizzle.db.query.student.findFirst({
      where: eq(schema.student.id, id),
      with: { users: true },
    });

    if (!student) {
      throw new BadRequestException('Student was not found.');
    }

    const nextEnrollment = data.enrollmentStatus as string | undefined;
    const wasOfficial = student.enrollmentStatus === 'Officially Enrolled';
    const nowOfficial = nextEnrollment === 'Officially Enrolled';
    const hasUser = student.users && student.users.length > 0;

    const currentUser = (student.users?.[0] ?? null) as { id: string } | null;

    if (nowOfficial && !wasOfficial && !hasUser) {
      const baseUsername = `${student.firstName?.toLowerCase?.()?.replace(/\s+/g, '') ?? ''}.${student.lastName?.toLowerCase?.()?.replace(/\s+/g, '') ?? ''}`;
      let email = `${baseUsername}@sfxsai.com`;
      let suffix = 1;

      while (await this.drizzle.db.query.user.findFirst({ where: eq(schema.user.email, email) })) {
        email = `${baseUsername}${suffix++}@sfxsai.com`;
      }

      await this.drizzle.db.insert(schema.user).values({
        id: crypto.randomUUID(),
        email,
        password: await bcrypt.hash(DEFAULT_STUDENT_PASSWORD, 10),
        role: 'STUDENT',
        studentId: id,
      });
    }

    const payload: any = {
      ...data,
      gradeLevel: data?.gradeLevel ? normalizeStandardGradeLevel(data.gradeLevel as string) : data.gradeLevel,
    };

    const [updated] = await this.drizzle.db
      .update(schema.student)
      .set({
        ...payload,
        lastUpdated: new Date().toISOString(),
      })
      .where(eq(schema.student.id, id))
      .returning();

    if (!updated) {
      throw new BadRequestException('Student was not found.');
    }


    return {
      ...updated,
      user: currentUser,
      users: currentUser ? [currentUser] : [],
    };
  }

  async approveEnrollment(id: string, data: Record<string, unknown> = {}) {
    const student = await this.drizzle.db.query.student.findFirst({
      where: eq(schema.student.id, id),
      with: { users: true },
    });

    if (!student) {
      throw new BadRequestException('Student was not found.');
    }

    const gradeLevel = normalizeStandardGradeLevel(student.gradeLevel);
    const requestedCampus = String(data.campus ?? DEFAULT_APPROVAL_SECTION).trim().toUpperCase();
    const targetCampus = requestedCampus === 'MABDC' ? 'MABDC' : DEFAULT_APPROVAL_SECTION;
    let targetSectionName = String(student.section ?? '').trim();
    let targetSection: typeof schema.section.$inferSelect | null = null;

    if (!targetSectionName && gradeLevel && student.academicYearId) {
      targetSection = await this.drizzle.db.query.section.findFirst({
        where: and(
          eq(schema.section.academicYearId, student.academicYearId),
          eq(schema.section.gradeLevel, gradeLevel),
          eq(schema.section.sectionName, targetCampus),
        ),
      }) as typeof schema.section.$inferSelect | null;

      if (targetSection && (targetSection.availableSlots ?? 0) > 0) {
        targetSectionName = targetSection.sectionName;
      }
    }

    const approved = await this.update(id, {
      enrollmentStatus: 'Officially Enrolled',
      documentStatus: 'Complete',
      gradeLevel,
      ...(targetSectionName ? { section: targetSectionName } : {}),
    });

    if (targetSection && targetSectionName) {
      const nextEnrolled = (targetSection.enrolled ?? 0) + 1;
      const nextAvailableSlots = Math.max((targetSection.capacity ?? 0) - nextEnrolled, 0);
      const nextStatus = nextAvailableSlots <= 0 ? 'Closed' : nextAvailableSlots <= 5 ? 'Nearly Full' : 'Open';

      await this.drizzle.db
        .update(schema.section)
        .set({
          enrolled: nextEnrolled,
          availableSlots: nextAvailableSlots,
          status: nextStatus,
        })
        .where(eq(schema.section.id, targetSection.id))
        .returning();
    }

    return approved;
  }

  async disableStudent(id: string, data: Record<string, unknown>) {
    const student = await this.drizzle.db.query.student.findFirst({
      where: eq(schema.student.id, id),
      with: { users: true },
    });

    if (!student) {
      throw new BadRequestException('Student was not found.');
    }

    const movementType = String(data.movementType ?? 'Dropout').trim();
    if (movementType !== 'Dropout' && movementType !== 'Transfer Out') {
      throw new BadRequestException('Disable movement type is invalid.');
    }

    const reason = String(data.reason ?? '').trim();
    if (!reason) {
      throw new BadRequestException(`${movementType} reason is required.`);
    }

    const enrollmentStatus = movementType === 'Transfer Out' ? 'Transferred Out' : 'Dropped Out';
    const effectiveDate = String(data.effectiveDate || new Date().toISOString());
    const remarks = String(data.remarks ?? '').trim();
    const requestedBy = String(data.requestedBy ?? 'Registrar').trim() || 'Registrar';
    const studentName = [student.firstName, student.middleName, student.lastName]
      .filter(Boolean)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    const fromSection = [student.gradeLevel, student.section].filter(Boolean).join(' - ') || 'Active masterlist';
    const movementDetail = remarks ? `${enrollmentStatus} - ${reason}; ${remarks}` : `${enrollmentStatus} - ${reason}`;

    if (student.users?.length) {
      await this.drizzle.db.delete(schema.user).where(eq(schema.user.studentId, id)).returning();
    }

    await this.drizzle.db.insert(schema.learnerMovement).values({
      id: crypto.randomUUID(),
      studentName,
      movementType,
      from: fromSection,
      to: movementDetail,
      effectiveDate,
      status: 'Completed',
      requestedBy,
      academicYearId: student.academicYearId,
    } as typeof schema.learnerMovement.$inferInsert).returning();

    const [updated] = await this.drizzle.db
      .update(schema.student)
      .set({
        enrollmentStatus,
        financeStatus: 'Frozen',
        section: null,
        adviser: null,
        lastUpdated: new Date().toISOString(),
      })
      .where(eq(schema.student.id, id))
      .returning();

    if (!updated) {
      throw new BadRequestException('Student was not found.');
    }

    const assessmentWhere = student.academicYearId
      ? and(
        eq(schema.studentAssessment.studentId, id),
        eq(schema.studentAssessment.academicYearId, student.academicYearId),
      )
      : eq(schema.studentAssessment.studentId, id);

    await this.drizzle.db
      .update(schema.studentAssessment)
      .set({
        financeStatus: 'Frozen',
        updatedAt: new Date().toISOString(),
      })
      .where(assessmentWhere);

    return {
      ...updated,
      user: null,
      users: [],
    };
  }

  async moveGradeSection(id: string, data: Record<string, unknown>) {
    const student = await this.drizzle.db.query.student.findFirst({
      where: eq(schema.student.id, id),
      with: { users: true },
    });

    if (!student) {
      throw new BadRequestException('Student was not found.');
    }

    const rawGradeLevel = String(data.gradeLevel ?? '').trim();
    const nextGradeLevel = rawGradeLevel ? normalizeStandardGradeLevel(rawGradeLevel) : '';
    if (!nextGradeLevel) {
      throw new BadRequestException('Target grade level is required.');
    }

    const nextSection = String(data.section ?? '').trim();
    if (!nextSection) {
      throw new BadRequestException('Target section is required.');
    }

    const movementType = String(data.movementType ?? 'Correction').trim();
    const allowedMovementTypes = ['Promotion', 'Correction', 'Retention', 'Transfer Section'];
    if (!allowedMovementTypes.includes(movementType)) {
      throw new BadRequestException('Learner movement type is invalid.');
    }

    const reason = String(data.reason ?? '').trim();
    if (!reason) {
      throw new BadRequestException('Movement reason is required.');
    }

    const effectiveDate = String(data.effectiveDate || new Date().toISOString());
    const remarks = String(data.remarks ?? '').trim();
    const requestedBy = String(data.requestedBy ?? 'Registrar').trim() || 'Registrar';
    const nextAcademicYearId = String(data.academicYearId ?? student.academicYearId ?? '').trim() || student.academicYearId;
    const studentName = [student.firstName, student.middleName, student.lastName]
      .filter(Boolean)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    const fromSection = [student.gradeLevel, student.section].filter(Boolean).join(' - ') || 'Active masterlist';
    const toSection = [nextGradeLevel, nextSection].filter(Boolean).join(' - ');
    const movementDetail = remarks ? `${toSection} - ${reason}; ${remarks}` : `${toSection} - ${reason}`;

    await this.drizzle.db.insert(schema.learnerMovement).values({
      id: crypto.randomUUID(),
      studentName,
      movementType,
      from: fromSection,
      to: movementDetail,
      effectiveDate,
      status: 'Completed',
      requestedBy,
      academicYearId: nextAcademicYearId,
    } as typeof schema.learnerMovement.$inferInsert).returning();

    const [updated] = await this.drizzle.db
      .update(schema.student)
      .set({
        gradeLevel: nextGradeLevel,
        section: nextSection,
        academicYearId: nextAcademicYearId,
        lastUpdated: new Date().toISOString(),
      })
      .where(eq(schema.student.id, id))
      .returning();

    if (!updated) {
      throw new BadRequestException('Student was not found.');
    }

    const currentUser = (student.users?.[0] ?? null) as { id: string } | null;
    return {
      ...updated,
      user: currentUser,
      users: currentUser ? [currentUser] : [],
    };
  }

  async dropoutStudent(id: string, data: Record<string, unknown>) {
    return this.disableStudent(id, { ...data, movementType: 'Dropout' });
  }

  remove(id: string) {
    return this.drizzle.db.delete(schema.student).where(eq(schema.student.id, id)).returning();
  }

  addBehaviorRecord(
    studentId: string,
    data: Record<string, unknown>,
  ) {
    return this.drizzle.db.insert(schema.behaviorRecord).values({
      id: crypto.randomUUID(),
      studentId,
      ...(data as Record<string, unknown>),
    } as typeof schema.behaviorRecord.$inferInsert).returning();
  }

  addStudentFee(
    studentId: string,
    data: Record<string, unknown>,
  ) {
    return this.drizzle.db.insert(schema.studentFee).values({
      id: crypto.randomUUID(),
      studentId,
      ...(data as Record<string, unknown>),
    } as typeof schema.studentFee.$inferInsert).returning();
  }

  addStudentSibling(
    studentId: string,
    data: Record<string, unknown>,
  ) {
    return this.drizzle.db.insert(schema.studentSibling).values({
      id: crypto.randomUUID(),
      studentId,
      ...(data as Record<string, unknown>),
    } as typeof schema.studentSibling.$inferInsert).returning();
  }

  async resetPassword(studentId: string) {
    const user = await this.drizzle.db.query.user.findFirst({
      where: eq(schema.user.studentId, studentId),
    });
    if (!user) {
      throw new BadRequestException('Student user account was not found.');
    }

    const [updated] = await this.drizzle.db
      .update(schema.user)
      .set({
        password: await bcrypt.hash(DEFAULT_STUDENT_PASSWORD, 10),
      })
      .where(eq(schema.user.id, user.id))
      .returning();

    if (!updated) {
      throw new BadRequestException('Student user account was not found.');
    }

    const { password, ...safeUser } = updated;
    void password;
    return safeUser;
  }
}




