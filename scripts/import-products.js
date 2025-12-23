const { Pool } = require('pg');
const https = require('https');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function fetchExternalData() {
  return new Promise((resolve, reject) => {
    const url = 'https://api2.olaclick.app/ms-products/public/companies/43da3645-d217-4757-9dd4-4633fe4ae976/categories';
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

async function importData() {
  const client = await pool.connect();
  
  try {
    console.log('Fetching data from external API...');
    const externalData = await fetchExternalData();
    
    if (!externalData.data || !Array.isArray(externalData.data)) {
      throw new Error('Invalid data structure from API');
    }
    
    console.log(`Found ${externalData.data.length} categories to import`);
    
    // Start transaction
    await client.query('BEGIN');
    
    // Clear existing data
    console.log('Clearing existing data...');
    await client.query('DELETE FROM product_modifier_categories');
    await client.query('DELETE FROM modifiers');
    await client.query('DELETE FROM modifier_categories');
    await client.query('DELETE FROM product_images');
    await client.query('DELETE FROM product_variants');
    await client.query('DELETE FROM products');
    await client.query('DELETE FROM categories');
    
    // Import categories and products
    for (const category of externalData.data) {
      console.log(`Importing category: ${category.name}`);
      
      // Insert category
      const categoryResult = await client.query(
        'INSERT INTO categories (id, name, position) VALUES ($1, $2, $3) RETURNING id',
        [category.id, category.name, category.position]
      );
      const categoryId = categoryResult.rows[0].id;
      
      // Import products for this category
      if (category.products && Array.isArray(category.products)) {
        for (const product of category.products) {
          console.log(`  Importing product: ${product.name}`);
          
          // Insert product
          const productResult = await client.query(`
            INSERT INTO products (
              id, category_id, name, description, position, visible, 
              kitchen_id, stock_enabled, messages_for_customers
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
            [
              product.id,
              categoryId,
              product.name,
              product.description,
              product.position,
              product.visible,
              product.kitchen_id,
              product.stock_enabled,
              product.messages_for_customers
            ]
          );
          const productId = productResult.rows[0].id;
          
          // Import product images
          if (product.images && Array.isArray(product.images)) {
            for (const image of product.images) {
              await client.query(`
                INSERT INTO product_images (id, product_id, image, image_url, position)
                VALUES ($1, $2, $3, $4, $5)`,
                [image.id, productId, image.image, image.image_url, image.position]
              );
            }
          }
          
          // Import product variants
          if (product.product_variants && Array.isArray(product.product_variants)) {
            for (const variant of product.product_variants) {
              await client.query(`
                INSERT INTO product_variants (
                  id, product_id, name, cost, price, original_price,
                  packaging_price, position, sku, stock_threshold, stock
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
                [
                  variant.id,
                  productId,
                  variant.name,
                  variant.cost,
                  variant.price,
                  variant.original_price,
                  variant.packaging_price,
                  variant.position,
                  variant.sku,
                  variant.stock_threshold,
                  variant.stock
                ]
              );
            }
          }
          
          // Import modifier categories and modifiers
          if (product.modifier_categories && Array.isArray(product.modifier_categories)) {
            for (const modCategory of product.modifier_categories) {
              console.log(`    Importing modifier category: ${modCategory.name}`);
              
              // Insert modifier category (if not exists)
              let modCategoryId;
              const existingModCategory = await client.query(
                'SELECT id FROM modifier_categories WHERE id = $1',
                [modCategory.id]
              );
              
              if (existingModCategory.rows.length === 0) {
                const modCategoryResult = await client.query(`
                  INSERT INTO modifier_categories (
                    id, name, min_modifiers, max_modifiers, company_id,
                    type, is_active, required, position
                  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
                  [
                    modCategory.id,
                    modCategory.name,
                    modCategory.min_modifiers,
                    modCategory.max_modifiers,
                    modCategory.company_id,
                    modCategory.type,
                    modCategory.is_active,
                    modCategory.required,
                    modCategory.position
                  ]
                );
                modCategoryId = modCategoryResult.rows[0].id;
              } else {
                modCategoryId = existingModCategory.rows[0].id;
              }
              
              // Link product to modifier category
              await client.query(`
                INSERT INTO product_modifier_categories (product_id, modifier_category_id, position)
                VALUES ($1, $2, $3) ON CONFLICT (product_id, modifier_category_id) DO NOTHING`,
                [productId, modCategoryId, modCategory.product_modifier_category_position]
              );
              
              // Import modifiers
              if (modCategory.modifiers && Array.isArray(modCategory.modifiers)) {
                for (const modifier of modCategory.modifiers) {
                  await client.query(`
                    INSERT INTO modifiers (
                      id, modifier_category_id, name, cost, price, original_price,
                      sku, position, max_limit, visible
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                    ON CONFLICT (id) DO NOTHING`,
                    [
                      modifier.id,
                      modCategoryId,
                      modifier.name,
                      modifier.cost,
                      modifier.price,
                      modifier.original_price,
                      modifier.sku,
                      modifier.position,
                      modifier.max_limit,
                      modifier.visible
                    ]
                  );
                }
              }
            }
          }
        }
      }
    }
    
    // Commit transaction
    await client.query('COMMIT');
    console.log('Data import completed successfully!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error importing data:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run the import
if (require.main === module) {
  importData()
    .then(() => {
      console.log('Import finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Import failed:', error);
      process.exit(1);
    });
}

module.exports = { importData };
