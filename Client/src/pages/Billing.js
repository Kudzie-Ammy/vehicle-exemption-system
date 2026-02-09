{/* Cards for approved and rejected counts */}
      <Row gutter={16} style={{ marginBottom: "20px" }}>
        <Col span={8}>
          <Card
            title="Total number of Applications"
            style={{ textAlign: "center" }}
          >
            <Typography.Title level={3}>{applicationCount}</Typography.Title>
          </Card>
        </Col>
        <Col span={8}>
          <Card
            title="Total number of applications Approved"
            style={{ textAlign: "center" }}
          >
            <Typography.Title level={3}>{approvedCount}</Typography.Title>
          </Card>
        </Col>
        <Col span={8}>
          <Card
            title="Total number of applications Rejected"
            style={{ textAlign: "center" }}
          >
            <Typography.Title level={3}>{rejectedCount}</Typography.Title>
          </Card>
        </Col>
      </Row>