exports.seed = (knex) => {
  return knex("Roles")
    .del()
    .then(() => {
      return knex("Roles").insert([
        { roleName: "PR" },
        { roleName: "FDManager" },
        { roleName: "Managing Director" },
      ]);
    });
};
