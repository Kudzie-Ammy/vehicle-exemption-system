module.exports = {
  development: {
    client: "mssql",
    connection: {
      server: "DESKTOP-G133VUQ\\SQLEXPRESS",
      user: "kudzi",
      password: "Password",
      database: "Vehicle Exemption",
      options: { 
        encrypt: true,
        trustServerCertificate: true,
      },
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: "./migrations",
    },
  },
};
