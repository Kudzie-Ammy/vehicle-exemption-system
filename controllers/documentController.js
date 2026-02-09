const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const uploadDocuments = multer({ storage }).array("files", 10);

const upload = multer({ storage });

async function createDocuments(req, res) {
  try {
    console.log("🔥 Incoming Document Upload Request");
    console.log("📁 Uploaded Files:", req.files);
    console.log("📝 Request Body:", req.body);

    const {
      vehicleRegNo,
      type,
      salutation,
      firstName,
      lastName,
      address,
      cell,
      nationalId,
    } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(400).json({ message: "User ID is missing" });
    }

    if (!vehicleRegNo) {
      return res
        .status(400)
        .json({ message: "Vehicle registration number is required." });
    }

    if (!type) {
      return res.status(400).json({ message: "Document type is required." });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No documents were uploaded." });
    }

    const trx = await knex.transaction();

    try {
      // Check or insert vehicle
      let vehicle = await trx("Vehicles").where({ vehicleRegNo }).first();

      if (!vehicle) {
        const [newVehicle] = await trx("Vehicles")
          .insert({ vehicleRegNo, userId })
          .returning(["id"]);
        vehicle = newVehicle;
      }

      if (!vehicle || !vehicle.id) {
        throw new Error("Vehicle record not found or could not be created.");
      }

      // Insert application
      const [application] = await trx("Applications")
        .insert({
          userId,
          vehicleId: vehicle.id,
          salutation,
          firstName,
          lastName,
          address,
          cell,
          nationalId,
          status: "Pending",
          createdAt: new Date(),
        })
        .returning(["id"]);

      if (!application || !application.id) {
        throw new Error("Application creation failed.");
      }

      // Insert uploaded documents
      for (const file of req.files) {
        const fileExtension = path.extname(file.originalname).substring(1);
        await trx("Documents").insert({
          applicationId: application.id,
          type,
          fileType: fileExtension,
          filePath: file.path,
          createdAt: new Date(),
        });
      }

      await trx.commit();

      res.status(201).json({
        message: "Application and documents uploaded successfully.",
        applicationId: application.id,
        uploadedCount: req.files.length,
      });
    } catch (error) {
      await trx.rollback();
      console.error("❌ Transaction failed:", error);
      return res.status(500).json({
        message: "Internal transaction error",
        error: error.message,
      });
    }
  } catch (err) {
    console.error("💥 Unexpected error in createDocuments:", err);
    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
}

async function getDocuments(req, res) {
  const documents = await knex("Documents").select();

  res.json(documents);
}

async function deleteDocuments(req, res) {
  const { id } = req.body;

  const deletedCount = await knex("Documents").where({ id: id }).del();

  if (deletedCount) {
    return res
      .status(200)
      .json({ message: `Document ${id} deleted successfully` });
  } else {
    return res.status(404).json({ message: "Document not found" });
  }
}

async function updateDocuments(req, res) {
  const { id, type } = req.body;

  const existingDocument = await knex("Documents").where({ id }).first();
  if (!existingDocument) {
    return res.status(404).json({ message: "Document not found." });
  }

  const updatedCount = await knex("Documents").where({ id: id }).update({
    type,
  });

  if (updatedCount) {
    return res
      .status(200)
      .json({ message: `Document ${id} updated successfully` });
  } else {
    return res.status(404).json({ message: "Document not found" });
  }
}

module.exports = {
  createDocuments,
  uploadDocuments,
  getDocuments,
  deleteDocuments,
  updateDocuments,
};
