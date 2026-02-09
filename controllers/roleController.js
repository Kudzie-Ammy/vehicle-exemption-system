/* ---------------------- CREATE ROLE ---------------------- */
async function createRoles(req, res) {
  try {
    const { roleName } = req.body;

    await knex("Roles").insert({
      roleName: roleName,
      createdAt: new Date(),
    });

    return res
      .status(200)
      .json({ status: true, message: "Role added successfully" });
  } catch (ex) {
    console.error("createRoles error:", ex);
    return res
      .status(500)
      .json({ status: false, message: "Internal server error" });
  }
}

/* ---------------------- GET ROLES ---------------------- */
async function getRoles(req, res) {
  try {
    const roles = await knex("Roles").select("id", "roleName");

    return res.status(200).json({ status: true, data: roles });
  } catch (ex) {
    console.error("getRoles error:", ex);
    return res
      .status(500)
      .json({ status: false, message: "Internal server error" });
  }
}

/* ---------------------- DELETE ROLE ---------------------- */
async function deleteRoles(req, res) {
  try {
    const { id } = req.body;

    const deletedCount = await knex("Roles").where({ id }).del();

    if (deletedCount) {
      return res
        .status(200)
        .json({ status: true, message: `Role ${id} deleted successfully` });
    } else {
      return res.status(404).json({ status: false, message: "Role not found" });
    }
  } catch (ex) {
    console.error("deleteRoles error:", ex);
    return res
      .status(500)
      .json({ status: false, message: "Internal server error" });
  }
}

/* ---------------------- UPDATE ROLE ---------------------- */
async function updateRoles(req, res) {
  try {
    const { id, roleName } = req.body;

    const updatedCount = await knex("Roles").where({ id }).update({
      roleName,
      updatedAt: new Date(),
    });

    if (updatedCount) {
      return res
        .status(200)
        .json({ status: true, message: `Role ${id} updated successfully` });
    } else {
      return res.status(404).json({ status: false, message: "Role not found" });
    }
  } catch (ex) {
    console.error("updateRoles error:", ex);
    return res
      .status(500)
      .json({ status: false, message: "Internal server error" });
  }
}

module.exports = {
  createRoles,
  getRoles,
  deleteRoles,
  updateRoles,
};
