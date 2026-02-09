/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('Roles', table => {
      table.increments('id').primary();
      table.string('roleName').notNullable();
      table.datetime('updatedAt');
      table.string('updatedBy');
      table.datetime('createdAt').defaultTo(knex.fn.now());
      table.integer('departmentId').unsigned();
    });
  };
  

  

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('Roles');
  };
