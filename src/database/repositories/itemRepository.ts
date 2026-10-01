import { queryAll, queryFirst, executeSql } from '../db';
import { Item } from '../../types';

export const itemRepository = {
  async getByOrg(orgId: string): Promise<Item[]> {
    const rows = await queryAll<any>(
      'SELECT * FROM items WHERE organization_id = ? AND is_active = 1 ORDER BY name ASC',
      [orgId]
    );
    return rows.map(mapRowToItem);
  },

  async getById(id: string): Promise<Item | null> {
    const row = await queryFirst<any>('SELECT * FROM items WHERE id = ?', [id]);
    return row ? mapRowToItem(row) : null;
  },

  async search(orgId: string, query: string): Promise<Item[]> {
    const term = `%${query.trim()}%`;
    const rows = await queryAll<any>(
      `SELECT * FROM items 
       WHERE organization_id = ? AND is_active = 1
       AND (name LIKE ? OR sku LIKE ? OR description LIKE ?)
       ORDER BY name ASC LIMIT 20`,
      [orgId, term, term, term]
    );
    return rows.map(mapRowToItem);
  },

  async create(item: Omit<Item, 'createdAt' | 'updatedAt'>): Promise<Item> {
    const nowIso = new Date().toISOString();
    await executeSql(
      `INSERT INTO items (
        id, organization_id, name, sku, description, unit, rate, tax_rate, category, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        item.id,
        item.organizationId,
        item.name,
        item.sku || null,
        item.description || null,
        item.unit || 'pcs',
        item.rate ?? 0.0,
        item.taxRate ?? 0.0,
        item.category || 'SERVICE',
        item.isActive !== false ? 1 : 0,
        nowIso,
        nowIso,
      ]
    );
    return (await this.getById(item.id))!;
  },

  async update(id: string, updates: Partial<Item>): Promise<void> {
    const nowIso = new Date().toISOString();
    const fields: string[] = ['updated_at = ?'];
    const values: any[] = [nowIso];

    if (updates.name !== undefined) { fields.push('name = ?'); values.push(updates.name); }
    if (updates.sku !== undefined) { fields.push('sku = ?'); values.push(updates.sku); }
    if (updates.description !== undefined) { fields.push('description = ?'); values.push(updates.description); }
    if (updates.unit !== undefined) { fields.push('unit = ?'); values.push(updates.unit); }
    if (updates.rate !== undefined) { fields.push('rate = ?'); values.push(updates.rate); }
    if (updates.taxRate !== undefined) { fields.push('tax_rate = ?'); values.push(updates.taxRate); }
    if (updates.category !== undefined) { fields.push('category = ?'); values.push(updates.category); }
    if (updates.isActive !== undefined) { fields.push('is_active = ?'); values.push(updates.isActive ? 1 : 0); }

    values.push(id);
    await executeSql(`UPDATE items SET ${fields.join(', ')} WHERE id = ?`, values);
  },

  async delete(id: string): Promise<void> {
    // Soft delete
    await executeSql('UPDATE items SET is_active = 0 WHERE id = ?', [id]);
  },
};

function mapRowToItem(row: any): Item {
  return {
    id: row.id,
    organizationId: row.organization_id,
    name: row.name,
    sku: row.sku,
    description: row.description,
    unit: row.unit || 'pcs',
    rate: Number(row.rate),
    taxRate: Number(row.tax_rate),
    category: row.category,
    isActive: Boolean(row.is_active),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
