import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Input from "../components/Input";
import Table from "../components/Table";
import { X, Upload, Trash, Folder, Pen, Branches, Loader } from "../assets/icons";
import { toast } from "react-toastify";
import api from "../services/api";
import "../styles/warehouse.css";
import Select from "../components/Select";

const BranchesPage = () => {
  const [opened, setOpened] = useState(false);
  const [editing, setEditing] = useState(null);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    setFocus,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      address: "",
      phone: "",
      isActive: true,
    },
  });

  const getBranches = async () => {
    setTableLoading(true);
    try {
      const { data } = await api.get("/branches");
      setBranches(data);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    getBranches();
  }, []);

  useEffect(() => {
    if (opened) setFocus("name");
  }, [opened, setFocus]);

  const onSubmit = async (values) => {
    setLoading(true);
    const toastId = toast.loading("Загрузка...", {
      onClick: () => toast.dismiss(toastId),
    });

    try {
      if (editing) {
        await api.patch(`/branches/${editing._id}`, values);
        toast.update(toastId, {
          render: "Filial ma'lumotlari yangilandi!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      } else {
        await api.post("/branches", values);
        toast.update(toastId, {
          render: "Filial muvaffaqiyatli qo'shildi!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      }
      reset();
      setEditing(null);
      setOpened(false);
      getBranches();
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

  const handleDelete = async (id) => {
    if (window.confirm("Rostdan ham o'chirmoqchimisiz?")) {
      setLoading(true);
      try {
        await api.delete(`/branch/${id}`);
        toast.success("Filial o'chirildi");
        getBranches();
      } catch (err) {
        toast.error(err?.response?.data?.message || "Xatolik yuz berdi");
      } finally {
        setLoading(false);
      }
    }
  };

  const editBranch = (branch) => {
    setEditing(branch);
    setOpened(true);
    Object.entries(branch).forEach(([key, value]) => setValue(key, value));
  };

  const columns = [
    { key: "name", title: "Nomi" },
    { key: "address", title: "Manzil" },
    { key: "phone", title: "Telefon" },
    {
      key: "isActive",
      title: "Holati",
      render: (_, row) => row.isActive ? "Faol" : "Nofaol"
    },
    {
      title: "Amallar",
      render: (_, row) => (
        <div className="actions-row">
          <button
            onClick={() => editBranch(row)}
            disabled={loading}
          >
            <Pen />
          </button>
          <button
            onClick={() => handleDelete(row._id)}
            disabled={loading}
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
          <Branches />
          <span>Filiallar</span>
          <button
            onClick={() => {
              reset();
              setEditing(null);
              setOpened(true);
            }}
            disabled={loading}
          >
            <X size={24} color="#3F8CFF" as="+" />
            <span>Yangi filial</span>
          </button>
        </div>
        <Table
          columns={columns}
          data={branches}
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
            <span>{editing ? "Filialni tahrirlash" : "Yangi filial"}</span>
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
              label="Filial nomi"
              placeholder="Masalan: Chilonzor"
              {...register("name", { required: "Nomi majburiy" })}
              error={errors.name?.message}
              disabled={loading}
            />
            <Input
              label="Telefon raqam"
              placeholder="+9989XXXXXXX"
              {...register("phone", { required: "Telefon raqam majburiy" })}
              error={errors.phone?.message}
              disabled={loading}
            />
          </div>

          <div className="row-form">
            <Input
              label="Manzil"
              placeholder="Joylashuv manzili"
              {...register("address", { required: "Manzil majburiy" })}
              error={errors.address?.message}
              disabled={loading}
            />
            <Select
              label="Holati"
              options={[
                { label: "Faol", value: true },
                { label: "Nofaol", value: false },
              ]}
              onChange={(v) => setValue("isActive", v)}
              value={watch("isActive")}
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
                <span>{editing ? "Saqlash" : "Yaratish"}</span>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BranchesPage;
