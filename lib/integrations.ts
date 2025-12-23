/**
 * Integrations Data Access Layer
 * Handles database operations for payment gateways and other integrations
 * Includes encryption for sensitive API keys
 */

import { query, queryOne } from './infrastructure/database/pool';
import type { Integration, IntegrationType } from './types/integrations';
import crypto from 'crypto';

// Encryption helpers
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key || key.length < 32) {
    throw new Error('ENCRYPTION_KEY must be at least 32 characters');
  }
  return Buffer.from(key.slice(0, 32), 'utf-8');
}

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  // Format: iv:authTag:encrypted
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

export function decrypt(encryptedText: string): string {
  const parts = encryptedText.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted format');
  }
  
  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];
  
  const decipher = crypto.createDecipheriv(ALGORITHM, getEncryptionKey(), iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

// Convert DB row to Integration object
function dbToIntegration(row: any): Integration {
  return {
    id: row.id,
    type: row.type,
    provider: row.provider,
    name: row.name,
    enabled: row.enabled,
    isDefault: row.is_default,
    configPublic: row.config_public || {},
    lastTestAt: row.last_test_at,
    lastTestSuccess: row.last_test_success,
    lastTestError: row.last_test_error,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Get all integrations of a specific type
 */
export async function getIntegrations(type?: IntegrationType): Promise<Integration[]> {
  try {
    const sql = type
      ? 'SELECT * FROM integrations WHERE type = $1 ORDER BY name'
      : 'SELECT * FROM integrations ORDER BY type, name';
    
    const rows = await query(sql, type ? [type] : []);
    return rows.map(dbToIntegration);
  } catch (error) {
    console.error('Error getting integrations:', error);
    return [];
  }
}

/**
 * Get a specific integration by ID
 */
export async function getIntegration(id: string): Promise<Integration | null> {
  try {
    const row = await queryOne('SELECT * FROM integrations WHERE id = $1', [id]);
    return row ? dbToIntegration(row) : null;
  } catch (error) {
    console.error('Error getting integration:', error);
    return null;
  }
}

/**
 * Get integration by type and provider
 */
export async function getIntegrationByProvider(
  type: IntegrationType,
  provider: string
): Promise<Integration | null> {
  try {
    const row = await queryOne(
      'SELECT * FROM integrations WHERE type = $1 AND provider = $2',
      [type, provider]
    );
    return row ? dbToIntegration(row) : null;
  } catch (error) {
    console.error('Error getting integration by provider:', error);
    return null;
  }
}

/**
 * Get the default enabled integration for a type
 */
export async function getDefaultIntegration(type: IntegrationType): Promise<Integration | null> {
  try {
    const row = await queryOne(
      'SELECT * FROM integrations WHERE type = $1 AND enabled = TRUE AND is_default = TRUE LIMIT 1',
      [type]
    );
    
    if (!row) {
      // Fallback to any enabled integration
      const fallback = await queryOne(
        'SELECT * FROM integrations WHERE type = $1 AND enabled = TRUE LIMIT 1',
        [type]
      );
      return fallback ? dbToIntegration(fallback) : null;
    }
    
    return dbToIntegration(row);
  } catch (error) {
    console.error('Error getting default integration:', error);
    return null;
  }
}

/**
 * Get decrypted credentials for an integration
 */
export async function getIntegrationCredentials(id: string): Promise<Record<string, any> | null> {
  try {
    const row = await queryOne(
      'SELECT config_encrypted FROM integrations WHERE id = $1',
      [id]
    );
    
    if (!row?.config_encrypted) {
      return null;
    }
    
    const decrypted = decrypt(row.config_encrypted);
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('Error getting integration credentials:', error);
    return null;
  }
}

/**
 * Update integration configuration
 */
export async function updateIntegration(
  id: string,
  updates: {
    enabled?: boolean;
    isDefault?: boolean;
    credentials?: Record<string, any>;
    configPublic?: Record<string, any>;
  }
): Promise<Integration | null> {
  try {
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.enabled !== undefined) {
      setClauses.push(`enabled = $${paramIndex++}`);
      values.push(updates.enabled);
    }

    if (updates.isDefault !== undefined) {
      setClauses.push(`is_default = $${paramIndex++}`);
      values.push(updates.isDefault);
      
      // If setting as default, unset other defaults of same type
      if (updates.isDefault) {
        const integration = await getIntegration(id);
        if (integration) {
          await query(
            'UPDATE integrations SET is_default = FALSE WHERE type = $1 AND id != $2',
            [integration.type, id]
          );
        }
      }
    }

    if (updates.credentials) {
      const encrypted = encrypt(JSON.stringify(updates.credentials));
      setClauses.push(`config_encrypted = $${paramIndex++}`);
      values.push(encrypted);
    }

    if (updates.configPublic) {
      setClauses.push(`config_public = $${paramIndex++}`);
      values.push(JSON.stringify(updates.configPublic));
    }

    if (setClauses.length === 0) {
      return getIntegration(id);
    }

    values.push(id);
    const row = await queryOne(
      `UPDATE integrations SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    return row ? dbToIntegration(row) : null;
  } catch (error) {
    console.error('Error updating integration:', error);
    throw error;
  }
}

/**
 * Record test result for an integration
 */
export async function recordTestResult(
  id: string,
  success: boolean,
  error?: string
): Promise<void> {
  try {
    await query(
      `UPDATE integrations 
       SET last_test_at = CURRENT_TIMESTAMP, 
           last_test_success = $1, 
           last_test_error = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [success, error || null, id]
    );
  } catch (err) {
    console.error('Error recording test result:', err);
  }
}

/**
 * Check if any payment gateway is configured
 */
export async function hasPaymentGateway(): Promise<boolean> {
  try {
    const row = await queryOne(
      "SELECT 1 FROM integrations WHERE type = 'payment_gateway' AND enabled = TRUE LIMIT 1"
    );
    return !!row;
  } catch (error) {
    console.error('Error checking payment gateway:', error);
    return false;
  }
}
