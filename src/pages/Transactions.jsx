// src/pages/Transactions.jsx
import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "react-toastify";
import moment from "moment";
import Input from "../components/Input";
import Select from "../components/Select";
import Table from "../components/Table";
import {
  X,
  Upload,
  Trash,
  Pen,
  Loader,
  Folder,
} from "../assets/icons";
import api from "../services/api";
import "../styles/warehouse.css";
import { useSelector } from "react-redux";

const Transactions = () => {
  const { user } = useSelector(({ user }) => user)
  const [transactions, setTransactions] = useState([]);
  const [clients, setClients] = useState([]);
  const [opened, setOpened] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    watch,
    formState: { errors },
    setFocus,
  } = useForm({
    defaultValues: {
      type: "cash-in",
      paymentType: "cash",
      amount: "",
      description: "",
      createdBy: user?._id,
      client: null
    },
  });

  const getTransactions = async () => {
    setTableLoading(true);
    try {
      const { data } = await api.get("/transactions");
      setTransactions(data.transactions);
    } catch (err) {
      toast.error("Xatolik: tranzaksiyalarni yuklab bo‘lmadi.");
    } finally {
      setTableLoading(false);
    }
  };
  const getClients = async () => {
    setTableLoading(true);
    try {
      const { data } = await api.get("/clients");
      setClients(data);
    } catch (err) {
      toast.error("Xatolik: clients yuklab bo‘lmadi.");
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    getTransactions();
    getClients()
  }, []);

  const onSubmit = async (values) => {
    setLoading(true);
    const toastId = toast.loading("Saqlanmoqda...");
    try {
      if (editing) {
        await api.put(`/transactions/${editing._id}`, values);
        toast.update(toastId, {
          render: "Tranzaksiya yangilandi",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      } else {
        const endpoint =
          values.type === "cash-in" ? "/cash-in" : "/cash-out";
        await api.post("/transactions/" + endpoint, values);
        toast.update(toastId, {
          render: "Tranzaksiya qo‘shildi",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      }
      reset();
      setOpened(false);
      setEditing(null);
      getTransactions();
    } catch (err) {
      toast.update(toastId, {
        render: err?.response?.data?.error || "Xatolik yuz berdi",
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
      try {
        setLoading(true);
        await api.delete(`/transactions/${id}`);
        toast.success("Tranzaksiya o‘chirildi");
        getTransactions();
      } catch (err) {
        toast.error("Xatolik yuz berdi");
      } finally {
        setLoading(false);
      }
    }
  };

  const editTransaction = (item) => {
    setEditing(item);
    setOpened(true);
    Object.entries(item).forEach(([key, value]) => {
      setValue(key, value);
    });
  };

  useEffect(() => {
    if (opened) setFocus("amount");
  }, [opened]);

  const columns = [
    {
      key: "type",
      title: "Turi",
      render: (value) =>
        value === "cash-in" ? "Kirim" : "Chiqim",
    },
    {
      key: "paymentType",
      title: "To‘lov turi",
      render: (value) => (value === "cash" ? "Naqd" : "Karta"),
    },
    {
      key: "amount",
      title: "Miqdor (so'm)",
      render: (_, row) => row.amount?.toLocaleString(),
    },
    {
      key: "client",
      title: "Mijoz",
      render: (_, row) => row?.client?.fullName,
    },
    { key: "description", title: "Izoh" },
    {
      key: "createdAt",
      title: "Sana",
      render: (_, row) => moment(row.createdAt).format("LLL"),
    },
    {
      title: "Amallar",
      render: (_, row) => (
        <div className="actions-row">
          <button onClick={() => editTransaction(row)} disabled={loading}>
            <Pen />
          </button>
          <button onClick={() => handleDelete(row._id)} disabled={loading}>
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
          <Folder />
          <span>Tranzaksiyalar</span>
          <button
            onClick={() => {
              reset();
              setEditing(null);
              setOpened(true);
            }}
            disabled={loading}
          >
            <X size={24} color="#3F8CFF" as="+" />
            <span>Qo‘shish</span>
          </button>
        </div>

        <Table
          columns={columns}
          data={transactions}
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
            <span>{editing ? "Tahrirlash" : "Yangi tranzaksiya"}</span>
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
            <Select
              label="Turi"
              options={[
                { label: "Kirim", value: "cash-in" },
                { label: "Chiqim", value: "cash-out" },
              ]}
              value={watch("type")}
              onChange={(v) => setValue("type", v)}
              disabled={loading}
            />
            <Select
              label="To‘lov turi"
              options={[
                { label: "Naqd", value: "cash" },
                { label: "Karta", value: "card" },
              ]}
              value={watch("paymentType")}
              onChange={(v) => setValue("paymentType", v)}
              disabled={loading}
            />
          </div>

          <div className="row-form">
            <Controller
              control={control}
              name="client"
              render={({ field }) => (
                <Select
                  label="Mijoz"
                  options={clients.map((client) => ({
                    label: client.fullName,
                    value: client._id,
                  }))}
                  value={field.value}
                  onChange={v => {
                    field.onChange(v);
                    if (!clients?.find(({ _id }) => _id === v)?.isVip) {
                      setValue("paymentType", "cash")
                    }
                  }}
                  error={errors.client?.message}
                  disabled={loading}
                />
              )}
            />
            <Input
              label="Miqdor"
              type="number"
              placeholder="10000"
              {...register("amount", {
                required: "Miqdor majburiy",
                min: { value: 1, message: "Minimal qiymat 1 bo'lishi kerak" },
              })}
              error={errors.amount?.message}
              disabled={loading}
            />
            <Input
              label="Izoh"
              placeholder="Izoh"
              {...register("description")}
              error={errors.description?.message}
              disabled={loading}
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

export default Transactions;
