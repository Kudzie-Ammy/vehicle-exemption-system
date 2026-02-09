import React, { useEffect, useState } from "react";
import {
  Table,
  Typography,
  Row,
  Col,
  Button,
  Input,
  Select,
  DatePicker,
  message,
} from "antd";
import axios from "axios";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import moment from "moment";

const { RangePicker } = DatePicker;
const { Option } = Select;

const Reports = () => {
  const [applications, setApplications] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [searchText, setSearchText] = useState("");
  const [expiryMonthYear, setExpiryMonthYear] = useState("");

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/api/applications"
      );
      if (response.data.status) {
        setApplications(response.data.data);
        setFilteredData(response.data.data);
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      message.error("Failed to fetch applications.");
    }
  };

  const handleFilter = () => {
    let filtered = [...applications];

    if (startDate && endDate) {
      filtered = filtered.filter((app) => {
        const appDate = new Date(app.updatedAt);
        return appDate >= startDate && appDate <= endDate;
      });
    }

    if (statusFilter) {
      filtered = filtered.filter(
        (app) => app.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    if (typeFilter) {
      filtered = filtered.filter(
        (app) => app.type?.toLowerCase() === typeFilter.toLowerCase()
      );
    }

    if (searchText) {
      filtered = filtered.filter((app) =>
        [app.firstName, app.lastName, app.vehicleRegNo, app.cell]
          .filter(Boolean)
          .some((field) =>
            field.toLowerCase().includes(searchText.toLowerCase())
          )
      );
    }

    if (expiryMonthYear) {
      filtered = filtered.filter((app) => {
        if (!app.expiryDate) return false;
        const expiry = new Date(app.expiryDate);
        const formattedExpiry = expiry.toLocaleString("default", {
          month: "long",
          year: "numeric",
        });
        return formattedExpiry
          .toLowerCase()
          .includes(expiryMonthYear.toLowerCase());
      });
    }

    setFilteredData(filtered);
  };

  const handleDateChange = (dates) => {
    if (dates) {
      setStartDate(dates[0].toDate());
      setEndDate(dates[1].toDate());
    } else {
      setStartDate(null);
      setEndDate(null);
    }
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredData.map((app) => ({
        ...app,
        approvedBy: app.approvedBy || "N/A",
        rejectedBy: app.rejectedBy || "N/A",
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Applications");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(data, "Applications_Report.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF("l", "pt", "a4"); // landscape mode for more space
    const title = "Application Reports";
    doc.setFontSize(16);
    doc.text(title, 40, 40);

    // Columns
    const tableColumn = [
      "Salutation",
      "First Name",
      "Last Name",
      "Type",
      "Vehicle Reg No.",
      "Cell",
      "Status",
      "Approved Date",
      "Approved By",
      "Rejected By",
      "Expiry Date",
      "Date",
    ];

    // Rows
    const tableRows = filteredData.map((app) => [
      app.salutation || "N/A",
      app.firstName || "N/A",
      app.lastName || "N/A",
      app.type || "N/A",
      app.vehicleRegNo || "N/A",
      app.cell || "N/A",
      app.status || "N/A",
      app.approvedAt ? moment(app.approvedAt).format("DD MMMM YYYY") : "N/A",
      Array.isArray(app.approvedBy)
        ? app.approvedBy.join(", ")
        : app.approvedBy || "N/A",
      app.rejectedBy || "N/A",
      app.expiryDate ? moment(app.expiryDate).format("DD MMMM YYYY") : "N/A",
      app.updatedAt ? moment(app.updatedAt).format("DD MMMM YYYY") : "N/A",
    ]);

    autoTable(doc, {
      startY: 60,
      head: [tableColumn],
      body: tableRows,
      styles: {
        fontSize: 9,
        cellPadding: 4,
      },
      headStyles: {
        fillColor: [41, 128, 185], // dark blue header
        textColor: 255,
        fontStyle: "bold",
        halign: "center",
      },
      bodyStyles: {
        valign: "middle",
      },
      columnStyles: {
        0: { cellWidth: 50 }, // Salutation
        1: { cellWidth: 60 }, // First Name
        2: { cellWidth: 60 }, // Last Name
        3: { cellWidth: 80 }, // Type
        4: { cellWidth: 80 }, // Vehicle Reg No.
        5: { cellWidth: 60 }, // Cell
        6: { cellWidth: 60 }, // Status
        7: { cellWidth: 70 }, // Approved Date
        8: { cellWidth: 120 }, // Approved By
        9: { cellWidth: 120 }, // Rejected By
        10: { cellWidth: 70 }, // Expiry Date
        11: { cellWidth: 70 }, // Date
      },
      didDrawPage: (data) => {
        // Add page numbers
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(10);
        doc.text(
          `Page ${data.pageNumber} of ${pageCount}`,
          doc.internal.pageSize.width - 60,
          doc.internal.pageSize.height - 10
        );
      },
    });

    doc.save("Applications_Report.pdf");
  };

  const columns = [
    {
      title: "Applicant",
      key: "name",
      render: (_, record) =>
        `${record.salutation || ""} ${record.firstName || ""} ${
          record.lastName || ""
        }`.trim() || "-",
    },
    { title: "Type", dataIndex: "type", key: "type" },
    {
      title: "Vehicle Reg No.",
      dataIndex: "vehicleRegNo",
      key: "vehicleRegNo",
    },
    { title: "Cell", dataIndex: "cell", key: "cell" },
    { title: "Status", dataIndex: "status", key: "status" },
    {
      title: "Approved Date",
      dataIndex: "finalApprovedAt",
      key: "finalApprovedAt",
      render: (date) => (date ? moment(date).format("DD MMMM YYYY") : "N/A"),
    },
    {
      title: "Approved By",
      dataIndex: "approvedBy",
      key: "approvedBy",
      render: (email) => email || "N/A",
    },
    {
      title: "Rejected By",
      dataIndex: "rejectedBy",
      key: "rejectedBy",
      render: (email) => email || "N/A",
    },
    {
      title: "Expiry Date",
      dataIndex: "expiryDate",
      key: "expiryDate",
      render: (date) => (date ? moment(date).format("DD MMMM YYYY") : "N/A"),
    },
    {
      title: "Date",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (date) => (date ? moment(date).format("DD MMMM YYYY") : "N/A"),
    },
  ];

  return (
    <div style={{ margin: "20px" }}>
      <Typography.Title level={2}>Application Reports</Typography.Title>
      <Row gutter={16} style={{ marginBottom: "20px" }}>
        {/*<Col span={8}>
          <RangePicker onChange={handleDateChange} />
        </Col> */}
        <Col span={4}>
          <DatePicker
            picker="month"
            placeholder="Select Expiry Month & Year"
            style={{ width: "100%" }}
            onChange={(date) => {
              if (date) {
                const formatted = date.format("MMMM YYYY"); // e.g., "March 2026"
                setExpiryMonthYear(formatted);
              } else {
                setExpiryMonthYear("");
              }
            }}
          />
        </Col>

        <Col span={4}>
          <Select
            placeholder="Select Status"
            style={{ width: "100%" }}
            onChange={setStatusFilter}
          >
            <Option value="Approved">Approved</Option>
            <Option value="finalApproved">finalApproved</Option>
            <Option value="Rejected">Rejected</Option>
            <Option value="Pending">Pending</Option>
          </Select>
        </Col>
        <Col span={4}>
          <Select
            placeholder="Select Type"
            style={{ width: "100%" }}
            onChange={setTypeFilter}
          >
            <Option value="Senior Citizen">Senior Citizen</Option>
            <Option value="War Veteran">War Veteran</Option>
          </Select>
        </Col>
        <Col span={6}>
          <Input
            placeholder="Search by Name, Reg No, or Cell"
            onChange={(e) => setSearchText(e.target.value)}
          />
        </Col>
        <Col span={2}>
          <Button type="primary" onClick={handleFilter}>
            Filter
          </Button>
        </Col>
      </Row>
      <Table
        dataSource={filteredData}
        columns={columns}
        rowKey="id"
        pagination={{ responsive: true }}
      />
      <Button
        type="primary"
        onClick={exportToExcel}
        style={{ marginTop: "20px", marginRight: "10px" }}
      >
        Generate Report (Excel)
      </Button>
      <Button type="danger" onClick={exportToPDF} style={{ marginTop: "20px" }}>
        Generate Report (PDF)
      </Button>
    </div>
  );
};

export default Reports;
