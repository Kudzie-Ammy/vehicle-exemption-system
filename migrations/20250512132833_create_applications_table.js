/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('Applications', table => {
      table.increments('id').primary();
      table.integer('vehicleId').unsigned();
      table.text('notes');
      table.string('status');
      table.datetime('updatedAt');
      table.string('updatedBy');
      table.datetime('createdAt').defaultTo(knex.fn.now());
      table.string('salutation');
      table.string('firstName');
      table.string('lastName');
      table.string('address');
      table.string('cell');
      table.integer('userId').unsigned();
      table.datetime('approvedAt');
      table.datetime('rejectedAt');
      table.datetime('expiryDate');
      table.string('approvedBy');
      table.datetime('finalApprovedAt');
      table.string('finalApprovedBy');
      table.integer('renewalCount').defaultTo(0);
    });
  };
  

  

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('Applications');
  };
