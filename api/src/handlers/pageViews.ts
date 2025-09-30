import type { Request, Response } from 'express';
import db from "@ddns/internal/queries/db";

export async function getPanel(req: Request, res: Response) {
  const { user_id, username } = req.auth;

  const view = await db.getPanelViewByUserId(user_id);

  const response_data = {
    user: username,
    domainSuffix: process.env.DOMAIN,
    records: view,
  };
  return res.status(200).json(response_data);
}

export default {
  getPanel
}
