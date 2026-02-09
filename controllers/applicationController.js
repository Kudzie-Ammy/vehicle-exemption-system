const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const axios = require("axios");

async function sendEmail(emailData) {
  const apiUrl = "http://192.168.1.9:4016/api/forwarder";
  try {
    const response = await axios.post(apiUrl, emailData);
    return response.data.success;
  } catch (error) {
    console.error("Email sending error:", error);
    throw new Error("Failed to send email");
  }
}

async function createApplications(req, res) {
  try {
    const {
      userId,
      vehicleRegNo,
      salutation,
      firstName,
      lastName,
      address,
      cell,
      nationalId,
      type,
    } = req.body;

    if (
      !userId ||
      !vehicleRegNo ||
      !salutation ||
      !firstName ||
      !lastName ||
      !address ||
      !cell ||
      !nationalId ||
      !type
    ) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const duplicate = await knex("Applications")
      .join("Vehicles", "Applications.vehicleId", "Vehicles.id")
      .where("Vehicles.vehicleRegNo", vehicleRegNo)
      .andWhere("Applications.nationalId", nationalId)
      .andWhereNot("Applications.status", "Rejected")
      .first();

    if (duplicate) {
      return res.status(400).json({
        message:
          "Duplicate application found. Please wait for review or renewal before reapplying.",
      });
    }

    let vehicle = await knex("Vehicles").where({ vehicleRegNo }).first();
    if (!vehicle) {
      const [newVehicle] = await knex("Vehicles")
        .insert({ vehicleRegNo, userId })
        .returning(["id"]);
      vehicle = newVehicle;
    }

    const [application] = await knex("Applications")
      .insert({
        userId,
        vehicleId: vehicle.id,
        status: "Pending",
        salutation,
        firstName,
        lastName,
        address,
        cell,
        nationalId,
        createdAt: new Date(),
      })
      .returning(["id"]);

    res.status(201).json({
      message: "Application created successfully.",
      applicationId: application.id,
    });
  } catch (err) {
    console.error("❌ Error creating application:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function getApplications(req, res) {
  try {
    console.log("[v0] Fetching applications...");

    const applicationsWithDocs = await knex("Applications")
      .leftJoin("Vehicles", "Applications.vehicleId", "Vehicles.id")
      .leftJoin("Documents", "Applications.id", "Documents.applicationId")
      .select(
        "Applications.id",
        "Applications.userId",
        "Applications.salutation",
        "Applications.firstName",
        "Applications.lastName",
        "Applications.address",
        "Applications.cell",
        "Applications.nationalId",
        // "Applications.type",   <-- REMOVE THIS!
        "Applications.status",
        "Applications.notes",
        "Applications.rejectedBy",
        "Applications.approvedBy",
        "Applications.finalApprovedBy",
        "Applications.finalApprovedAt",
        "Applications.createdAt",
        "Applications.updatedAt",
        "Applications.expiryDate",
        "Vehicles.vehicleRegNo",
        "Documents.type as documentType",
        "Documents.filePath as documentUrl"
      );

    // Deduplicate
    const applicationsMap = new Map();

    applicationsWithDocs.forEach((row) => {
      if (!applicationsMap.has(row.id)) {
        applicationsMap.set(row.id, {
          ...row,
          documentTypes: row.documentType ? [row.documentType] : [],
          documentUrls: row.documentUrl ? [row.documentUrl] : [],
        });
      } else {
        const existing = applicationsMap.get(row.id);

        if (
          row.documentType &&
          !existing.documentTypes.includes(row.documentType)
        ) {
          existing.documentTypes.push(row.documentType);
        }
        if (
          row.documentUrl &&
          !existing.documentUrls.includes(row.documentUrl)
        ) {
          existing.documentUrls.push(row.documentUrl);
        }
      }
    });

    const applications = Array.from(applicationsMap.values()).map((app) => ({
      ...app,
      type: app.documentTypes[0] || null, // <-- put type here for frontend
      documentType: app.documentTypes.join(", "),
      documentUrl: app.documentUrls.join(", "),
    }));

    console.log("[v0] Applications fetched:", applications.length);

    return res.json({ status: true, data: applications });
  } catch (err) {
    console.error("[v0] getApplications error:", err.message);
    console.error("[v0] Full error:", err);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: err.message,
    });
  }
}

