import { Request as ExpressRequest, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";

interface Request extends ExpressRequest {
    userId?: number;
    userRole?: string;
    vendeurId?: number;
    clientId?: number;
}

interface JwtPayload {
    userId: number;
    userRole: string;
    vendeurId?: number;
    clientId?: number;
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: "No token provided" });
    }

    const parts = authHeader.split(" ");

    if (parts.length !== 2) {
        return res.status(401).json({ message: "Token error" });
    }

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) {
        return res.status(401).json({ message: "Token malformatted" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as JwtPayload;

        req.userId = decoded.userId;
        req.userRole = decoded.userRole;
        req.vendeurId = decoded.vendeurId;
        req.clientId = decoded.clientId;

        return next();
    } catch (err) {
        return res.status(401).json({ message: "Token invalid" });
    }
};

export const generateToken = async (userId: number): Promise<string> => {
  const userRepository = AppDataSource.getRepository(User);
  const user = await userRepository.findOne({
    where: { id: userId },
    relations: ["vendeur", "client"],
    select: ["id", "role", "email", "username"], // Assurez-vous de sélectionner les champs nécessaires
  });

  if (!user) {
    throw new Error("User not found");
  }

  const payload: JwtPayload = {
    userId: user.id,
    userRole: user.role,
    vendeurId: user.vendeur?.id,
    clientId: user.client?.id,
  };

  return jwt.sign(payload, process.env.JWT_SECRET || "your-secret-key", {
    expiresIn: "1d",
  });
};

