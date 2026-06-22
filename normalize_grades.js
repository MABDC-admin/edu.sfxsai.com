const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const models = ['student', 'section', 'enrollmentApplication'];

  for (const model of models) {
    const records = await prisma[model].findMany();
    for (const record of records) {
      if (record.gradeLevel && record.gradeLevel.startsWith('Grade ')) {
        const newGrade = record.gradeLevel.replace('Grade ', 'G');
        await prisma[model].update({
          where: { id: record.id },
          data: { gradeLevel: newGrade }
        });
        console.log(`Updated ${model} ${record.id}: ${record.gradeLevel} -> ${newGrade}`);
      }
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
