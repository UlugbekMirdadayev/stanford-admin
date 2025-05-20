import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Input from "../components/Input";
import Table from "../components/Table";
import Select from "../components/Select";
import { X, Upload, Trash, Pen, Service, Loader } from "../assets/icons";
import { toast } from "react-toastify";
import api from "../services/api";
import "../styles/warehouse.css";

const Students = () => {
  const [opened, setOpened] = useState(false);
  const [editing, setEditing] = useState(null);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [parents, setParents] = useState([]);
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
  } = useForm({
    defaultValues: {
      fullName: "",
      classId: "",
      parentId: "",
      currentStatus: "uyda",
      estimatedTime: "",
    },
  });

  const getStudents = async () => {
    setTableLoading(true);
    try {
      const { data } = await api.get("/students");
      setStudents(data);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Ошибка при загрузке учеников"
      );
    } finally {
      setTableLoading(false);
    }
  };

  const getClasses = async () => {
    try {
      const { data } = await api.get("/classes");
      setClasses(data);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Ошибка при загрузке классов"
      );
    }
  };

  const getParents = async () => {
    try {
      const { data } = await api.get("/parents");
      setParents(data);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Ошибка при загрузке родителей"
      );
    }
  };

  useEffect(() => {
    getStudents();
    getClasses();
    getParents();
  }, []);

  const onSubmit = async (values) => {
    setLoading(true);
    const toastId = toast.loading("Загрузка...", {
      onClick: () => toast.dismiss(toastId),
    });

    try {
      if (editing) {
        await api.put(`/students/${editing._id}`, values);
        toast.update(toastId, {
          render: "Информация об ученике обновлена!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      } else {
        await api.post("/students", values);
        toast.update(toastId, {
          render: "Ученик успешно добавлен!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      }
      reset();
      setEditing(null);
      setOpened(false);
      getStudents();
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Ошибка, попробуйте снова!";

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
    if (window.confirm("Вы действительно хотите удалить этого ученика?")) {
      setLoading(true);
      try {
        await api.delete(`/students/${id}`);
        toast.success("Ученик удален");
        getStudents();
      } catch (err) {
        toast.error(err?.response?.data?.message || "Произошла ошибка");
      } finally {
        setLoading(false);
      }
    }
  };

  const editStudent = (student) => {
    setEditing(student);
    setOpened(true);
    Object.entries(student).forEach(([key, value]) => {
      if ((key === "classId" || key === "parentId") && value) {
        setValue(key, value._id);
      } else {
        setValue(key, value);
      }
    });
  };

  useEffect(() => {
    if (opened) setFocus("fullName");
  }, [opened, setFocus]);

const getStatusLabel = (status) => {
    switch (status) {
      case "uyga_keldi":
        return "🏡 Uyga yetib keldi";
      case "uyga_ketmoqda":
        return "🏠 Uyga tomon yo'lda";
      case "maktabga_ketmoqda":
        return "🏫 Maktab tomon yo'lda";
      case "maktabga_keldi":
        return "🏢 Maktabga yetib keldi";
      default:
        return status;
    }
  };


  const columns = [
    { key: "fullName", title: "ФИО" },
    {
      key: "classId",
      title: "Класс",
      render: (_, row) => row.classId?.name || "-",
    },
    {
      key: "parentId",
      title: "Родитель",
      render: (_, row) => row.parentId?.fullName || "-",
    },
    {
      key: "currentStatus",
      title: "Текущий статус",
      render: (status) => getStatusLabel(status),
    },
    { 
      key: "estimatedTime", 
      title: "Расчетное время",
      render: (time) => time || "-",
    },
    {
      title: "Действия",
      render: (_, row) => (
        <div className="actions-row">
          <button onClick={() => editStudent(row)} disabled={loading}>
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
          <Service />
          <span>Ученики</span>
          <button
            onClick={() => {
              reset();
              setEditing(null);
              setOpened(true);
            }}
            disabled={loading}
          >
            <X size={24} color="#3F8CFF" as="+" />
            <span>Добавить</span>
          </button>
        </div>
        <Table
          columns={columns}
          data={students}
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
            <span>{editing ? "Редактировать ученика" : "Новый ученик"}</span>
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
              <span>Закрыть</span>
            </button>
          </div>

          <div className="row-form">
            <Input
              label="ФИО"
              placeholder="Например, Иванов Иван Иванович"
              {...register("fullName", { required: "ФИО обязательно" })}
              error={errors.fullName?.message}
              disabled={loading}
            />
            <Select
              label="Класс"
              options={classes.map((cls) => ({
                label: cls.name,
                value: cls._id,
              }))}
              value={watch("classId")}
              onChange={(v) => setValue("classId", v)}
              error={errors.classId?.message}
              required
              disabled={loading}
            />
          </div>

          <div className="row-form">
            <Select
              label="Родитель"
              options={parents.map((parent) => ({
                label: parent.fullName,
                value: parent._id,
              }))}
              value={watch("parentId")}
              onChange={(v) => setValue("parentId", v)}
              error={errors.parentId?.message}
              disabled={loading}
            />
            <Select
              label="Текущий статус"
              options={[
                { label: "🏡 Uyga yetib keldi", value: "uyga_keldi" },
                { label: "🏠 Uyga tomon yo'lda", value: "uyga_ketmoqda" },
                { label: "🏫 Maktab tomon yo'lda", value: "maktabga_ketmoqda" },
                { label: "🏢 Maktabga yetib keldi", value: "maktabga_keldi" },
              ]}
              value={watch("currentStatus")}
              onChange={(v) => setValue("currentStatus", v)}
              error={errors.currentStatus?.message}
              required
              disabled={loading}
            />
          </div>

          <div className="row-form">
            <Input
              label="Расчетное время"
              placeholder="Например, 15 минут"
              {...register("estimatedTime")}
              error={errors.estimatedTime?.message}
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
              <span>Очистить</span>
            </button>
            <button type="submit" className="btn primary" disabled={loading}>
              {loading ? (
                <Loader size={24} />
              ) : (
                <span>{editing ? "Сохранить" : "Добавить"}</span>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Students;
