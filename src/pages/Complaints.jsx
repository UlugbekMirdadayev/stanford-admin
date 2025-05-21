import React, { useState, useEffect } from "react";
import Table from "../components/Table";
import { Service, Loader } from "../assets/icons";
import { toast } from "react-toastify";
import Select from "../components/Select";
import api from "../services/api";
import "../styles/warehouse.css";
import moment from "moment/min/moment-with-locales";

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const getComplaints = async () => {
    setTableLoading(true);
    try {
      const { data } = await api.get("/complaints");
      setComplaints(data);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Ошибка при загрузке жалоб");
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    getComplaints();
  }, []);
  const handleStatusChange = async (id, newStatus) => {
    setLoading(true);
    try {
      await api.patch(`/complaints/${id}`, { status: newStatus });
      toast.success("Статус жалобы обновлен");
      getComplaints();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Ошибка при обновлении статуса"
      );
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: "complaint", title: "Жалоба" },
    {
      key: "status",
      title: "Статус",
      render: (status, row) => (
        <Select
          value={status}
          onChange={(value) => handleStatusChange(row._id, value)}
          options={[
            { label: "🕒 В ожидании", value: "pending" },
            { label: "✅ Решено", value: "resolved" },
            { label: "❌ Отклонено", value: "rejected" },
          ]}
          disabled={loading}
        />
      ),
    },
    {
      key: "createdAt",
      title: "Дата создания",
      render: (_, row) => moment(row.createdAt).format("LLLL"),
    },
    {
      key: "updatedAt",
      title: "Дата обновления",
      render: (_, row) => moment(row.updatedAt).format("LLLL"),
    },
  ];

  return (
    <div className="page row-warehouse">
      <div className="page-details">
        <div className="page-header">
          <Service />
          <span>Жалобы</span>
        </div>
        <Table
          columns={columns}
          data={complaints}
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

export default Complaints;
