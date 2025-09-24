import { getPanelViewByUserId } from "#queries/db.js";

export async function getPanel(req, res) {
  const { userId, username } = req.auth;

  const view = await getPanelViewByUserId(userId);

  const response_data = {
    user: username,
    domainSuffix: process.env.DOMAIN,
    records: view,
  };
  return res.status(200).json(response_data);
}