async function deleteApplications(req, res) {
  try {
    const { applicationId } = req.params;

    const deletedCount = await knex("Applications")
      .where({ applicationId })
      .del();

    if (deletedCount) {
      return res
        .status(200)
        .json({ message: `Application ${applicationId} deleted successfully` });
    } else {
      return res.status(404).json({ message: "Application not found" });
    }
  } catch (ex) {
    console.error(ex);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function updateApplications(req, res) {
  const { id, notes, status, userId } = req.body;

  const existingApplication = await knex("Applications").where({ id }).first();

  if (!existingApplication) {
    return res.status(404).json({ message: "Application not found." });
  }

  const updatedCount = await knex("Applications")
    .where({ id })
    .update({
      notes,
      status,
      updatedBy: userId || null,
      updatedAt: new Date().toISOString(),
    });

  if (updatedCount) {
    return res
      .status(200)
      .json({ message: "Application updated successfully" });
  } else {
    return res.status(404).json({ message: "Application not found" });
  }
}

// Role 2 - Approve Application
async function approveApplication(req, res) {
  const { id, userId } = req.body;

  if (!id || !userId) {
    return res
      .status(400)
      .json({ message: "Missing required fields: id or userId" });
  }

  try {
    const user = await knex("Users").where({ id: userId }).first();
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const existingApplication = await knex("Applications")
      .where({ id })
      .first();

    if (!existingApplication) {
      return res.status(404).json({ message: "Application not found." });
    }

    const approvedAt = new Date();
    const expiryDate = new Date(approvedAt);
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    await knex("Applications").where({ id }).update({
      status: "Approved",
      approvedBy: user.email,
      approvedAt,
      expiryDate,
      updatedBy: userId,
      updatedAt: new Date(),
    });

    return res
      .status(200)
      .json({ message: "Application approved successfully." });
  } catch (ex) {
    console.error(ex);
    return res.status(500).json({ message: "Internal server error." });
  }
}

// Role 3 - Final Approval
async function finalApproveApplication(req, res) {
  const { id } = req.params;
  const { userId } = req.body;

  try {
    const user = await knex("Users").where({ id: userId }).first();
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const existingApplication = await knex("Applications")
      .where({ id })
      .first();

    if (!existingApplication) {
      return res.status(404).json({ message: "Application not found." });
    }

    const approvedAt = new Date();
    const finalApprovedAt = new Date();
    const expiryDate = new Date(finalApprovedAt);
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    // Increment renewal count if it's a renewal
    const renewalCount = existingApplication.renewalCount || 0;

    await knex("Applications")
      .where({ id })
      .update({
        status: "finalApproved",
        approvedAt,
        finalApprovedAt,
        expiryDate,
        approvedBy: user.email,
        finalApprovedBy: user.email,
        updatedBy: userId,
        updatedAt: new Date(),
        renewalCount: existingApplication.isRenewal
          ? renewalCount + 1
          : renewalCount,
        isRenewal: false,
      });

    return res
      .status(200)
      .json({ message: "Application finally approved successfully." });
  } catch (ex) {
    console.error(ex);
    return res.status(500).json({ message: "Internal server error." });
  }
}

async function finalApproveAll(req, res) {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: "Missing userId." });
    }

    const user = await knex("Users").where({ id: userId }).first();
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const applicationsToApprove = await knex("Applications")
      .where({ status: "Approved" })
      .whereNull("finalApprovedBy");

    if (applicationsToApprove.length === 0) {
      return res.status(400).json({ message: "No applications to approve." });
    }

    const now = new Date();
    const expiryDate = new Date(now);
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    for (const application of applicationsToApprove) {
      await knex("Applications").where({ id: application.id }).update({
        status: "finalApproved",
        finalApprovedBy: user.email,
        finalApprovedAt: now,
        expiryDate,
        updatedBy: userId,
        updatedAt: new Date(),
      });
    }

    return res.status(200).json({
      status: true,
      message: "All applications have been finally approved.",
    });
  } catch (error) {
    console.error("Error in final approval:", error);
    return res
      .status(500)
      .json({ message: "Failed to approve all applications." });
  }
}

async function rejectApplication(req, res) {
  const { id, userId, reason } = req.body;

  try {
    const user = await knex("Users").where({ id: userId }).first();
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const existingApplication = await knex("Applications")
      .where({ id })
      .first();

    if (!existingApplication) {
      return res.status(404).json({ message: "Application not found." });
    }

    const rejectedAt = new Date();
    await knex("Applications").where({ id }).update({
      status: "Rejected",
      rejectedAt,
      rejectedBy: user.email,
      notes: reason,
      updatedBy: userId,
      updatedAt: new Date(),
    });

    return res.status(200).json({
      message: "Application rejected successfully.",
      rejectedAt,
    });
  } catch (ex) {
    console.error(ex);
    return res.status(500).json({ message: "Internal server error." });
  }
}

