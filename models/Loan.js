const db = require('../config/database');

class Loan {
  static async create(loanData) {
    const { firstname, lastname, amount, date, time, reason, userID } = loanData;
    
    const query = `
      INSERT INTO loans (firstname, lastname, amount, date, time, reason, userID)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await db.execute(query, [firstname, lastname, amount, date, time, reason, userID]);
    return result.insertId;
  }

  static async findById(id) {
    const query = 'SELECT * FROM loans WHERE loanID = ?';
    const [rows] = await db.execute(query, [id]);
    return rows[0];
  }

  static async getAll() {
    const query = 'SELECT * FROM loans ORDER BY date DESC, time DESC';
    const [rows] = await db.execute(query);
    return rows;
  }

  static async getByUserId(userID) {
    const query = 'SELECT * FROM loans WHERE userID = ? ORDER BY date DESC, time DESC';
    const [rows] = await db.execute(query, [userID]);
    return rows;
  }

  static async update(id, updateData) {
    const fields = Object.keys(updateData);
    const values = Object.values(updateData);
    
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const query = `UPDATE loans SET ${setClause} WHERE loanID = ?`;
    
    const [result] = await db.execute(query, [...values, id]);
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const query = 'DELETE FROM loans WHERE loanID = ?';
    const [result] = await db.execute(query, [id]);
    return result.affectedRows > 0;
  }

  static async getTotalByUserId(userID) {
    const query = 'SELECT SUM(amount) as total FROM loans WHERE userID = ?';
    const [rows] = await db.execute(query, [userID]);
    return rows[0].total || 0;
  }
}

module.exports = Loan;