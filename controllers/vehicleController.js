const { Vehicles } = require("express");

async function createVehicles(req, res) {
  try {
    const { regNumber, userId } = req.body;
    const createdAt = new Date().toISOString();

    const existingVehicle = await knex("Vehicles")
      .where({ regNumber, userId })
      .first();

    if (existingVehicle) {
      return res.status(409).json({ message: "Vehicle already exists" });
    }

    await knex("Vehicles").insert({
      regNumber: regNumber,
      userId: userId,
      createdAt,
    });

    return res.status(200).json({ message: "vehicle added successfully" });
  } catch (ex) {
    console.error("Error adding vehicle", ex);
    return res.status(500).json({ message: "internal server error" });
  }
}

async function getVehicles(req, res) {
  try {
    const vehicles = await knex("Vehicles").select();
    return res.json(vehicles);
  } catch (ex) {
    console.error(ex);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function deleteVehicles(req, res) {
  const { id } = req.body;

  try {
    const deletedCount = await knex("Vehicles").where({ id }).del();

    if (deletedCount) {
      return res.status(200).json({ message: `${id} deleted successfully` });
    } else {
      return res.status(404).json({ message: "Vehicle not found" });
    }
  } catch (ex) {
    console.error(ex);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function updateVehicles(req, res) {
  const { id, regNumber } = req.body;

  try {
    const updatedCount = await knex("Vehicles").where({ id }).update({
      regNumber,
    });

    if (updatedCount) {
      return res.status(200).json({ message: `${id} updated successfully` });
    } else {
      return res.status(404).json({ message: "Vehicle not found" });
    }
  } catch (ex) {
    console.error(ex);
    return res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
  createVehicles,
  getVehicles,
  deleteVehicles,
  updateVehicles,
};
