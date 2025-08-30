const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create(userData) {
    const { username, password, role, profileData } = userData;
    
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Start transaction
    const connection = await db.getConnection();
    await connection.beginTransaction();
    
    try {
      // Insert user
      const [userResult] = await connection.execute(
        'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
        [username, hashedPassword, role]
      );
      
      const userID = userResult.insertId;
      
      // Insert profile based on role
      if (role === 'member') {
        const { firstname, lastname, phone, birthday, gender, civilStat, address, employmentStat, companyName, income } = profileData;
        await connection.execute(
          `INSERT INTO member (userID, firstname, lastname, phone, birthday, gender, civilStat, address, employmentStat, companyName, income)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [userID, firstname, lastname, phone, birthday, gender, civilStat, address, employmentStat, companyName, income]
        );
      } else {
        const { firstname, lastname, phone } = profileData;
        await connection.execute(
          'INSERT INTO admin (userID, firstname, lastname, phone) VALUES (?, ?, ?, ?)',
          [userID, firstname, lastname, phone]
        );
      }
      
      await connection.commit();
      connection.release();
      
      return userID;
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  }

  static async findByUsername(username) {
    const query = `
      SELECT u.*, 
             COALESCE(mp.firstname, ap.firstname) as firstname,
             COALESCE(mp.lastname, ap.lastname) as lastname,
             COALESCE(mp.phone, ap.phone) as phone,
             mp.birthday, mp.gender, mp.civilStat, mp.address, 
             mp.employmentStat, mp.companyName, mp.income
      FROM users u
      LEFT JOIN member mp ON u.userID = mp.userID
      LEFT JOIN admin ap ON u.userID = ap.userID
      WHERE u.username = ?
    `;
    const [rows] = await db.execute(query, [username]);
    return rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT u.*, 
             COALESCE(mp.firstname, ap.firstname) as firstname,
             COALESCE(mp.lastname, ap.lastname) as lastname,
             COALESCE(mp.phone, ap.phone) as phone,
             mp.birthday, mp.gender, mp.civilStat, mp.address, 
             mp.employmentStat, mp.companyName, mp.income
      FROM users u
      LEFT JOIN member mp ON u.userID = mp.userID
      LEFT JOIN admin ap ON u.userID = ap.userID
      WHERE u.userID = ?
    `;
    const [rows] = await db.execute(query, [id]);
    return rows[0];
  }

  static async getAll() {
    const query = `
      SELECT u.userID, u.username, u.role,
             COALESCE(mp.firstname, ap.firstname) as firstname,
             COALESCE(mp.lastname, ap.lastname) as lastname,
             COALESCE(mp.phone, ap.phone) as phone,
             mp.birthday, mp.gender, mp.civilStat, mp.address, 
             mp.employmentStat, mp.companyName, mp.income
      FROM users u
      LEFT JOIN member mp ON u.userID = mp.userID
      LEFT JOIN admin ap ON u.userID = ap.userID
      ORDER BY u.created_at DESC
    `;
    const [rows] = await db.execute(query);
    return rows;
  }

  static async getByRole(role) {
    const query = `
      SELECT u.userID, u.username, u.role,
             COALESCE(mp.firstname, ap.firstname) as firstname,
             COALESCE(mp.lastname, ap.lastname) as lastname,
             COALESCE(mp.phone, ap.phone) as phone,
             mp.birthday, mp.gender, mp.civilStat, mp.address, 
             mp.employmentStat, mp.companyName, mp.income
      FROM users u
      LEFT JOIN member mp ON u.userID = mp.userID
      LEFT JOIN admin ap ON u.userID = ap.userID
      WHERE u.role = ?
      ORDER BY u.created_at DESC
    `;
    const [rows] = await db.execute(query, [role]);
    return rows;
  }

  static async update(id, updateData) {
    const connection = await db.getConnection();
    await connection.beginTransaction();
    
    try {
      const { username, password, role, profileData } = updateData;
      
      // Update user table
      const userFields = [];
      const userValues = [];
      
      if (username) {
        userFields.push('username = ?');
        userValues.push(username);
      }
      
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 12);
        userFields.push('password = ?');
        userValues.push(hashedPassword);
      }
      
      if (role) {
        userFields.push('role = ?');
        userValues.push(role);
      }
      
      if (userFields.length > 0) {
        const userQuery = `UPDATE users SET ${userFields.join(', ')} WHERE userID = ?`;
        await connection.execute(userQuery, [...userValues, id]);
      }
      
      // Update profile if provided
      if (profileData) {
        const user = await this.findById(id);
        
        if (user.role === 'member') {
          const profileFields = Object.keys(profileData);
          const profileValues = Object.values(profileData);
          
          if (profileFields.length > 0) {
            const setClause = profileFields.map(field => `${field} = ?`).join(', ');
            const profileQuery = `UPDATE member SET ${setClause} WHERE userID = ?`;
            await connection.execute(profileQuery, [...profileValues, id]);
          }
        } else {
          const { firstname, lastname, phone } = profileData;
          if (firstname || lastname || phone) {
            const adminFields = [];
            const adminValues = [];
            
            if (firstname) {
              adminFields.push('firstname = ?');
              adminValues.push(firstname);
            }
            if (lastname) {
              adminFields.push('lastname = ?');
              adminValues.push(lastname);
            }
            if (phone) {
              adminFields.push('phone = ?');
              adminValues.push(phone);
            }
            
            if (adminFields.length > 0) {
              const adminQuery = `UPDATE admin SET ${adminFields.join(', ')} WHERE userID = ?`;
              await connection.execute(adminQuery, [...adminValues, id]);
            }
          }
        }
      }
      
      await connection.commit();
      connection.release();
      return true;
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  }

  static async delete(id) {
    // Foreign key constraints will handle cascade deletion of accounts
    const query = 'DELETE FROM users WHERE userID = ?';
    const [result] = await db.execute(query, [id]);
    return result.affectedRows > 0;
  }

  static async validatePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = User;