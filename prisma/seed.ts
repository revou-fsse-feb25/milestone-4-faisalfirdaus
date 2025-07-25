import { PrismaClient, Role, AccountType } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create Users
  const user1 = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'hashedpassword1', // Use hashed password in production
      role: Role.USER, // Assigning Role enum
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      password: 'hashedpassword2', // Use hashed password in production
      role: Role.ADMIN, // Assigning Role enum
    },
  });

  // Create Accounts for the Users
  const account1 = await prisma.account.create({
    data: {
      user_id: user1.user_id,
      balance: 500.0,
      type: AccountType.SAVINGS, // Assigning AccountType enum
    },
  });

  const account2 = await prisma.account.create({
    data: {
      user_id: user1.user_id,
      balance: 1200.5,
      type: AccountType.CHECKING, // Assigning AccountType enum
    },
  });

  const account3 = await prisma.account.create({
    data: {
      user_id: user2.user_id,
      balance: 750.75,
      type: AccountType.SAVINGS, // Assigning AccountType enum
    },
  });

  // Create Transactions for the Accounts
  const transaction1 = await prisma.transaction.create({
    data: {
      account_id: account1.account_id,
      amount: 200.0,
      description: 'Deposit',
    },
  });

  const transaction2 = await prisma.transaction.create({
    data: {
      account_id: account2.account_id,
      amount: -50.0,
      description: 'Withdrawal',
    },
  });

  const transaction3 = await prisma.transaction.create({
    data: {
      account_id: account3.account_id,
      amount: 1000.0,
      description: 'Deposit',
    },
  });

  const transaction4 = await prisma.transaction.create({
    data: {
      account_id: account2.account_id,
      amount: -200.0,
      description: 'Withdrawal',
    },
  });

  console.log('Seed data successfully created!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
