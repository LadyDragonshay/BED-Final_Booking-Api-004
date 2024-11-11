import { Router } from "express";
import getHosts from "../services/hosts/getHosts.js";
import createHost from "../services/hosts/createHost.js";
import getHostById from "../services/hosts/getHostById.js";
import deleteHostById from "../services/hosts/deleteHostById.js";
import updateHostById from "../services/hosts/updateHostById.js";
import auth from "../middleware/auth.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const { name } = req.query;
    const hosts = await getHosts(name);

    res.status(200).json(hosts);
  } catch (error) {
    next(error);
  }
});

router.post("/", auth, async (req, res, next) => {
  try {
    const {
      username,
      password,
      name,
      email,
      phoneNumber,
      profilePicture,
      aboutMe,
    } = req.body;

    if (
      !username ||
      !password ||
      !name ||
      !email ||
      !phoneNumber ||
      !profilePicture ||
      !aboutMe
    ) {
      return res.status(400).send({
        message:
          "All fields are required: username, password, name, email, phonenNumber, profilePicture and aboutMe",
      });
    }

    const newHost = await createHost({
      username,
      password,
      name,
      email,
      phoneNumber,
      profilePicture,
      aboutMe,
    });
    res.status(201).send({
      message: `Account succesfully created`,
      newHost,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const host = await getHostById(id);

    if (!host) {
      res.status(404).json({ message: `Host with id ${id} was not found` });
    } else {
      res.status(200).json(host);
    }
  } catch (err) {
    next(err);
  }
});

router.put("/:id", auth, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (id) {
      const {
        username,
        password,
        name,
        email,
        phoneNumber,
        profilePicture,
        aboutMe,
      } = req.body;

      const updatedHost = await updateHostById(id, {
        username,
        password,
        name,
        email,
        phoneNumber,
        profilePicture,
        aboutMe,
      });

      // Check if the host was found and updated
      if (!updatedHost || updatedHost.count === 0) {
        return res.status(404).json({
          message: `Host with id ${id} was not found`,
        });
      }

      // Host was successfully updated
      return res.status(200).json({
        message: `Host with id ${id} successfully updated`,
        data: updatedHost,
      });
    }

    // If id is not provided
    res.status(400).json({
      message: "Host ID is required",
    });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", auth, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (id) {
      await deleteHostById(id);

      res.status(200).json({
        message: `Host with id ${id} was successfully deleted!`,
      });
    } else {
      res.status(400).json({
        message: "No id has been given!",
      });
    }
  } catch (error) {
    next(error);
  }
});

export default router;
