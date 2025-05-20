import React, { useState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import Input from "../components/Input";
import Table from "../components/Table";
import Select from "../components/Select";
import { X, Upload, Trash, Pen, Service, Loader } from "../assets/icons";
import { toast } from "react-toastify";
import api from "../services/api";
import moment from "moment/min/moment-with-locales";
import "../styles/warehouse.css";

const Services = () => {
  const [opened, setOpened] = useState(false);
  const [editing, setEditing] = useState(null);
  const [services, setServices] = useState([]);
  const [branches, setBranches] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
    setFocus,
    control,
  } = useForm({
    defaultValues: {
      name: "",
      price: "",
      description: "",
      reCheckDate: "",
      status: "booked",
      client: "",
      branch: "",
    },
  });

  const getClients = async () => {
    try {
      const { data } = await api.get("/clients");
      setClients(data);
    } catch (err) {
      toast.error(err?.response?.data?.error || "Mijozlar yuklanmadi");
    }
  };

  const getBranches = async () => {
    try {
      const { data } = await api.get("/branches");
      setBranches(data);
    } catch (err) {
      toast.error(err?.response?.data?.error || "Filiallar yuklanmadi");
    }
  };

  const getServices = async () => {
    setTableLoading(true);
    try {
      const { data } = await api.get("/services");
      setServices(data.services);
    } catch (err) {
      toast.error(err?.response?.data?.error || "Xatolik yuz berdi");
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    getServices();
    getBranches();
    getClients();
  }, []);

  const onSubmit = async (values) => {
    setLoading(true);
    const toastId = toast.loading("Загрузка...", {
      onClick: () => toast.dismiss(toastId),
    });

    try {
      if (editing) {
        await api.put(`/services/${editing._id}`, values);
        toast.update(toastId, {
          render: "Xizmat ma'lumotlari yangilandi!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      } else {
        await api.post("/services", values);
        toast.update(toastId, {
          render: "Xizmat muvaffaqiyatli qo'shildi!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      }
      reset();
      setEditing(null);
      setOpened(false);
      getServices();
    } catch (err) {
      const message =
        err?.response?.data?.error || err?.message || "Xatolik, qayta urining!";

      toast.update(toastId, {
        render: message,
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Rostdan ham o'chirmoqchimisiz?")) {
      setLoading(true);
      try {
        await api.delete(`/services/${id}`);
        toast.success("Xizmat o'chirildi");
        getServices();
      } catch (err) {
        toast.error(err?.response?.data?.error || "Xatolik yuz berdi");
      } finally {
        setLoading(false);
      }
    }
  };

  const editService = (service) => {
    setEditing(service);
    setOpened(true);
    Object.entries(service).forEach(([key, value]) => {
      if (key === "branch" && value) {
        setValue(key, service.branch._id);
      } else if (key === "reCheckDate" && value) {
        setValue(key, moment(value).format("YYYY-MM-DD"));
      } else {
        setValue(key, value);
      }
    });
  };

  useEffect(() => {
    if (opened) setFocus("name");
  }, [opened, setFocus]);

  const getStatusLabel = (status) => {
    switch (status) {
      case "booked":
        return "Band qilingan";
      case "done":
        return "Bajarilgan";
      case "reject":
        return "Rad etilgan";
      default:
        return status;
    }
  };

  const columns = [
    { key: "name", title: "Xizmat nomi" },
    {
      key: "price",
      title: "Narxi (so'm)",
      render: (_, row) => row.price?.toLocaleString(),
    },
    { key: "description", title: "Izoh" },
    {
      key: "status",
      title: "Holati",
      render: (status) => getStatusLabel(status),
    },
    {
      key: "reCheckDate",
      title: "Qayta tekshirish sanasi",
      render: (_, row) =>
        row.reCheckDate ? moment(row.reCheckDate).format("LL") : "-",
    },
    {
      key: "branch",
      title: "Filial",
      render: (_, row) => row.branch?.name || "-",
    },
    {
      title: "Amallar",
      render: (_, row) => (
        <div className="actions-row">
          <button onClick={() => editService(row)} disabled={loading}>
            <Pen />
          </button>
          <button onClick={() => handleDelete(row._id)} disabled={loading}>
            <Trash />
          </button>
        </div>
      ),
    },
  ];

  const today = new Date();
  const minDate = new Date(today.setDate(today.getDate() + 7))
    .toISOString()
    .split("T")[0];

  return (
    <div className="page row-warehouse">
      <div className="page-details">
        <div className="page-header">
          <Service />
          <span>Xizmatlar</span>
          <button
            onClick={() => {
              reset();
              setEditing(null);
              setOpened(true);
            }}
            disabled={loading}
          >
            <X size={24} color="#3F8CFF" as="+" />
            <span>Qo'shish</span>
          </button>
        </div>
        <Table
          columns={columns}
          data={services}
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
            <span>{editing ? "Xizmatni tahrirlash" : "Yangi xizmat"}</span>
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
            <Input
              label="Xizmat nomi"
              placeholder="Masalan, Yetkazib berish"
              {...register("name", { required: "Xizmat nomi majburiy" })}
              error={errors.name?.message}
              disabled={loading}
            />
            <Input
              label="Narxi (so'm)"
              placeholder="10000"
              type="number"
              {...register("price", { required: "Narx majburiy" })}
              error={errors.price?.message}
              disabled={loading}
            />
          </div>

          <div className="row-form">
            <Input
              label="Izoh"
              placeholder="Izoh"
              {...register("description")}
              error={errors.description?.message}
              disabled={loading}
            />
            <Input
              label="Qayta tekshirish sanasi"
              type="date"
              min={minDate}
              {...register("reCheckDate")}
              error={errors.reCheckDate?.message}
              disabled={loading}
            />
          </div>

          <div className="row-form">
            <Select
              label="Holati"
              options={[
                { label: "Band qilingan", value: "booked" },
                { label: "Bajarilgan", value: "done" },
                { label: "Rad etilgan", value: "reject" },
              ]}
              value={watch("status")}
              onChange={(v) => setValue("status", v)}
              disabled={loading}
            />
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
            <Controller
              control={control}
              name="branch"
              rules={{ required: "Filial majburiy" }}
              render={({ field }) => (
                <Select
                  label="Filial"
                  options={branches.map((branch) => ({
                    label: branch.name,
                    value: branch._id,
                  }))}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.branch?.message}
                  required
                  disabled={loading}
                />
              )}
            />
          </div>

          <div className="row-form">
            <button
              type="reset"
              className="btn secondary"
              onClick={() => reset()}
              disabled={loading}
            >
              <span>Tozalash</span>
            </button>
            <button type="submit" className="btn primary" disabled={loading}>
              {loading ? (
                <Loader size={24} />
              ) : (
                <span>{editing ? "Saqlash" : "Qo'shish"}</span>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Services;
