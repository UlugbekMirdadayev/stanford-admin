import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Input from "../components/Input";
import Table from "../components/Table";
import Select from "../components/Select";
import { X, Upload, Trash, Pen, Service, Loader } from "../assets/icons";
import { toast } from "react-toastify";
import api from "../services/api";
import "../styles/warehouse.css";

const Teachers = () => {
  const [opened, setOpened] = useState(false);
  const [editing, setEditing] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
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
      telegramId: "",
      classId: "",
    },
  });

  const getTeachers = async () => {
    setTableLoading(true);
    try {
      const { data } = await api.get("/teachers");
      setTeachers(data);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Ошибка при загрузке учителей"
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

  useEffect(() => {
    getTeachers();
    getClasses();
  }, []);

  const onSubmit = async (values) => {
    setLoading(true);
    const toastId = toast.loading("Загрузка...", {
      onClick: () => toast.dismiss(toastId),
    });
    try {
      if (editing) {
        // eslint-disable-next-line no-unused-vars
        const { telegramId, ...updateValues } = values;
        await api.put(`/teachers/${editing._id}`, updateValues);
        toast.update(toastId, {
          render: "Информация об учителе обновлена!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      } else {
        await api.post("/teachers", values);
        toast.update(toastId, {
          render: "Учитель успешно добавлен!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      }
      reset();
      setEditing(null);
      setOpened(false);
      getTeachers();
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
    if (window.confirm("Вы действительно хотите удалить?")) {
      setLoading(true);
      try {
        await api.delete(`/teachers/${id}`);
        toast.success("Учитель удален");
        getTeachers();
      } catch (err) {
        toast.error(err?.response?.data?.message || "Произошла ошибка");
      } finally {
        setLoading(false);
      }
    }
  };

  const editTeacher = (teacher) => {
    setEditing(teacher);
    setOpened(true);
    Object.entries(teacher).forEach(([key, value]) => {
      if (key === "classId") {
        setValue(key, value._id);
      } else {
        setValue(key, value);
      }
    });
  };

  useEffect(() => {
    if (opened) setFocus("fullName");
  }, [opened, setFocus]);

  const columns = [
    { key: "fullName", title: "ФИО" },
    { key: "telegramId", title: "Telegram ID" },
    {
      key: "classId",
      title: "Класс",
      render: (_, row) => row.classId?.name || "-",
    },
    {
      key: "createdAt",
      title: "Дата создания",
      render: (_, row) => new Date(row.createdAt).toLocaleDateString("ru-RU"),
    },
    {
      title: "Действия",
      render: (_, row) => (
        <div className="actions-row">
          <button onClick={() => editTeacher(row)} disabled={loading}>
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
          <span>Учителя</span>
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
          data={teachers}
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
            <span>{editing ? "Редактировать учителя" : "Новый учитель"}</span>
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
            />{" "}
            <Input
              label="Telegram ID"
              placeholder="Например, @teacher_id"
              {...register("telegramId", {
                required: "Telegram ID обязателен",
              })}
              error={errors.telegramId?.message}
              disabled={loading || editing}
            />
          </div>

          <div className="row-form">
            <Select
              label="Класс"
              options={classes.map((cls) => ({
                label: cls.name,
                value: cls._id,
              }))}
              value={watch("classId")}
              onChange={(v) => setValue("classId", v)}
              error={errors.classId?.message}
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

export default Teachers;
