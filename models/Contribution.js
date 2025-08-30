const db = require('../config/database');

class Contribution {
  static async create(contributionData) {
    const { firstname, lastname, amount, date, time, userID } = contributionData;
    
    const query = `
      INSERT INTO contributions (firstname, lastname, amount, date, time, userID)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await db.execute(query, [firstname, lastname, amount, date, time, userID]);
    return result.insertId;
  }

  static async findById(id) {
    const query = 'SELECT * FROM contributions WHERE contributionID = ?';
    const [rows] = await db.execute(query, [id]);
    return rows[0];
  }

  static async getAll() {
    const query = 'SELECT * FROM contributions ORDER BY date DESC, time DESC';
    const [rows] = await db.execute(query);
    return rows;
  }

  static async getByUserId(userID) {
    const query = 'SELECT * FROM contributions WHERE userID = ? ORDER BY date DESC, time DESC';
    const [rows] = await db.execute(query, [userID]);
    return rows;
  }

  static async update(id, updateData) {
    const fields = Object.keys(updateData);
    const values = Object.values(updateData);
    
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const query = `UPDATE contributions SET ${setClause} WHERE contributionID = ?`;
    
    const [result] = await db.execute(query, [...values, id]);
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const query = 'DELETE FROM contributions WHERE contributionID = ?';
    const [result] = await db.execute(query, [id]);
    return result.affectedRows > 0;
  }

  static async getTotalByUserId(userID) {
    const query = 'SELECT SUM(amount) as total FROM contributions WHERE userID = ?';
    const [rows] = await db.execute(query, [userID]);
    return rows[0].total || 0;
  }
}

module.exports = Contribution;