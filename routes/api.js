"use strict";
const express = require("express");
const router = express.Router();
const cors = require("cors");

// Middleware
router.use(cors());
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// Controllers
const applicationController = require("../controllers/applicationController");
const reportController = require("../controllers/reportController");
const userController = require("../controllers/userController");
const documentController = require("../controllers/documentController");
const vehicleController = require("../controllers/vehicleController");
const roleController = require("../controllers/roleController");
const authController = require("../controllers/_auth");

// Auth
router.post("/login", authController.login);
router.post("/resetpassword", authController.resetPassword);

// User invitation (password will be set via email link)
router.post("/addUser", userController.createUsers);
router.post("/set-password", userController.setPassword);

// Protect ALL routes *after* this EXCEPT getUsers and roles
router.use((req, res, next) => {
  if (req.path === "/getUsers" || req.path === "/roles") return next();
  authController.checkToken(req, res, next);
});

/* ---------------------- USERS --------------------------- */
router.get("/getUsers", userController.getUsers);
router.delete("/deleteUser", userController.deleteUsers);
router.patch("/updateUser", userController.updateUsers);

/* ---------------------- ROLES --------------------------- */
router.get("/getroles", roleController.getRoles);
router.post("/addroles", roleController.createRoles);
router.delete("/deleteroles", roleController.deleteRoles);
router.patch("/updateroles", roleController.updateRoles);

/* ---------------------- VEHICLES ------------------------ */
router.get("/getVehicles", vehicleController.getVehicles);
router.post("/addVehicles", vehicleController.createVehicles);
router.delete("/deleteVehicles", vehicleController.deleteVehicles);
router.patch("/updateVehicles", vehicleController.updateVehicles);

/* ---------------------- APPLICATIONS -------------------- */
router.get("/applications", applicationController.getApplications);
router.get("/applications/:id", applicationController.getApplicationDetails);
router.post("/applications/:id/review", applicationController.submitReview);

router.post("/addApplications", applicationController.createApplications);
router.delete("/deleteApplications", applicationController.deleteApplications);
router.patch("/updateApplications", applicationController.updateApplications);

router.post("/approveApplication", applicationController.approveApplication);
router.put("/final-approve/:id", applicationController.finalApproveApplication);
router.put("/finalApproveAll", applicationController.finalApproveAll);

router.post("/rejectApplication", applicationController.rejectApplication);
router.post("/applications/:id/renew", applicationController.renewApplication);
router.post("/:id/rejectRenewal", applicationController.rejectRenewal);

/* ---------------------- DOCUMENTS ----------------------- */
router.post(
  "/documents",
  documentController.uploadDocuments,
  documentController.createDocuments
);
router.get("/documents", documentController.getDocuments);
router.delete("/documents", documentController.deleteDocuments);
router.put("/documents", documentController.updateDocuments);

/* ---------------------- REPORTS ------------------------- */
router.get("/generateReport", reportController.generatePDF);

module.exports = router;
