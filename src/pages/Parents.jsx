import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Input from "../components/Input";
import Table from "../components/Table";
import { X, Upload, Trash, Pen, Service, Loader } from "../assets/icons";
import { toast } from "react-toastify";
import api from "../services/api";
import "../styles/warehouse.css";
import Select from "../components/Select";

const Parents = () => {
  const [opened, setOpened] = useState(false);
  const [editing, setEditing] = useState(null);
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);

  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);

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
      phone: "998",
      telegramId: "",
      students: [],
    },
  });

  const handlePhoneInput = (e) => {
    let input = e.target.value.replace(/\D/g, "");

    // Ограничиваем длину до 12 цифр (998 + 9 цифр)
    input = input.substring(0, 12);

    // Если номер не начинается с 998, добавляем его
    if (!input.startsWith("998")) {
      input = "998" + input;
    }

    // Форматируем номер телефона
    let formatted = "";
    if (input.length > 0) {
      formatted = "+" + input.substring(0, 3);
      if (input.length > 3) {
        formatted += " " + input.substring(3, 5);
      }
      if (input.length > 5) {
        formatted += " " + input.substring(5, 8);
      }
      if (input.length > 8) {
        formatted += " " + input.substring(8, 10);
      }
      if (input.length > 10) {
        formatted += " " + input.substring(10, 12);
      }
    }

    setValue("phone", formatted);
    return formatted;
  };

  const handlePhoneChange = (e) => {
    const formatted = handlePhoneInput(e);
    e.target.value = formatted;
  };

  const getParents = async () => {
    setTableLoading(true);
    try {
      const { data } = await api.get("/parents");
      setParents(data);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Ошибка при загрузке родителей"
      );
    } finally {
      setTableLoading(false);
    }
  };

  const getStudents = async () => {
    try {
      const { data } = await api.get("/students");
      setStudents(data);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Ошибка при загрузке учеников"
      );
    }
  };

  useEffect(() => {
    getParents();
    getStudents();
  }, []);

  const onSubmit = async (values) => {
    setLoading(true);
    values.phone = values.phone.replace(/\D/g, "");
    const toastId = toast.loading("Загрузка...", {
      onClick: () => toast.dismiss(toastId),
    });
    try {
      const submitData = {
        ...values,
        students: selectedStudents?.map((studentId) => ({ studentId })),
      };

      if (editing) {
        // Не отправляем telegramId при обновлении
        // eslint-disable-next-line no-unused-vars
        const { telegramId, ...updateValues } = submitData;
        await api.put(`/parents/${editing._id}`, updateValues);
        toast.update(toastId, {
          render: "Информация о родителе обновлена!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      } else {
        await api.post("/parents", submitData);
        toast.update(toastId, {
          render: "Родитель успешно добавлен!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      }
      reset();
      setEditing(null);
      setOpened(false);
      getParents();
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
    if (window.confirm("Вы действительно хотите удалить этого родителя?")) {
      setLoading(true);
      try {
        await api.delete(`/parents/${id}`);
        toast.success("Родитель удален");
        getParents();
      } catch (err) {
        toast.error(err?.response?.data?.message || "Произошла ошибка");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleStudentSelect = (studentIds) => {
    const ids = studentIds || [];
    setSelectedStudents(ids);
    setValue(
      "students",
      ids.map((studentId) => ({ studentId }))
    );
  };

  const editParent = (parent) => {
    setEditing(parent);
    setOpened(true);
    Object.entries(parent).forEach(([key, value]) => {
      if (key === "students") {
        const studentIds = value.map((s) => s.studentId._id);
        setSelectedStudents(studentIds);
        setValue(key, value);
      } else if (key === "phone") {
        setValue("phone", formatPhoneNumber(value));
      } else {
        setValue(key, value);
      }
    });
  };

  useEffect(() => {
    if (opened) setFocus("fullName");
  }, [opened, setFocus]);

  const formatPhoneNumber = (phone) => {
    if (!phone) return "-";
    // Предполагаем формат +998 XX XXX XX XX
    const cleaned = phone.replace(/\D/g, "");
    const match = cleaned.match(/^(\d{3})(\d{2})(\d{3})(\d{2})(\d{2})$/);
    if (match) {
      return `+${match[1]} ${match[2]} ${match[3]} ${match[4]} ${match[5]}`;
    }
    return phone;
  };

  const columns = [
    { key: "fullName", title: "ФИО" },
    {
      key: "phone",
      title: "Номер телефона",
      render: (phone) => formatPhoneNumber(phone),
    },
    { key: "telegramId", title: "Telegram ID" },
    {
      key: "students",
      title: "Дети",
      render: (students) => (
        <button
          className="primary btn"
          disabled={loading || students.length === 0}
          onClick={() =>
            alert("Дети\n" + students?.map((s) => s?.studentId?.fullName + " | " + s?.studentId?.classId?.name+ " | " + s?.studentId?.classId?.teacherId?.fullName).join("\n"))
          }
        >
          {students.length} {students.length > 1 ? "детей" : "ребёнок"}
        </button>
      ),
    },
    {
      title: "Действия",
      render: (_, row) => (
        <div className="actions-row">
          <button onClick={() => editParent(row)} disabled={loading}>
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
          <span>Родители</span>
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
          data={parents}
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
            <span>{editing ? "Редактировать родителя" : "Новый родитель"}</span>
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
            <Input
              label="Telegram ID"
              placeholder="Например, @parent_id"
              {...register("telegramId", {
                required: "Telegram ID обязателен",
              })}
              error={errors.telegramId?.message}
              disabled={loading || editing}
            />
          </div>
          <div className="row-form">
            <Input
              {...register("phone", {
                required: "Номер телефона обязателен",
                pattern: {
                  value: /^\+998 \d{2} \d{3} \d{2} \d{2}$/,
                  message: "Введите корректный номер телефона",
                },
              })}
              label="Номер телефона"
              placeholder="+998 90 123 45 67"
              error={errors.phone?.message}
              value={watch("phone")}
              onChange={handlePhoneChange}
              disabled={loading}
            />
          </div>
          <div className="row-form">
            <Select
              label="Ученики"
              options={students?.map((student) => ({
                label: student.fullName,
                value: student._id,
              }))}
              value={selectedStudents}
              onChange={handleStudentSelect}
              error={errors.students?.message}
              disabled={loading}
              multiple={true}
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

export default Parents;
