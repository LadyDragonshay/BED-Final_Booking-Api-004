import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const getProperties = async (hostId, location, priceRange, amenities) => {
  try {
    const properties = await prisma.property.findMany({
      where: {
        ...(hostId && { hostId }),
        ...(location && {
          location: { contains: location, mode: "insensitive" },
        }),
        ...(priceRange && {
          pricePerNight: {
            gte: priceRange.min,
            lte: priceRange.max,
          },
        }),
        ...(amenities &&
          amenities.length > 0 && {
            amenities: {
              some: {
                name: {
                  in: amenities,
                },
              },
            },
          }),
      },
      include: {
        amenities: true,
      },
    });

    return properties;
  } catch (error) {
    console.error("Error fetching properties:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

export default getProperties;
