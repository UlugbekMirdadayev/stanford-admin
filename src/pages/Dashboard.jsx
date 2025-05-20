import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import moment from "moment/min/moment-with-locales";
import "moment/locale/uz";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import {
  DashboardIcon,
  Dollar,
  Balance,
  Cart,
  Branches,
  Pen,
  Trash,
  Loader,
  X,
  Upload,
} from "../assets/icons";
import Table from "../components/Table";
import DebtTimer from "../components/DebtTimer";
import NumberAnimation from "../components/Counter";
import { ChiqimChart, KirimChart } from "../components/BarChart";
import api from "../services/api";
import Input from "../components/Input";
import Select from "../components/Select";
import "../styles/dashboard.css";
import "../styles/warehouse.css";

moment.locale("uz");

const statsIcons = [
  {
    key: "todaySales",
    prefix: "so'm",
    title: "Bugungi sotuvlar",
    icon: <Dollar />,
    bg: "linear-gradient(201deg, #D3FFE7 3.14%, #EFFFF6 86.04%)",
  },
  {
    key: "totalPaid",
    prefix: "so'm",
    title: "Umumiy balans",
    icon: <Balance />,
    bg: "linear-gradient(201deg, #CAF1FF 3.14%, #CDF4FF 86.04%)",
  },
  {
    key: "totalDebt",
    prefix: "so'm",
    title: "Umumiy nasiyalar",
    icon: <Cart />,
    bg: "linear-gradient(201deg, #FFA3CF 3.14%, #FFD4F3 86.04%)",
  },
  {
    key: "productsCount",
    prefix: "ta",
    title: "Mahsulotlar",
    icon: <Branches color="#3F8CFF" size={42} />,
    bg: "linear-gradient(201deg, #D3E5FF 3.14%, #E6F0FF 86.04%)",
  },
];

const statuses = [
  { value: "partial", label: "Qisman to'lov qilingan" },
  { value: "paid", label: "To'langan" },
  { value: "pending", label: "To'lanmagan" },
];

