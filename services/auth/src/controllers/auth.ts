import User from "../model/User.js";
import jwt from "jsonwebtoken";
import tryCatch from "../middlewares/tryCatch.js";
import { AuthenticatedRequest } from "../middlewares/isAuth.js";

export const loginUser = tryCatch(async (req, res) => {
   const { email, name, image } = req.body;
   let user = await User.findOne({ email });

   if (!user) {
      user = await User.create({
         name,
         email,
         image,
      });
   }

   const token = jwt.sign(
      {
         user,
      },
      process.env.JWT_SECRET as string,
      {
         expiresIn: "15d",
      },
   );

   res.status(200).json({
      message: "Logged in",
      token,
      user,
   });
});

const allowedRoles = ["customer", "rider", "seller"] as const;

type Role = (typeof allowedRoles)[number];

export const addUserRole = tryCatch(async (req: AuthenticatedRequest, res) => {
   if (!req.user?._id) {
      return res.status(401).json({
         message: "Unauthorized",
      });
   }

   const { role } = req.body as { role: Role };

   if (!allowedRoles.includes(role)) {
      return res.status(400).json({
         message: "Invalid role",
      });
   }

   const user = await User.findByIdAndUpdate(req.user._id, { role }, { new: true });

   if (!user) {
      return res.status(401).json({
         message: "User not found",
      });
   }

   const token = jwt.sign(
      {
         user,
      },
      process.env.JWT_SECRET as string,
      {
         expiresIn: "15d",
      },
   );

   res.json({
      user,
      token,
   });
});

export const profile = tryCatch(async (req: AuthenticatedRequest, res) => {
   res.json(req.user);
});
