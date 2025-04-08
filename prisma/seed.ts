import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seeding...');

  // Create test users
  const teacherPassword = await hash('password123', 10);
  const studentPassword = await hash('password123', 10);

  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@example.com' },
    update: {},
    create: {
      email: 'teacher@example.com',
      name: 'Test Teacher',
      password: teacherPassword,
      role: 'TEACHER',
    },
  });

  const student = await prisma.user.upsert({
    where: { email: 'student@example.com' },
    update: {},
    create: {
      email: 'student@example.com',
      name: 'Test Student',
      password: studentPassword,
      role: 'STUDENT',
    },
  });

  console.log('Created test users:', { teacher, student });

  // Create test courses
  const course1 = await prisma.course.upsert({
    where: { id: 'test-course-1' },
    update: {},
    create: {
      id: 'test-course-1',
      title: 'Test Course 1',
      description: 'This is a test course',
      teacherId: teacher.id,
    },
  });

  const course2 = await prisma.course.upsert({
    where: { id: 'test-course-2' },
    update: {},
    create: {
      id: 'test-course-2',
      title: 'Test Course 2',
      description: 'This is another test course',
      teacherId: teacher.id,
    },
  });

  console.log('Created test courses:', { course1, course2 });

  // Create test modules
  const module1 = await prisma.module.upsert({
    where: { id: 'test-module-1' },
    update: {},
    create: {
      id: 'test-module-1',
      title: 'Test Module 1',
      description: 'This is a test module',
      order: 1,
      courseId: course1.id,
    },
  });

  const module2 = await prisma.module.upsert({
    where: { id: 'test-module-2' },
    update: {},
    create: {
      id: 'test-module-2',
      title: 'Test Module 2',
      description: 'This is another test module',
      order: 2,
      courseId: course1.id,
    },
  });

  console.log('Created test modules:', { module1, module2 });

  // Enroll student in course
  const enrollment = await prisma.enrollment.upsert({
    where: {
      studentId_courseId: {
        studentId: student.id,
        courseId: course1.id,
      },
    },
    update: {},
    create: {
      studentId: student.id,
      courseId: course1.id,
    },
  });

  console.log('Created test enrollment:', enrollment);

  // Create test progress
  const progress = await prisma.progress.upsert({
    where: {
      studentId_moduleId: {
        studentId: student.id,
        moduleId: module1.id,
      },
    },
    update: {},
    create: {
      studentId: student.id,
      moduleId: module1.id,
      status: 'COMPLETED',
    },
  });

  console.log('Created test progress:', progress);

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 