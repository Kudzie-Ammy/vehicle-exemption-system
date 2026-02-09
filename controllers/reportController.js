const fs = require("fs");
const path = require("path");
const jsPDF = require("jspdf");
require("jspdf-autotable");

async function generatePDF(req, res) {
  try {
    const reportsDir = path.join(__dirname, "../reports");
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const applications = await knex("Applications").select();

    const doc = new jsPDF();
    doc.text("Application Reports", 14, 10);
    const tableColumn = [
      "Salutation",
      "First Name",
      "Last Name",
      "Type",
      "Vehicle Reg No.",
      "Cell",
      "Status",
      "Date",
    ];
    const tableRows = applications.map((app) => [
      app.salutation,
      app.firstName,
      app.lastName,
      app.type,
      app.vehicleRegNo,
      app.cell,
      app.status,
      app.updatedAt,
    ]);

    doc.autoTable({ head: [tableColumn], body: tableRows, startY: 20 });

    const pdfPath = path.join(reportsDir, "application_report.pdf");

    doc.save(pdfPath);

    res.status(200).json({
      message: "Report generated successfully!",
      url: `/reports/application_report.pdf`,
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    res
      .status(500)
      .json({ message: "Error generating PDF", error: error.message });
  }
}

module.exports = { generatePDF };
