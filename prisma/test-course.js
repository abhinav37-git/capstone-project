const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Get the first teacher user
    const teacher = await prisma.user.findFirst({
      where: { role: 'TEACHER' }
    });

    if (!teacher) {
      console.error('No teacher found in the database');
      return;
    }

    console.log('Found teacher:', teacher);

    // Create a test course
    const course = await prisma.course.create({
      data: {
        title: 'Test Course',
        description: 'This is a test course created directly through Prisma',
        teacherId: teacher.id
      }
    });

    console.log('Created course:', course);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 