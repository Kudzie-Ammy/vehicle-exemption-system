/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('Documents', table => {
      table.increments('id').primary();
      table.integer('applicationId').unsigned();
      table.string('type');
      table.datetime('updatedAt');
      table.datetime('createdAt').defaultTo(knex.fn.now());
      table.string('filePath');
      table.string('fileType');
    });
  };
  
  
  

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('Documents');
  };
