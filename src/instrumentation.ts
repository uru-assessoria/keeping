import Database from 'better-sqlite3';
import Usuario from './app/types/usuario';
import { neon } from '@neondatabase/serverless';

export async function register() {
  /*
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const response = await sql`SELECT * FROM usuario`;
    console.log(response[0]);
  }
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const crypto = await import('crypto');
    const { ADM_PASSWORD, ADM_LOGIN, IRON_SESSION_PASSWORD, NODE_ENV } =
      process.env;
    const db = new Database('./db.sqlite');

    try {
      db.exec(`DROP TABLE IF EXISTS usuario`);
      db.exec(`DROP TABLE IF EXISTS cliente`);
      db.exec(`
        CREATE TABLE IF NOT EXISTS usuario (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          login TEXT NOT NULL UNIQUE,
          senha TEXT NOT NULL,
          admin INTEGER NOT NULL DEFAULT 0,
          ativo INTEGER NOT NULL DEFAULT 1                
        )
      `);
      db.exec(`
        CREATE TABLE IF NOT EXISTS cliente (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          razaoSocial TEXT NOT NULL,
          documento TEXT NOT NULL UNIQUE,
          ativo INTEGER NOT NULL DEFAULT 1                
        )
      `);

      const result = db
        .prepare('SELECT * FROM usuario WHERE login = ?')
        .get(ADM_LOGIN) as Usuario;

      if (!result) {
        const encryptedAdmPassword = crypto.hash('sha256', ADM_PASSWORD!);

        const stmt = db.prepare(
          'INSERT INTO usuario (login, senha, admin) VALUES (?, ?, ?)',
        );
        stmt.run(ADM_LOGIN, encryptedAdmPassword, 1);
      }
    } finally {
      db.close();
    }
  }
  */
}
