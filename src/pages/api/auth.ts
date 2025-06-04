// File: pages/api/auth.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { secret } = req.body;
  if (typeof secret !== "string") {
    return res.status(400).json({ error: "Bad Request" });
  }

  if (secret === process.env.ADMIN_SECRET) {
    return res.status(200).json({ ok: true });
  } else {
    return res.status(401).json({ error: "Unauthorized" });
  }
}
