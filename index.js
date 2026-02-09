const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const mime = require("mime-types");

dotenv.config();

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/reports", express.static(path.join(__dirname, "reports")));


app.get("/uploads/:filename", (req, res) => {
  const filePath = path.join(__dirname, "uploads", req.params.filename);

  const mimeType = mime.lookup(filePath);

  if (mimeType) {
    res.setHeader("Content-Type", mimeType);
  }

  res.setHeader("Content-Disposition", "inline");
  res.sendFile(filePath);
});

process.env.jwt_secret =
  "chat3425#$G$#3VBHSJBSJTSDDN4c4cEfFvGggGGf5t3e4Y%G&tg67GUbtfVE345$4#3#$$456&6589citysdbsbjmncdbs";
process.env.bcrypt_salt =
  "$2a$06$bghdsSsGHJG3554AaSDSDtrt5g][gff.htfgfh4033xvs5345dfe65456556755sdsd6f7sdfHfgshgfshdfchd26";

const knexConfig = require("./knexfile");
const knex = require("knex")(knexConfig["development"]);
global.knex = knex;

const api = require("./routes/api");
app.use("/api", api);

knex
  .raw("SELECT 1")
  .then(() => {
    const PORT = process.env.PORT || 8000;

    app.listen(PORT, () =>
      console.log(`Server running on port: http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("Database connection error:", err);
    process.exit(1);
  });
