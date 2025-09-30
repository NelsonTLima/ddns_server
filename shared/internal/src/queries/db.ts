import postgres from "pg";


const pg = new postgres.Pool();


export async function getUserByName(username: string) {
  const result = await pg.query("SELECT * FROM users WHERE name = $1", [
    username,
  ]);
  if (result.rowCount === 0) return null;
  const user = result.rows[0];
  return user;
}


export async function updateTokenHashByUserId(hash: string, user_id: number) {
  return await pg.query("UPDATE users SET token_hash = $1 WHERE id = $2;", [
    hash,
    user_id,
  ]);
}


export async function getPanelViewByUserId(user_id: number) {
  const res = await pg.query(
    "SELECT * FROM user_panel_view WHERE user_id = $1",
    [user_id],
  );
  return res.rows;
}


export async function getRecordByName(name: string) {
  const res = await pg.query("SELECT * FROM records WHERE name = $1", [name]);
  if (res.rowCount == 0) return null;
  return res.rows[0];
}


export async function isNameInRecords(name: string) {
  const rows = await getRecordByName(name);
  return rows !== null;
}


export async function insertPostRecord(
  user_id: number,
  cloudflare_id: string,
  name: string,
  content: string,
  proxied: boolean,
  created_on: string,
  modified_on: string,
) {
  return await pg.query(
    `
    INSERT INTO records (
      user_id,
      cloudflare_id,
      name,
      content,
      proxied,
      created_on,
      modified_on
    ) VALUES ($1, $2, $3, $4, $5, $6, $7);
    `,
    [user_id, cloudflare_id, name, content, proxied, created_on, modified_on],
  );
}


export async function deleteRecordById(id: number) {
  const result = await pg.query(
    `
      DELETE FROM records WHERE cloudflare_id = $1;
    `,
    [id],
  );
  return result.rowCount;
}


export async function changeRecordContent(id: number, content: string) {
  console.log(id);
  console.log(content);
  const result = await pg.query(
    `
      UPDATE records SET content = $1 WHERE cloudflare_id = $2;
    `,
    [content, id],
  );
  return result.rowCount;
}


export async function getNamesByUserId(user_id: number){
  const res = await pg.query(
    `SELECT * FROM records WHERE user_id = $1 ORDER BY name`, [user_id]
  );
  return res.rows
}


export default {
  getUserByName,
  updateTokenHashByUserId,
  getPanelViewByUserId,
  getRecordByName,
  getNamesByUserId,
  isNameInRecords,
  insertPostRecord,
  changeRecordContent,
  deleteRecordById
}
