import { PrismaClient } from "@prisma/client";

const createUser = async (
  username,
  password,
  name,
  email,
  phoneNumber,
  profilePicture
) => {
  const prisma = new PrismaClient();
  // Create the new user and return it.
  const newUser = await prisma.user.create({
    data: {
      id: uuid(),
      username,
      password,
      name,
      email,
      phoneNumber,
      profilePicture,
    },
  });

  userData.users.push(newUser);
  return newUser;
};

export default createUser;