async function rejectRenewal(req, res) {
  const { userId } = req.body;
  const { id } = req.params;

  try {
    const user = await knex("Users").where({ id: userId }).first();
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const renewalApplication = await knex("Applications").where({ id }).first();
    if (!renewalApplication) {
      return res.status(404).json({ message: "Application not found." });
    }

    if (!renewalApplication.isRenewal) {
      return res.status(400).json({ message: "Not a renewal application." });
    }

    const rejectedAt = new Date();
    await knex("Applications").where({ id }).update({
      status: "Rejected",
      rejectedAt,
      rejectedBy: user.email,
      updatedBy: userId,
      updatedAt: new Date(),
    });

    return res.status(200).json({
      status: true,
      message: "Renewal rejected successfully.",
      rejectedAt,
    });
  } catch (error) {
    console.error("Error rejecting renewal:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
}

async function renewApplication(req, res) {
  const { id } = req.params;
  const { userId } = req.body;

  try {
    const existingApplication = await knex("Applications")
      .where({ id })
      .first();

    if (!existingApplication) {
      return res
        .status(404)
        .json({ status: false, message: "Application not found." });
    }

    await knex("Applications")
      .where({ id })
      .update({
        status: "Pending",
        rejectedAt: null,
        expiryDate: null,
        finalApprovedBy: null,
        isRenewal: true,
        updatedBy: userId || null,
        updatedAt: new Date(),
      });

    return res
      .status(200)
      .json({ status: true, message: "Application renewed successfully." });
  } catch (error) {
    console.error("Renew error:", error);
    return res
      .status(500)
      .json({ status: false, message: "Server error during renewal." });
  }
}

async function getApplicationDetails(req, res) {
  try {
    const { id } = req.params;

    console.log("Fetching application details for ID:", id);

    const application = await knex("Applications")
      .select(
        "Applications.id",
        "Applications.userId",
        "Applications.salutation",
        "Applications.firstName",
        "Applications.lastName",
        "Applications.address",
        "Applications.cell",
        "Applications.nationalId",
        "Applications.status",
        "Applications.notes",
        "Applications.rejectedBy",
        "Applications.approvedBy",
        "Applications.finalApprovedBy",
        "Applications.createdAt",
        "Applications.updatedAt",
        "Applications.approvedAt",
        "Applications.rejectedAt",
        "Applications.expiryDate",
        "Applications.finalApprovedAt",
        "Applications.updatedBy",
        "Applications.isRenewal",
        "Applications.renewalCount",
        "Vehicles.vehicleRegNo",
        knex.raw("STRING_AGG(Documents.filePath, ',') AS documentUrls"),
        knex.raw("STRING_AGG(Documents.type, ',') AS documentTypes"),
        knex.raw("MAX(Documents.type) AS type") // 🔹 main type (e.g. War Veteran or Senior Citizen)
      )
      .innerJoin("Vehicles", "Applications.vehicleId", "Vehicles.id")
      .leftJoin("Documents", "Applications.id", "Documents.applicationId")
      .where("Applications.id", id)
      .groupBy(
        "Applications.id",
        "Applications.userId",
        "Applications.salutation",
        "Applications.firstName",
        "Applications.lastName",
        "Applications.address",
        "Applications.cell",
        "Applications.nationalId",
        "Applications.status",
        "Applications.notes",
        "Applications.rejectedBy",
        "Applications.approvedBy",
        "Applications.finalApprovedBy",
        "Applications.createdAt",
        "Applications.updatedAt",
        "Applications.approvedAt",
        "Applications.rejectedAt",
        "Applications.expiryDate",
        "Applications.finalApprovedAt",
        "Applications.updatedBy",
        "Applications.isRenewal",
        "Applications.renewalCount",
        "Vehicles.vehicleRegNo"
      )
      .first();

    console.log("✅ Application details fetched:", application);

    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    res.json(application);
  } catch (error) {
    console.error("❌ Error fetching application details:", error);
    res.status(500).json({ error: "Failed to fetch application details" });
  }
}

// ✅ Submit a rejection review (Admin or Approver adds reason)
async function submitReview(req, res) {
  const { id } = req.params;
  const { userId, reason } = req.body;

  try {
    if (!userId || !reason) {
      return res
        .status(400)
        .json({ message: "Missing required fields: userId or reason." });
    }

    const user = await knex("Users").where({ id: userId }).first();
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const existing = await knex("Applications").where({ id }).first();
    if (!existing) {
      return res.status(404).json({ message: "Application not found." });
    }

    const rejectedAt = new Date();

    await knex("Applications").where({ id }).update({
      status: "Rejected",
      notes: reason,
      rejectedBy: user.email,
      rejectedAt,
      updatedBy: userId,
      updatedAt: new Date(),
    });

    return res.status(200).json({
      status: true,
      message: "Rejection reason submitted successfully.",
      data: {
        id,
        reason,
        rejectedBy: user.email,
        rejectedAt,
      },
    });
  } catch (error) {
    console.error("Error submitting review:", error);
    return res.status(500).json({ message: "Failed to submit review." });
  }
}

module.exports = {
  createApplications,
  getApplications,
  getApplicationDetails,
  deleteApplications,
  updateApplications,
  approveApplication,
  finalApproveApplication,
  finalApproveAll,
  rejectApplication,
  renewApplication,
  rejectRenewal,
  submitReview,
};
