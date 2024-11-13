import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import checkRequiredFields from '../middleware/checkRequiredFields.js';
import jsonSchema from '../../prisma/json-schema/json-schema.json' with { type: 'json' };
import getUsers from '../services/users/getUsers.js';
import createUser from '../services/users/createUser.js';
import getUserById from '../services/users/getUserById.js';
import deleteUserById from '../services/users/deleteUserById.js';
import updateUserById from '../services/users/updateUserById.js';

const router = Router();

// GET / - Fetch users based on query parameters
router.get('/', async (req, res, next) => {
  try {
    const { username, email } = req.query;
    const users = await getUsers(username, email);
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
});

// POST / - Create a new user
router.post(
  '/',
  authMiddleware,
  checkRequiredFields(jsonSchema.definitions.User.required),
  async (req, res, next) => {
    try {
      const { username, password, name, email, phoneNumber, profilePicture } = req.body;
      const newUser = await createUser(username, password, name, email, phoneNumber, profilePicture);
      res.status(201).json(newUser);
    } catch (error) {
      next(error);
    }
  }
);

// GET /:id - Fetch a user by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await getUserById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
});

// DELETE /:id - Delete a user by ID
router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const deletedUserId = await deleteUser(id);

    if (!deletedUserId) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(204).send(); // No content
  } catch (error) {
    next(error);
  }
});

// PUT /:id - Update a user by ID
router.put('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const { username, password, name, email, phoneNumber, profilePicture } = req.body;
    const updatedUser = await updateUserById(id, {
      username,
      password,
      name,
      email,
      phoneNumber,
      profilePicture,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
});

export default router;
