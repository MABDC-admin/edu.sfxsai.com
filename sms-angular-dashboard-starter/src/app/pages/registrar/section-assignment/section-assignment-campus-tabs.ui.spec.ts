import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const component = readFileSync(
  'src/app/pages/registrar/section-assignment/section-assignment.component.ts',
  'utf8',
);
const template = readFileSync(
  'src/app/pages/registrar/section-assignment/section-assignment.component.html',
  'utf8',
);

assert.match(
  component,
  /readonly campusTabs = \['SFXSAI', 'MABDC'\] as const;/,
  'Section assignment should expose the SFXSAI and MABDC tab set.',
);

assert.match(
  component,
  /activeCampusTab: CampusTab = 'SFXSAI';/,
  'Section assignment should default to the SFXSAI tab.',
);

assert.match(
  component,
  /get filteredSections\(\): SectionRecord\[\]/,
  'Section board should render a campus-filtered section list.',
);

assert.match(
  component,
  /this\.sections\.filter\(section =>\s+this\.sectionBelongsToCampus\(section, this\.activeCampusTab\) &&\s+gradeLevelMatches\(section\.gradeLevel, this\.assignGradeLevel\)/,
  'Assignment modal should show all target sections from the active campus tab, including empty hidden board sections.',
);

assert.match(
  component,
  /showEmptySections = false;/,
  'Section board should hide empty sections by default.',
);

assert.match(
  component,
  /get hiddenEmptySectionCount\(\): number/,
  'Section assignment should expose hidden empty-section count for user context.',
);

assert.match(
  template,
  /section-management-board/,
  'Section assignment should render the redesigned section management board shell.',
);

assert.match(
  template,
  /registrar-workspace/,
  'Section assignment should render the right-side Registrar Workspace rail.',
);

assert.match(
  template,
  /new-learner-assignment/,
  'Section assignment should reserve a visible area for new learners needing assignment.',
);

assert.match(
  template,
  /workspace-action-card/,
  'Registrar Workspace should expose quick access cards.',
);

assert.match(
  template,
  /view-mode-pill/,
  'Section board should include compact view-mode controls matching the reference layout.',
);

assert.match(
  template,
  /Show empty sections/,
  'Section assignment should render the hidden-sections link.',
);

assert.match(
  template,
  /\*ngFor="let section of filteredSections; let index = index"/,
  'Section cards should use the filtered section list.',
);

assert.match(
  component,
  /sectionTone\(gradeLevel\?: string\)/,
  'Section cards should use grade-aware tone classes for the colorful reference layout.',
);

assert.match(
  component,
  /studentAssignedToSection\(student, section\)/,
  'Viewing a section should list only learners assigned to that section and grade level.',
);

assert.match(
  template,
  /\(click\)="openAssignModal\(student\)"/,
  'The card-level ASSIGN button should open the assignment modal for that learner.',
);

assert.match(
  component,
  /openAssignModal\(student\?: StudentRecord\)/,
  'Section assignment should allow opening the modal with one preselected learner.',
);

assert.match(
  component,
  /this\.selectedStudentIds\[student\.id\] = true;/,
  'Opening ASSIGN from a learner card should preselect that learner.',
);

assert.doesNotMatch(
  component,
  /Mia|Liam|Noah|mock-sec/,
  'Section assignment must not inject hardcoded learner or mock section fallback data.',
);
