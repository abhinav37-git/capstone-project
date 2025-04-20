import { PrismaClient, Role } from '@prisma/client';

// Initialize Prisma client
const prisma = new PrismaClient();

async function main() {
  console.log('Testing database connectivity...');
  
  try {
    // Create a unique email using timestamp to avoid conflicts
    const uniqueEmail = `test-user-${Date.now()}@example.com`;
    
    // Create a test user
    const createdUser = await prisma.user.create({
      data: {
        email: uniqueEmail,
        name: 'Test User',
        password: 'password123',
        role: Role.STUDENT,
      },
    });
    
    console.log('Created test user:');
    console.log(createdUser);
    
    // Query to verify the user was created
    const retrievedUser = await prisma.user.findUnique({
      where: {
        email: uniqueEmail,
      },
    });
    
    console.log('Retrieved user:');
    console.log(retrievedUser);
    
    if (retrievedUser && retrievedUser.id === createdUser.id) {
      console.log('Database connectivity test SUCCESSFUL ✅');
    } else {
      console.log('Database connectivity test FAILED ❌');
    }
    
    // Clean up - delete the test user
    await prisma.user.delete({
      where: {
        id: createdUser.id,
      },
    });
    
    console.log('Test user deleted successfully');
    
  } catch (error) {
    console.error('Database connectivity test FAILED ❌');
    console.error('Error details:', error);
  } finally {
    // Close the database connection
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

