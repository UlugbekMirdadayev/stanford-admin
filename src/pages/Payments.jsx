import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Input from "../components/Input";
import Table from "../components/Table";
import Select from "../components/Select"; // Sizning tayyor custom Select
import { X, Upload, Time, Pen, Trash } from "../assets/icons";
import "../styles/warehouse.css";

const dummyClients = [
  { id: 1, fullName: "Ali Valiev" },
  { id: 2, fullName: "Malika Oripova" },
];

const dummyPayments = [
  {
    id: 1,
    clientId: 1,
    clientName: "Ali Valiev",
    amount: 500000,
    paymentType: "Naqd",
    date: "2025-05-01",
    description: "Qisman to‘lov",
  },
];

const Payments = () => {
  const [opened, setOpened] = useState(false);
  const [editing, setEditing] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    setFocus,
    formState: { errors },
  } = useForm({
    defaultValues: {
      clientId: "",
      amount: "",
      paymentType: "",
      date: new Date().toISOString().slice(0, 10),
      description: "",
    },
  });

  useEffect(() => {
    if (editing) {
      Object.entries(editing).forEach(([key, val]) => setValue(key, val));
    } else {
      reset({
        clientId: "",
        amount: "",
        paymentType: "",
        date: new Date().toISOString().slice(0, 10),
        description: "",
      });
    }
  }, [editing, setValue, reset]);

  useEffect(() => {
    if (opened) setFocus("clientId");
  }, [opened, setFocus]);

  const onSubmit = (data) => {
    const client = dummyClients.find((c) => c.id === +data.clientId);
    data.clientName = client?.fullName || "";

    if (editing) {
      console.log("To‘lov tahrirlandi:", data);
    } else {
      console.log("To‘lov qo‘shildi:", data);
    }

    reset();
    setEditing(null);
    setOpened(false);
  };

  const columns = [
    { key: "clientName", title: "Mijoz" },
    { key: "date", title: "Sana" },
    { key: "amount", title: "To‘lov summasi" },
    { key: "paymentType", title: "To‘lov turi" },
    { key: "description", title: "Izoh" },
    {
      title: "Amallar",
      render: (_, row) => (
        <div className="actions-row">
          <button
            onClick={() => {
              setEditing(row);
              setOpened(true);
            }}
          >
            <Pen />
          </button>
          <button onClick={() => console.log("delete", row)}>
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
          <Time />
          <span>To‘lovlar tarixi</span>
          <button
            onClick={() => {
              reset();
              setEditing(null);
              setOpened(true);
            }}
          >
            <X size={24} color="#3F8CFF" as="+" />
            <span>Yangi to‘lov</span>
          </button>
        </div>

        <Table
          columns={columns}
          data={dummyPayments}
          sortable={true}
          pagination={true}
          pageSize={10}
        />
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className={`driwer-form${opened ? " opened" : ""}`}
      >
        <div className="form-body">
          <div className="page-header">
            <Upload />
            <span>{editing ? "To‘lovni tahrirlash" : "Yangi to‘lov"}</span>
            <button
              type="button"
              onClick={() => {
                reset();
                setEditing(null);
                setOpened(false);
              }}
            >
              <X size={24} color="#3F8CFF" />
              <span>Yopish</span>
            </button>
          </div>

          <div className="row-form">
            <Select
              options={dummyClients.map((c) => ({
                label: c.fullName,
                value: c.id,
              }))}
              label="Mijoz"
              value={watch("clientId")}
              onChange={(val) => setValue("clientId", val)}
            />
            {errors.clientId && (
              <p className="error">{errors.clientId.message}</p>
            )}

            <Input
              label="To‘lov summasi"
              type="number"
              placeholder="Masalan: 500000"
              {...register("amount", { required: "Summani kiriting" })}
              error={errors.amount?.message}
            />
          </div>

          <div className="row-form">
            <Select
              options={[
                { label: "Naqd", value: "Naqd" },
                { label: "Kartochka", value: "Kartochka" },
              ]}
              label="To'lov turi"
              value={watch("paymentType")}
              onChange={(val) => setValue("paymentType", val)}
            />
            {errors.paymentType && (
              <p className="error">{errors.paymentType.message}</p>
            )}

            <Input
              label="Sana"
              type="date"
              {...register("date", { required: "Sana majburiy" })}
              error={errors.date?.message}
            />
          </div>

          <div className="row-form">
            <Input
              label="Izoh"
              placeholder="Izoh kiriting"
              {...register("description")}
            />
          </div>

          <div className="row-form">
            <button
              type="reset"
              className="btn secondary"
              onClick={() => reset()}
            >
              <span>Tozalash</span>
            </button>
            <button type="submit" className="btn primary">
              <span>{editing ? "Saqlash" : "Yaratish"}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Payments;
