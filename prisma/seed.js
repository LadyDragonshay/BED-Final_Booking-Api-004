import { PrismaClient } from "@prisma/client";
import amenityData from '../src/data/amenities.json' with { type: 'json' };
import bookingData from '../src/data/bookings.json' with { type: 'json' };
import hostData from '../src/data/hosts.json' with { type: 'json' };
import propertyData from '../src/data/properties.json' with { type: 'json' };
import reviewData from '../src/data/reviews.json' with { type: 'json' };
import userData from '../src/data/users.json' with { type: 'json' };

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"]
});

async function main() {
  try {
    const { users } = userData;
    const { bookings } = bookingData;
    const { properties } = propertyData;
    const { reviews } = reviewData;
    const { hosts } = hostData;
    const { amenities } = amenityData;

    console.log('Starting to seed database...');

    // Clear existing data
    await prisma.$transaction([
      prisma.review.deleteMany(),
      prisma.booking.deleteMany(),
      prisma.propertyAmenity.deleteMany(),
      prisma.property.deleteMany(),
      prisma.amenity.deleteMany(),
      prisma.host.deleteMany(),
      prisma.user.deleteMany(),
    ]);

    // Seed users
    console.log('Seeding users...');
    await Promise.all(
      users.map((user) =>
        prisma.user.upsert({
          where: { id: user.id },
          update: {},
          create: user,
        })
      )
    );

    // Seed hosts
    console.log('Seeding hosts...');
    await Promise.all(
      hosts.map((host) =>
        prisma.host.upsert({
          where: { id: host.id },
          update: {},
          create: host,
        })
      )
    );

    // Seed amenities
    console.log('Seeding amenities...');
    await Promise.all(
      amenities.map((amenity) =>
        prisma.amenity.upsert({
          where: { id: amenity.id },
          update: {},
          create: amenity,
        })
      )
    );

    // Seed properties
    console.log('Seeding properties...');
    await Promise.all(
      properties.map((property) => {
        const { amenityIds, ...propertyData } = property;
        return prisma.property.upsert({
          where: { id: property.id },
          update: {},
          create: {
            ...propertyData,
            amenities: {
              connect: amenityIds?.map((id) => ({ id })) || []
            },
          },
        });
      })
    );

    // Seed bookings
    console.log('Seeding bookings...');
    await Promise.all(
      bookings.map((booking) =>
        prisma.booking.upsert({
          where: { id: booking.id },
          update: {},
          create: booking,
        })
      )
    );

    // Seed reviews
    console.log('Seeding reviews...');
    await Promise.all(
      reviews.map((review) =>
        prisma.review.upsert({
          where: { id: review.id },
          update: {},
          create: review,
        })
      )
    );

    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
});
