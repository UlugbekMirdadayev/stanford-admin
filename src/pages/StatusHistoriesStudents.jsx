import { useState, useEffect } from "react";
import Table from "../components/Table";
import { Service, Loader } from "../assets/icons";
import { toast } from "react-toastify";
import api from "../services/api";
import "../styles/warehouse.css";

const StatusHistoriesStudents = () => {
  const [statusLogs, setStatusLogs] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);

  const getStatusLogs = async () => {
    setTableLoading(true);
    try {
      const { data } = await api.get("/status-logs");
      setStatusLogs(data);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Ошибка при загрузке истории статусов"
      );
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    getStatusLogs();
  }, []);

  const getStatusLabel = (status) => {
    switch (status) {
      case "дома":
        return "Дома";
      case "в_пути_домой":
        return "В пути домой";
      case "в_пути_в_школу":
        return "В пути в школу";
      default:
        return status;
    }
  };

  const columns = [
    {
      key: "studentId",
      title: "Ученик",
      render: (_, row) => row.studentId?.fullName || "-",
    },
    {
      key: "status",
      title: "Статус",
      render: (status) => getStatusLabel(status),
    },
    {
      key: "estimatedTime",
      title: "Расчетное время",
      render: (time) => time || "-",
    },
    {
      key: "createdAt",
      title: "Дата создания",
      render: (_, row) => new Date(row.createdAt).toLocaleString("ru-RU"),
    },
  ];

  return (
    <div className="page row-warehouse">
      <div className="page-details">
        <div className="page-header">
          <Service />
          <span>История статусов учеников</span>
        </div>
        <Table
          columns={columns}
          data={statusLogs}
          sortable={true}
          pagination={true}
          pageSize={10}
          tableLoading={tableLoading}
        />
        {tableLoading && (
          <div style={{ textAlign: "center", marginTop: 20 }}>
            <Loader size={32} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusHistoriesStudents;
