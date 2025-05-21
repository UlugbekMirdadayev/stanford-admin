import { useState, useEffect, useCallback } from "react";
import Table from "../components/Table";
import { Service, Loader } from "../assets/icons";
import { toast } from "react-toastify";
import api from "../services/api";
import "../styles/warehouse.css";
import Select from "../components/Select";

const STATUS_CODES = {
  uyga_keldi: "🏡 Uyga yetib keldik",
  uyga_ketmoqda: "🏠 Uyga olib ketish",
  maktabga_ketmoqda: "🏫 Maktabga olib kelish",
  maktabga_keldi: "🏢 Maktabga yetib keldik",
};

const StatusHistoriesStudents = () => {
  const [statusLogs, setStatusLogs] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");

  const getStudents = async () => {
    try {
      const { data } = await api.get("/students");
      setStudents(data);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Ошибка при загрузке учеников"
      );
    }
  };

  const getStatusLogs = useCallback(async () => {
    setTableLoading(true);
    try {
      let url = "/status-logs";
      if (selectedStudent) {
        url += `?studentId=${selectedStudent}`;
      }
      const { data } = await api.get(url);
      setStatusLogs(data);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Ошибка при загрузке истории статусов"
      );
    } finally {
      setTableLoading(false);
    }
  }, [selectedStudent]);

  useEffect(() => {
    getStudents();
  }, []);

  useEffect(() => {
    getStatusLogs();
  }, [getStatusLogs]);

  const getStatusLabel = (status) => {
    return STATUS_CODES[status] || status;
  };

  const handleUpdateStatus = async (studentId, newStatus) => {
    if (!newStatus || newStatus === "") return;

    setLoading(true);
    try {
      await api.post("/status-logs", {
        studentId,
        status: newStatus,
      });
      toast.success("Статус успешно обновлен");
      getStatusLogs();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Ошибка при обновлении статуса"
      );
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: "studentId",
      title: "O'quvchi",
      render: (_, row) => row.studentId?.fullName || "-",
    },
    {
      key: "status",
      title: "Holat",
      render: (status) => getStatusLabel(status),
    },
    {
      key: "estimatedTime",
      title: "Taxminiy vaqt",
      render: (time) => time || "-",
    },
    {
      key: "createdAt",
      title: "Yaratilgan sana",
      render: (_, row) => new Date(row.createdAt).toLocaleString("uz-UZ"),
    },
    {
      key: "actions",
      title: "Holatni o'zgartirish",
      render: (_, row) => (
        <div style={{ width: "250px" }}>
          <Select
            placeholder="Выберите статус"
            value={row.status}
            onChange={(value) => handleUpdateStatus(row.studentId?._id, value)}
            options={Object.entries(STATUS_CODES).map(([value, label]) => ({
              value,
              label,
            }))}
            disabled={loading}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="page row-warehouse">
      <div className="page-details">
        <div className="page-header">
          <Service />
          <span>История статусов учеников</span>
        </div>
        <div className="filter-section" style={{ margin: "20px" }}>
          <Select
            label="Фильтр по ученику"            options={[
              { label: "Все ученики", value: "" },
              ...(Array.isArray(students) ? students : []).map((student) => ({
                label: student.fullName,
                value: student._id,
              })),
            ]}
            value={selectedStudent}
            onChange={setSelectedStudent}
            placeholder="Выберите ученика"
          />
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
