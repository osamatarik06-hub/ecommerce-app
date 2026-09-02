import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.product.deleteMany(); // Clear old items

  await prisma.product.createMany({
    data: [
      {
        name: 'Wireless Noise-Canceling Headphones',
        description: 'High-fidelity audio with active noise cancellation.',
        price: 19999, // $199.99 stored in cents
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
      },
      {
        name: 'Ergonomic Mechanical Keyboard',
        description: 'Customizable RGB keyboard with tactile switches.',
        price: 12999, // $129.99
        imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500',
      },
      {
        name: 'Ultra-Wide Gaming Monitor',
        description: '34-inch curved display with 144Hz refresh rate.',
        price: 49999, // $499.99
        imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500',
      },
    ],
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());