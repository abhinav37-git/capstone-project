import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

async function main() {
  const prisma = new PrismaClient();
  
  try {
    // Hash the password
    const saltRounds = 10;
    const password = '12345678';
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Check if admin already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: 'abhinavd372@gmail.com',
      },
    });
    
    if (existingUser) {
      console.log('Admin user already exists!');
      return;
    }
    
    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: 'abhinavd372@gmail.com',
        password: hashedPassword,
        role: Role.ADMIN,
        isApproved: true,
        name: 'Admin User',
      },
    });
    
    console.log('Admin user created successfully:');
    console.log({
      id: admin.id,
      email: admin.email,
      role: admin.role,
      isApproved: admin.isApproved,
    });
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

