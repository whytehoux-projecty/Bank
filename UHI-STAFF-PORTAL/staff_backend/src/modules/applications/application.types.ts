import { Prisma } from "@prisma/client";

export interface CreateApplicationDTO {
  type: "leave" | "transfer" | "training" | "loan" | "grant";
  data: Prisma.InputJsonValue;
}
