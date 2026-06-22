const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const students = await prisma.student.findMany({
    where: { 
      OR: [
        { gradeLevel: { contains: '6' } },
        { gradeLevel: { contains: 'G6' } }
      ]
    },
    select: { id: true, firstName: true, lastName: true, section: true, enrollmentStatus: true, studentType: true, gradeLevel: true }
  });

  console.table(students);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
