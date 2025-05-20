import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Input from "../components/Input";
import Select from "../components/Select";
import Table from "../components/Table";
import {
  X,
  Upload,
  Trash,
  Pen,
  Folder,
  UserGroup,
  Loader,
} from "../assets/icons";
import "../styles/warehouse.css";
import api from "../services/api";
import { toast } from "react-toastify";

const Clients = () => {
  const [opened, setOpened] = useState(false);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [branches, setBranches] = useState([]);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
    setFocus,
  } = useForm({
    defaultValues: {
      fullName: "",
      phone: "",
      clientType: "Oddiy",
      description: "",
      debt: "",
      password: "",
    },
  });

  const fetchClients = async () => {
    setTableLoading(true);
    try {
      const res = await api.get("clients");
      const result = res.data;
      setClients(result);
    } catch (err) {
      toast.error("Error fetching clients: " + (err.response?.data?.message || err.message));
    } finally {
      setTableLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const res = await api.get("branches");
      setBranches(res.data);
    } catch (err) {
      toast.error("Error fetching branches: " + (err.response?.data?.message || err.message));
    }
  };

  const createClient = async (client) => {
    const res = await api.post("clients", client);
    return res.data;
  };

  const updateClient = async (id, client) => {
    const res = await api.patch(`clients/${id}`, client);
    return res.data;
  };

  const deleteClient = async (id) => {
    const res = await api.delete(`clients/${id}`);
    return res.data;
  };

  // Fetch clients from backend
  useEffect(() => {
    fetchClients();
    fetchBranches();
  }, []);

  // Map frontend form to backend model
  const mapFormToBackend = (data) => {
    return {
      fullName: data.fullName,
      phone: data.phone,
      isVip: data.clientType === "VIP",
      notes: data.description,
      debt: Number(data.debt) || 0,
      branch: data.branch || null,
      password: data.password || null,
      // Add other fields as needed
      // branch: "branchId", // You may need to select/set this
    };
  };

  const onSubmit = async (values) => {
    setLoading(true);
    // Convert phone to plain digits before sending
    const cleanPhone = values.phone.replace(/\D/g, "");
    values.phone = cleanPhone;
    try {
      const backendData = mapFormToBackend(values);
      if (editing) {
        await updateClient(editing._id, backendData);
      } else {
        await createClient(backendData);
      }
      await fetchClients(); // Refresh list
      reset();
      setEditing(null);
      setOpened(false);
    } catch (err) {
      toast.error("Error saving client: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (row) => {
    setEditing(row);
    setOpened(true);
    setValue("fullName", row.fullName);
    setValue("phone", formatPhoneNumber(row.phone));
    setValue("branch", row.branch?._id || "");
    setValue("clientType", row.isVip ? "VIP" : "Oddiy");
    setValue("description", row.notes || "");
    setValue("debt", isNaN(row.debt) ? "" : row.debt);
  };

  const handleDrawerClose = () => {
    setOpened(false);
    setEditing(null);
    reset();
  };

  const handleDelete = async (row) => {
    if (window.confirm("O'chirishni xohlaysizmi?")) {
      setLoading(true);
      try {
        await deleteClient(row._id);
        await fetchClients();
      } catch (err) {
        toast.error("Error deleting client: " + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    }
  };

  const formatPhoneNumber = (value) => {
    if (!value) return "+998 ";

    // Remove all non-digit characters
    const cleaned = value.replace(/\D/g, "");

    // Check if the number starts with country code
    const hasCountryCode = cleaned.startsWith("998");
    const digits = hasCountryCode ? cleaned.substring(3) : cleaned;

    // Format the remaining digits
    const match = digits.match(/^(\d{0,2})(\d{0,3})(\d{0,2})(\d{0,2})$/);
    if (!match) return "+998 ";

    // Construct the formatted phone number
    let formatted = "+998";
    if (match[1]) formatted += ` ${match[1]}`;
    if (match[2]) formatted += ` ${match[2]}`;
    if (match[3]) formatted += ` ${match[3]}`;
    if (match[4]) formatted += ` ${match[4]}`;

    return formatted;
  };

  const handlePhoneInput = (e) => {
    const input = e.target.value;

    // Remove all non-digit characters
    const numericValue = input.replace(/\D/g, "");
    const phoneValue = numericValue.startsWith("998")
      ? numericValue
      : "998" + numericValue;

    // Format to display
    const formattedValue = formatPhoneNumber(phoneValue);

    // Set formatted value directly
    setValue("phone", formattedValue, {
      shouldValidate: true,
      shouldTouch: true,
    });

    // Adjust cursor
    const cursorPosition = e.target.selectionStart;
    const addedChars = formattedValue.length - input.length;
    const newCursorPosition =
      addedChars > 0 && cursorPosition > 0
        ? cursorPosition + addedChars
        : cursorPosition;

    return {
      value: formattedValue,
      cursorPosition: newCursorPosition,
    };
  };

  const handlePhoneChange = (e) => {
    const result = handlePhoneInput(e);
    e.target.value = result.value;

    // Restore cursor position after state update
    setTimeout(() => {
      e.target.setSelectionRange(result.cursorPosition, result.cursorPosition);
    }, 0);
  };

  const columns = [
    { key: "fullName", title: "F.I.Sh" },
    {
      key: "phone",
      title: "Telefon raqam",
      render: (_, row) => formatPhoneNumber(row.phone) || "-",
    },
    {
      key: "branch",
      title: "Filial",
      render: (_, row) => row.branch?.name || "-",
    },
    { key: "isVip", title: "Mijoz turi", render: (v) => (v ? "VIP" : "Oddiy") },
    { key: "debt", title: "Umumiy qarzi", render: (debt) => debt?.toLocaleString() + " so'm" },
    { key: "notes", title: "Izoh" },
    {
      title: "Amallar",
      render: (_, row) => (
        <div className="actions-row">
          <button
            type="button"
            onClick={() => handleEdit(row)}
            disabled={loading}
          >
            <Pen />
          </button>
          <button
            type="button"
            onClick={() => handleDelete(row)}
            disabled={loading}
          >
            <Trash />
          </button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    if (opened) setFocus("fullName");
  }, [opened, setFocus]);

  return (
    <div className="page row-warehouse">
      <div className="page-details">
        <div className="page-header">
          <UserGroup />
          <span>Mijozlar</span>
          <button
            onClick={() => {
              setOpened(true);
              setEditing(null);
              reset();
            }}
            disabled={loading}
          >
            <X size={24} color="#3F8CFF" as="+" />
            <span>Qo‘shish</span>
          </button>
        </div>
        <Table
          columns={columns}
          data={clients}
          onRowClick={(row) => console.log(row)}
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
            <span>{editing ? "Mijozni tahrirlash" : "Yangi mijoz"}</span>
            <button
              type="button"
              onClick={handleDrawerClose}
              disabled={loading}
            >
              <X size={24} color="#3F8CFF" />
              <span>Yopish</span>
            </button>
          </div>

          <div className="row-form">
            <Input
              label="F.I.Sh"
              error={errors.fullName?.message}
              placeholder="F.I.Sh"
              {...register("fullName", { required: "Ism-familya majburiy" })}
              disabled={loading}
            />

            <Input
              {...register("phone", {
                pattern: {
                  value: /^\+998 \d{2} \d{3} \d{2} \d{2}$/,
                  message:
                    "Telefon raqami +998 bilan boshlanishi\nva 9 ta raqamdan iborat bo‘lishi kerak",
                },
                required: true,
              })}
              label="Telefon raqamingiz"
              placeholder="+998 90 123 45 67"
              error={errors.phone?.message}
              value={watch("phone")}
              onChange={handlePhoneChange}
              autoFocus
              disabled={loading}
            />
            <Input
              label="Parol"
              type="password"
              placeholder="Yangi parol"
              {...register("password", {
                minLength: {
                  value: 6,
                  message: "Parol kamida 6 ta belgidan iborat bo‘lishi kerak",
                },
              })}
              error={errors.password?.message}
              disabled={loading}
            />
          </div>

          <div className="row-form">
            <Select
              label="Filial"
              options={branches.map((b) => ({ label: b.name, value: b._id }))}
              onChange={(v) => setValue("branch", v)}
              value={watch("branch")}
              disabled={loading}
            />
            <Select
              label="Mijoz turi"
              options={[
                { label: "Oddiy", value: "Oddiy" },
                { label: "VIP", value: "VIP" },
              ]}
              onChange={(v) => setValue("clientType", v)}
              value={watch("clientType")}
              disabled={loading}
            />
          </div>

          <div className="row-form">
            <Input
              label="Umumiy qarzi"
              error={errors.debt?.message}
              placeholder="0"
              type="number"
              {...register("debt")}
              disabled={loading}
            />
            <Input
              label="Izoh"
              error={errors.description?.message}
              placeholder="Izoh"
              {...register("description")}
              disabled={loading}
            />
          </div>

          <div className="row-form">
            <button
              type="reset"
              className="btn secondary"
              onClick={handleDrawerClose}
              disabled={loading}
            >
              <span>Tozalash</span>
            </button>
            <button type="submit" className="btn primary" disabled={loading}>
              {loading ? (
                <Loader size={24} />
              ) : (
                <span>{editing ? "Saqlash" : "Saqlash"}</span>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Clients;
