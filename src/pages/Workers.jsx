import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import api from "../services/api";
import Input from "../components/Input";
import Select from "../components/Select";
import Table from "../components/Table";
import { X, Upload, Trash, Pen, UserGroup, Loader } from "../assets/icons";
import "../styles/warehouse.css";

const Workers = () => {
  const [opened, setOpened] = useState(false);
  const [editId, setEditId] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);

  const getAdmins = async () => {
    setTableLoading(true);
    try {
      const { data } = await api.get("/admin");
      setAdmins(data);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    getAdmins();
  }, []);

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
      email: "",
      password: "",
      branch: "",
      role: "admin",
    },
  });

  const onSubmit = async (values) => {
    setLoading(true);
    const toastId = toast.loading("Загрузка...", {
      onClick: () => toast.dismiss(toastId),
    });

    // Convert phone to plain digits before sending
    const cleanPhone = values.phone.replace(/\D/g, "");
    values.phone = cleanPhone;

    try {
      if (editId) {
        values._id = editId;
        await api.patch(`/admin/profile`, values);
        toast.update(toastId, {
          render: "Admin ma'lumotlari yangilandi!",
          type: "success",
          isLoading: false,
          autoClose: 3000, // 3 soniyadan keyin yopiladi
        });
      } else {
        delete values._id;
        await api.post("/admin/register", values);
        toast.update(toastId, {
          render: "Admin muvaffaqiyatli qo'shildi!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      }

      setOpened(false);
      reset();
      getAdmins(); // yangilangan adminlar ro‘yxatini qayta chaqirish
    } catch (err) {
      const message =
        err?.response?.data?.errors?.map(({ msg }) => msg).join("\n") ||
        err?.response?.data?.message ||
        err?.message ||
        "Xatolik, qayta urining!";

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

  useEffect(() => {
    if (opened) setFocus("fullName");
  }, [opened, setFocus]);

  const handleEdit = (row) => {
    setEditId(row._id);
    setValue("fullName", row.fullName);
    setValue("phone", formatPhoneNumber(row.phone));
    setValue("email", row.email);
    setValue("branch", row.branch?._id || "");
    setValue("password", "");
    setOpened(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Rostdan ham o'chirmoqchimisiz?")) {
      setLoading(true);
      try {
        await api.delete(`/admin/${id}`);
        toast.success("Admin o'chirildi");
        getAdmins();
      } catch (err) {
        console.log(err);
        toast.error("Xatolik yuz berdi");
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

  return (
    <div className="page row-warehouse">
      <div className="page-details">
        <div className="page-header">
          <UserGroup />
          <span>Xodimlar</span>
          <button
            onClick={() => {
              setOpened(true);
              setEditId(null);
              reset();
            }}
            disabled={loading}
          >
            <X size={24} color="#3F8CFF" as="+" />
            <span>Qo'shish</span>
          </button>
        </div>

        <Table
          columns={[
            { title: "F.I.Sh", key: "fullName" },
            { title: "Telefon", key: "phone", render: (_, row) => formatPhoneNumber(row.phone) },
            { title: "Email", key: "email" },
            {
              title: "Filial",
              key: "branch",
              render: (_, row) => row?.branch?.name,
            },
            { title: "Rol", key: "role" },
            {
              title: "Amallar",
              render: (_, row) => (
                <div className="actions-row">
                  <button
                    className="edit"
                    onClick={() => handleEdit(row)}
                    disabled={loading}
                  >
                    <Pen size={20} />
                  </button>
                  <button
                    className="delete"
                    onClick={() => handleDelete(row._id)}
                    disabled={loading}
                  >
                    <Trash size={20} />
                  </button>
                </div>
              ),
            },
          ]}
          data={admins}
          sortable={true}
          pagination={true}
          pageSize={10}
          tableLoading={tableLoading}
        />
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className={`driwer-form${opened ? " opened" : ""}`}
      >
        <div className="form-body">
          <div className="page-header">
            <Upload />
            <span>{editId ? "Tahrirlash" : "Yangi admin"}</span>
            <button
              type="button"
              onClick={() => {
                setOpened(false);
                reset();
              }}
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
          </div>

          <div className="row-form">
            <Input
              label="Email"
              error={errors.email?.message}
              placeholder="email@example.com"
              {...register("email", { required: "Email majburiy" })}
              disabled={loading}
            />
            <Input
              label="Parol"
              type="password"
              error={errors.password?.message}
              placeholder="******"
              {...register("password", {
                required: !editId ? "Parol majburiy" : false,
              })}
              disabled={loading}
            />
          </div>

          <div className="row-form">
            <Input
              label="Filial"
              error={errors.branch?.message}
              placeholder="Filial"
              {...register("branch")}
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
              <span>Tozalash</span>
            </button>
            <button type="submit" className="btn primary" disabled={loading}>
              {loading ? (
                <Loader size={24} />
              ) : (
                <span>{editId ? "Saqlash" : "Qo'shish"}</span>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Workers;
