/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('Users', table => {
      table.increments('id').primary();
      table.string('firstName').notNullable();
      table.string('middleName');
      table.string('lastName').notNullable();
      table.string('email').unique().notNullable();
      table.string('password').notNullable();
      table.integer('roleId').unsigned();
      table.datetime('updatedAt');
      table.datetime('createdAt').defaultTo(knex.fn.now());
      table.integer('departmentId').unsigned();
      table.string('otp');
    });
  };
  

  

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('Users');
  };
