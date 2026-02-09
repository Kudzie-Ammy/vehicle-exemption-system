/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('Vehicles', table => {
      table.increments('id').primary();
      table.integer('userId').unsigned();
      table.string('vehicleRegNo').notNullable();
      table.datetime('updatedAt');
      table.datetime('createdAt').defaultTo(knex.fn.now());
    });
  };
  

  

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('Vehicles');
  };
