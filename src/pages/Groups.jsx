import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Input from "../components/Input";
import Table from "../components/Table";
import Select from "../components/Select";
import { X, Upload, Trash, Pen, Service, Loader } from "../assets/icons";
import { toast } from "react-toastify";
import api from "../services/api";
import "../styles/warehouse.css";

const Groups = () => {
  const [opened, setOpened] = useState(false);
  const [editing, setEditing] = useState(null);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
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
      name: "",
      teacherId: "",
    },
  });

  const getClasses = async () => {
    setTableLoading(true);
    try {
      const { data } = await api.get("/classes");
      setClasses(data);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Ошибка при загрузке классов"
      );
    } finally {
      setTableLoading(false);
    }
  };

  const getTeachers = async () => {
    try {
      const { data } = await api.get("/teachers");
      setTeachers(data);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Ошибка при загрузке учителей"
      );
    }
  };

  useEffect(() => {
    getClasses();
    getTeachers();
  }, []);

  const onSubmit = async (values) => {
    setLoading(true);
    const toastId = toast.loading("Загрузка...", {
      onClick: () => toast.dismiss(toastId),
    });

    try {
      if (editing) {
        await api.put(`/classes/${editing._id}`, values);
        toast.update(toastId, {
          render: "Информация о классе обновлена!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      } else {
        await api.post("/classes", values);
        toast.update(toastId, {
          render: "Класс успешно добавлен!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      }
      reset();
      setEditing(null);
      setOpened(false);
      getClasses();
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
    if (window.confirm("Вы действительно хотите удалить этот класс?")) {
      setLoading(true);
      try {
        await api.delete(`/classes/${id}`);
        toast.success("Класс удален");
        getClasses();
      } catch (err) {
        toast.error(err?.response?.data?.message || "Произошла ошибка");
      } finally {
        setLoading(false);
      }
    }
  };

  const editClass = (classItem) => {
    setEditing(classItem);
    setOpened(true);
    Object.entries(classItem).forEach(([key, value]) => {
      if (key === "teacherId" && value) {
        setValue(key, value._id);
      } else {
        setValue(key, value);
      }
    });
  };

  useEffect(() => {
    if (opened) setFocus("name");
  }, [opened, setFocus]);

  const columns = [
    { key: "name", title: "Название класса" },
    {
      key: "teacherId",
      title: "Классный руководитель",
      render: (_, row) => row.teacherId?.fullName || "-",
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
          <button onClick={() => editClass(row)} disabled={loading}>
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
          <span>Классы</span>
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
          data={classes}
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
            <span>{editing ? "Редактировать класс" : "Новый класс"}</span>
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
              label="Название класса"
              placeholder="Например, 5-A"
              {...register("name", { required: "Название класса обязательно" })}
              error={errors.name?.message}
              disabled={loading}
            />
            <Select
              label="Классный руководитель"
              options={teachers.map((teacher) => ({
                label: teacher.fullName,
                value: teacher._id,
              }))}
              value={watch("teacherId")}
              onChange={(v) => setValue("teacherId", v)}
              error={errors.teacherId?.message}
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

export default Groups;
