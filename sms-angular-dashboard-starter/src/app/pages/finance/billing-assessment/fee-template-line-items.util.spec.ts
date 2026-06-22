import assert from 'node:assert/strict';
import { getFeeTemplateLineItems } from './fee-template-line-items.util.ts';

const backendTemplate = {
  id: 'template-grade-1',
  academicYearId: 'ay-1',
  gradeLevel: 'G1',
  name: 'Whole Year Tuitions',
  isActive: true,
  feeTemplateLineItems: [
    {
      id: 'template-line-1',
      feeTemplateId: 'template-grade-1',
      feeTypeId: 'fee-tuition',
      description: 'Grade 1 tuition',
      amount: 12000,
      sortOrder: 0,
    },
  ],
};

const items = getFeeTemplateLineItems(backendTemplate as any);

assert.equal(items.length, 1, 'backend feeTemplateLineItems should be usable by billing assessment');
assert.equal(items[0].description, 'Grade 1 tuition');
assert.equal(items[0].amount, 12000);
