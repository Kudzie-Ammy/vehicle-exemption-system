exports.seed = (knex) => {
  return knex("Departments")
    .del()
    .then(() => {
      return knex("Departments").insert([
        { departmentName: "PR" },
        { departmentName: "FDManager" },
        { departmentName: "Managing Director" },
      ]);
    });
};