const Dashboard = () => {
  const { user } = useSelector(({ user }) => user);
  const [chartData, setChartData] = useState({
    cashIn: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    cashOut: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    totalCashIn: 0,
    totalCashOut: 0
  });
  const [stats, setStats] = useState({});
  const [debtors, setDebtors] = useState([]);
  const [clients, setClients] = useState([]);
  const [branches, setBranches] = useState([]);
  const [opened, setOpened] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      client: "",
      description: "",
      totalDebt: "",
      date_returned: "",
      branch: "",
      status: "pending",
    },
  });

  // Fetch stats, debtors, branches
  const fetchAll = async () => {
    setTableLoading(true);
    try {
      const [chartDataRes, statsRes, debtorsRes, branchesRes, clientsRes] = await Promise.all([
        api.get("/transactions/statistics/monthly-transactions"),
        api.get("/orders/stats/summary"),
        api.get("/debtors"),
        api.get("/branches"),
        api.get("/clients"),
      ]);
      const cashIn = chartDataRes?.data?.cashIn;
      const cashOut = chartDataRes?.data?.cashOut;

      const totalCashIn = cashIn.reduce((sum, val) => sum + val, 0);
      const totalCashOut = cashOut.reduce((sum, val) => sum + val, 0);

      const cashInPercent = cashIn.map(val =>
        totalCashIn === 0 ? 0 : +(val / totalCashIn * 100).toFixed(2)
      );

      const cashOutPercent = cashOut.map(val =>
        totalCashOut === 0 ? 0 : +(val / totalCashOut * 100).toFixed(2)
      );

      setChartData({ cashIn: cashInPercent, cashOut: cashOutPercent, totalCashIn, totalCashOut });
      setStats(statsRes.data);
      setDebtors(debtorsRes.data);
      setBranches(branchesRes.data);
      setClients(clientsRes.data?.filter(c => c?.isVip));
    } catch (err) {
      toast.error("Ma'lumotlarni yuklashda xatolik");
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Handle form open for edit/add
  const openDrawerForEdit = (debtor) => {
    setEditing(debtor);
    setOpened(true);
    reset({
      client: debtor.client?._id || "",
      description: debtor.description || "",
      totalDebt: debtor.totalDebt || "",
      date_returned: debtor.date_returned
        ? debtor.date_returned.slice(0, 16)
        : "",
      branch: debtor.branch?._id || "",
      status: debtor.status || "pending",
    });
  };

  const openDrawerForAdd = () => {
    setEditing(null);
    setOpened(true);
    reset({
      client: "",
      description: "",
      totalDebt: "",
      date_returned: "",
      branch: "",
      status: "pending",
    });
  };

  // Save (add/edit) handler
  const onSubmit = async (values) => {
    setLoading(true);
    const toastId = toast.loading("Saqlanmoqda...");
    try {
      const payload = {
        client: values.client,
        description: values.description,
        totalDebt: Number(values.totalDebt),
        date_returned: values.date_returned,
        branch: values.branch,
        status: values.status,
      };
      if (editing) {
        await api.patch(`/debtors/${editing._id}`, payload);
        toast.update(toastId, {
          render: "Qarzdor yangilandi",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      } else {
        await api.post("/debtors", payload);
        toast.update(toastId, {
          render: "Qarzdor qo'shildi",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      }
      fetchAll();
      setOpened(false);
      setEditing(null);
      reset();
    } catch (err) {
      toast.update(toastId, {
        render: err?.response?.data?.message || "Xatolik yuz berdi",
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete handler
  const handleDelete = async (id) => {
    if (!window.confirm("Rostdan ham o'chirmoqchimisiz?")) return;
    setLoading(true);
    try {
      await api.delete(`/debtors/${id}`);
      toast.success("Qarzdor o'chirildi");
      fetchAll();
    } catch (err) {
      toast.error("O'chirishda xatolik");
    } finally {
      setLoading(false);
    }
  };

  // Table columns
  const columns = [
    {
      key: "client.fullName",
      title: "Ism",
      render: (_, row) => row.client?.fullName || "-",
    },
    {
      key: "client.phone",
      title: "Telefon",
      render: (_, row) => row.client?.phone || "-",
      style: { minWidth: 150 },
    },
    {
      key: "description",
      title: "Sabab",
      render: (_, row) => row.description || "-",
    },
    {
      key: "branch",
      title: "Filial",
      render: (_, row) => row.branch?.name || "-",
    },
    {
      key: "totalDebt",
      title: "Qarz miqdori",
      render: (_, row) => `${row.totalDebt?.toLocaleString() || 0} so'm`,
    },
    {
      key: "date_returned",
      title: "Qaytarilishi kerak sana",
      render: (_, row) => moment(row.date_returned).format("LLL"),
    },
    {
      key: "status",
      title: "Status",
      render: (_, row) =>
        statuses.find((s) => s.value === row.status)?.label || "-",
    },
    {
      key: "date_expired",
      title: "Qancha muddati o'tgan",
      render: (_, row) => <DebtTimer targetDate={row.date_returned} />,
    },
    {
      title: "Amallar",
      render: (_, row) => (
        <div className="actions-row">
          <button
            onClick={() => openDrawerForEdit(row)}
            disabled={loading}
            type="button"
          >
            <Pen />
          </button>
          <button
            onClick={() => handleDelete(row._id)}
            disabled={loading}
            type="button"
          >
            <Trash />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="page row-warehouse">
      <div className="page-details">
        <div className="page-header">
          <DashboardIcon />
          <span>Statistika</span>
          <button
            onClick={openDrawerForAdd}
            disabled={loading}
            type="button"
          >
            <X size={24} color="#3F8CFF" as="+" />
            <span>Qo‘shish</span>
          </button>
        </div>
        <div className="stats">
          {statsIcons.map((item, idx) => (
            <div key={idx} className="stats-card">
              <div className="icon-box" style={{ background: item.bg }}>
                {item.icon}
              </div>
              <div className="info">
                <span>{item.title}</span>
                <p>
                  <NumberAnimation duration={700} value={stats[item.key]} />{" "}
                  {item.prefix}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="charts">
          <KirimChart data={chartData?.cashIn} total={chartData?.totalCashIn} />
          <ChiqimChart data={chartData?.cashOut} total={chartData?.totalCashOut} />
        </div>
        <h2 className="debtors-title">Qarzdorlar ro‘yhati</h2>
        <Table
          columns={columns}
          data={debtors}
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

      <form
        onSubmit={handleSubmit(onSubmit)}
        className={`driwer-form${opened ? " opened" : ""}`}
      >
        <div className="form-body">
          <div className="page-header">
            <Upload />
            <span>{editing ? "Tahrirlash" : "Yangi qarzdor"}</span>
            <button
              type="button"
              onClick={() => {
                reset();
                setEditing(null);
                setOpened(false);
              }}
              disabled={loading}
            >
              <X size={24} color="#3F8CFF" />
              <span>Yopish</span>
            </button>
          </div>
          <div className="row-form">
            <Controller
              control={control}
              name="client"
              rules={{ required: "Mijoz majburiy" }}
              render={({ field }) => (
                <Select
                  label="Mijoz"
                  options={clients.map((client) => ({
                    label: client.fullName,
                    value: client._id,
                  }))}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.client?.message}
                  required
                  disabled={loading}
                />
              )}
            />
          </div>
          <div className="row-form">
            <Input
              label="Qarz miqdori"
              type="number"
              placeholder="100000"
              {...register("totalDebt", {
                required: "Qarz miqdori majburiy",
                min: { value: 1, message: "Minimal qiymat 1 bo'lishi kerak" },
              })}
              error={errors.totalDebt?.message}
              disabled={loading}
            />
            <Select
              label="Status"
              options={statuses}
              value={watch("status")}
              onChange={(v) => setValue("status", v)}
              error={errors.status?.message}
              disabled={loading}
            />
          </div>
          <div className="row-form">
            <Input
              label="Qaytarilish sanasi"
              type="datetime-local"
              {...register("date_returned")}
              error={errors.date_returned?.message}
              disabled={loading}
            />
            <Select
              label="Filial"
              options={branches.map((b) => ({
                label: b.name,
                value: b._id,
              }))}
              value={watch("branch")}
              onChange={(v) => setValue("branch", v)}
              error={errors.branch?.message}
              disabled={loading}
            />
          </div>
          <div className="row-form">
            <Input
              label="Sabab"
              placeholder="Sabab"
              {...register("description")}
              error={errors.description?.message}
              disabled={loading}
              as="textarea"
            />
          </div>
          <div className="row-form">
            <button
              type="reset"
              className="btn secondary"
              onClick={() => reset()}
              disabled={loading}
            >
              Tozalash
            </button>
            <button type="submit" className="btn primary" disabled={loading}>
              {loading ? <Loader size={24} /> : <span>Saqlash</span>}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Dashboard;