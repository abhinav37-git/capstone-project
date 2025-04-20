import { PrismaClient } from '@prisma/client'
import { hash } from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const adminEmail = 'admin@capstone.com'
  const adminPassword = 'Admin@123' // You should change this password

  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    })

    if (existingAdmin) {
      console.log('Admin user already exists')
      return
    }

    // Create admin user
    const hashedPassword = await hash(adminPassword, 12)
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'System Admin',
        password: hashedPassword,
        role: 'ADMIN',
        isApproved: true
      }
    })

    console.log('Default admin user created:', {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role
    })
    console.log('Please save these credentials:')
    console.log('Email:', adminEmail)
    console.log('Password:', adminPassword)

  } catch (error) {
    console.error('Error creating admin user:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  }) 