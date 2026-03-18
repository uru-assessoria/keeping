import Database from 'better-sqlite3';
import Usuario from './app/models/usuario';
import { hash } from 'crypto';

export async function register() {
  const { ADM_PASSWORD, ADM_LOGIN, IRON_SESSION_PASSWORD, NODE_ENV } =
    process.env;
  const db = new Database('./db.sqlite');
  try {
    db.exec(`DROP TABLE IF EXISTS usuario`);
    db.exec(`
      CREATE TABLE IF NOT EXISTS usuario (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        login TEXT NOT NULL UNIQUE,
        senha TEXT NOT NULL,
        admin INTEGER NOT NULL DEFAULT 0        
      )
    `);

    const result = db
      .prepare('SELECT * FROM usuario WHERE login = ?')
      .get(ADM_LOGIN) as Usuario;

    if (!result) {
      const encryptedAdmPassword = hash('sha256', ADM_PASSWORD!);

      const stmt = db.prepare(
        'INSERT INTO usuario (login, senha, admin) VALUES (?, ?, ?)',
      );
      stmt.run(ADM_LOGIN, encryptedAdmPassword, 1);
    }
  } finally {
    db.close();
  }
}
