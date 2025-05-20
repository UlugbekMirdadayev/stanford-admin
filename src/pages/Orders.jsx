import React, { useState, useEffect, useMemo } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import Input from "../components/Input";
import Table from "../components/Table";
import Select from "../components/Select";
import { X, Upload, Trash, Truck, Pen, Loader } from "../assets/icons";
import { toast } from "react-toastify";
import api from "../services/api";
import "../styles/warehouse.css";
import { useSelector } from "react-redux";
import moment from "moment/min/moment-with-locales";

const paymentTypeOptions = [
  { label: "Naqd", value: "cash" },
  { label: "Karta", value: "card" },
  {
    label: "Nasiya",
    value: "debt",
  },
];

const OrdersPage = () => {
  const { user } = useSelector(({ user }) => user)
  const [orders, setOrders] = useState([]);
  const [opened, setOpened] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);

  const [clients, setClients] = useState([]);
  const [branches, setBranches] = useState([]);
  const [productsList, setProductsList] = useState([]);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      client: user.isVip ? user?._id : "",
      branch: user.isVip ? user?.branch : "",
      orderType: user.isVip ? "vip" : "regular",
      products: [{ product: "", quantity: 1, price: 0 }],
      paymentType: "cash",
      paidAmount: 0,
      notes: "",
      date_returned: null,
    },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "products",
    rules: {
      required: "Kamida bitta mahsulot qo'shish kerak",
      minLength: {
        value: 1,
        message: "Kamida bitta mahsulot qo'shish kerak"
      }
    }
  });

  const handleProductChange = (productId, index) => {
    // Проверяем, есть ли уже такой продукт в списке
    const existingProductIndex = fields.findIndex(
      (field, i) => i !== index && field.product === productId
    );

    if (existingProductIndex !== -1) {
      // Если продукт уже существует, показываем ошибку
      toast.error("Bu mahsulot allaqachon qo'shilgan");
      return;
    }

    // Если продукт новый, обновляем значения
    setValue(`products.${index}.product`, productId, { shouldValidate: true });
    const product = productsList.find((p) => p._id === productId);
    if (product) {
      setValue(`products.${index}.price`, product.price, { shouldValidate: true });
    }
  };

  const handleAddProduct = () => {
    const newProduct = { product: "", quantity: 1, price: 0 };
    append(newProduct);
  };

  const fetchOrders = async () => {
    setTableLoading(true);
    try {
      const { data } = await api.get("/orders" + (user?.isVip ? `?client=${user?._id}` : ""));
      setOrders(data);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      setTableLoading(false);
    }
  };

  const fetchClients = async () => {
    if (user?.isVip) return;
    try {
      const { data } = await api.get("/clients");
      setClients(data);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Mijozlar yuklanmadi");
    }
  };

  const fetchBranches = async () => {
    if (user?.isVip) return;
    try {
      const { data } = await api.get("/branches");
      setBranches(data);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Filiallar yuklanmadi");
    }
  };

  const fetchProducts = async () => {
    try {
      const { data } = await api.get("/products");
      setProductsList(data);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Mahsulotlar yuklanmadi");
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchClients();
    fetchBranches();
    fetchProducts();
  }, [user?.isVip]);

  useEffect(() => {
    if (user?.isVip) {
      setValue('client', user?._id);
      setClients([user])
    }
  }, [user, setValue])


  const onSubmit = async (values) => {
    // Проверяем, что все продукты выбраны
    const hasEmptyProducts = values.products.some(p => !p.product);
    if (hasEmptyProducts) {
      toast.error("Barcha mahsulotlarni tanlang");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Загрузка...", {
      onClick: () => toast.dismiss(toastId),
    });

    try {
      // Вычисляем общую сумму
      const totalAmount = values.products.reduce(
        (sum, item) => sum + (item.quantity * item.price), 0
      );

      const submitData = {
        ...values,
        paidAmount: Number(values.paidAmount),
        totalAmount,
        debtAmount: values.paymentType === "debt" ? Number(Math.max(totalAmount - values.paidAmount, 0)) : 0,
        date_returned: values.paymentType === "debt" ? values.date_returned : null,
      };

      if (editing) {
        await api.patch(`/orders/${editing._id}`, submitData);
        toast.update(toastId, {
          render: "Buyurtma ma'lumotlari yangilandi!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      } else {
        await api.post("/orders", submitData);
        toast.update(toastId, {
          render: "Buyurtma muvaffaqiyatli qo'shildi!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      }
      reset();
      setEditing(null);
      setOpened(false);
      fetchOrders();
    } catch (err) {
      const message =
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
        await api.delete(`/orders/${id}`);
        toast.success("Buyurtma o'chirildi");
        fetchOrders();
      } catch (err) {
        toast.error(err?.response?.data?.message || "Xatolik yuz berdi");
      } finally {
        setLoading(false);
      }
    }
  };

  const editOrder = (order) => {
    setEditing(order);
    setOpened(true);
    Object.entries(order).forEach(([key, value]) => {
      if (key === "client" && value) {
        setValue(key, value._id);
      } else if (key === "branch" && value) {
        setValue(key, value._id);
      } else if (key === "products") {
        if (Array.isArray(value)) {
          value.map((p, index) => {
            setValue(`products.${index}.product`, p?.product?._id, { shouldValidate: true })
            setValue(`products.${index}.price`, p?.price, { shouldValidate: true })
            setValue(`products.${index}.quantity`, p?.quantity, { shouldValidate: true })
            return key;
          })
        }
      } else {
        setValue(key, value);
      }
    });
  };

  const columns = [
    {
      key: "client",
      title: "Mijoz",
      render: (_, row) => row.client?.fullName || "-",
    },
    {
      key: "branch",
      title: "Filial",
      render: (_, row) => row.branch?.name || "-",
    },
    {
      key: "orderType",
      title: "Buyurtma",
      render: (val) => (val === "vip" ? "VIP mijoz bergan" : "Admin tomonidan berilgan"),
    },
    {
      key: "totalAmount",
      title: "Jami",
      render: (val) => `${val?.toLocaleString()} so'm`,
    },
    {
      key: "paymentType",
      title: "To'lov turi",
      render: (val) => paymentTypeOptions.find(item => item.value === val)?.label || "-"
    },
    {
      key: "paidAmount",
      title: "To'langan",
      render: (val) => `${val?.toLocaleString()} so'm`,
    },
    {
      key: "debtAmount",
      title: "Qarz",
      render: (val) => `${val?.toLocaleString()} so'm`,
    },
    {
      key: "date_returned",
      title: "Qarz muddati",
      render: (val) => val ? moment(val).format('LL') : "-",
    },
    {
      key: "createdAt",
      title: "Yaratilgan sana",
      render: (val) => moment(val).format('LLLL'),
    },
    {
      key: "updatedAt",
      title: "Yangilangan sana",
      render: (val) => moment(val).format('LLLL'),
    },
    {
      key: "notes",
      title: "Izoh",
    },
    (!user?.isVip && {
      title: "Amallar",
      render: (_, row) => (
        <div className="actions-row">
          <button onClick={() => editOrder(row)} disabled={loading}>
            <Pen />
          </button>
          <button onClick={() => handleDelete(row._id)} disabled={loading}>
            <Trash />
          </button>
        </div>
      ),
    })
  ];

  const productsWatch = watch("products");
  const paidAmountWatch = Number(watch("paidAmount") || 0);
  const paymentTypeWatch = watch("paymentType");
  const totalAmount = productsWatch.reduce(
    (sum, item) => sum + (Number(item.quantity) * Number(item.price)), 0
  );
  const debtAmount = paymentTypeWatch === "debt" ? Math.max(totalAmount - paidAmountWatch, 0) : 0;

  // Auto-set paymentType based on paidAmount and totalAmount
  // Replace the existing useEffect for payment type
  useEffect(() => {
    if (paidAmountWatch > totalAmount) {
      // If paid amount is more than total, reset it to total
      setValue("paidAmount", totalAmount, { shouldValidate: true });
    } else if (paidAmountWatch < totalAmount && paymentTypeWatch !== "debt") {
      // If paid amount is less than total and not debt, switch to debt
      setValue("paymentType", "debt", { shouldValidate: true });
      if (!clients?.find(c => c?._id === watch('client'))?.isVip) {
        setValue("client", null, { shouldValidate: true });
      }
    } else if (paidAmountWatch === totalAmount && paymentTypeWatch === "debt") {
      // If paid equals total and currently debt, switch to cash
      setValue("paymentType", "cash", { shouldValidate: true });
    }
  }, [paidAmountWatch, totalAmount, paymentTypeWatch, setValue, clients]);

  // Add this useEffect after your other effects
  useEffect(() => {
    const currentPaid = Number(watch("paidAmount")) || 0;
    if (currentPaid > totalAmount) {
      setValue("paidAmount", totalAmount, { shouldValidate: true });
    }
  }, [totalAmount, setValue, watch]);

  const minDateReturned = useMemo(() => {
    const currentUTC = new Date(watch('createdAt') || Date.now());
    const minDate = new Date(currentUTC);
    minDate.setDate(currentUTC.getDate() + 7);
    return minDate.toISOString().split('T')[0];
  }, [watch])


  return (
    <div className="page row-warehouse">
      <div className="page-details">
        <div className="page-header">
          <Truck color="#3f8cff" />
          <span>Buyurtmalar</span>
          <button
            onClick={() => {
              reset();
              setEditing(null);
              setOpened(true);
            }}
            disabled={loading}
          >
            <X size={24} color="#3F8CFF" as="+" />
            <span>Yangi buyurtma</span>
          </button>
        </div>
        <Table
          columns={columns}
          data={orders}
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
            <span>{editing ? "Buyurtmani tahrirlash" : "Yangi buyurtma"}</span>
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

          {user?.isVip ? null : <div className="row-form">
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
                  onChange={v => {
                    field.onChange(v);
                    if (!clients?.find(({ _id }) => _id === v)?.isVip) {
                      setValue("paymentType", "cash")
                    }
                  }}
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
          </div>}


          <div className="row-form">
            <Controller
              control={control}
              name="paymentType"
              rules={{ required: "To'lov turi majburiy" }}
              render={({ field }) => (
                <Select
                  label="To'lov turi"
                  options={paymentTypeOptions}
                  value={field.value}
                  onChange={v => {
                    const client = clients?.find(({ _id }) => _id === watch('client'));
                    if (!client?.isVip && v === "debt") {
                      toast.info(`Mijoz: ${client?.fullName} VIP emas`);
                      return;
                    }

                    if (v !== "debt" && paidAmountWatch < totalAmount) {
                      toast.info("To'liq summa to'lanmagan. Nasiya usulini tanlang");
                      return;
                    }

                    field.onChange(v);
                  }}
                  error={errors.paymentType?.message}
                  required
                  disabled={loading}
                />
              )}
            />
          </div>

          <div className="row-form">
            <Input
              label="To'langan summa"
              type="number"
              {...register("paidAmount", {
                required: "To'langan summa majburiy",
                min: { value: 0, message: "To'langan summa 0 dan kam bo'lmasligi kerak" },
                validate: (value) => {
                  const numValue = Number(value) || 0;
                  if (paymentTypeWatch !== "debt" && numValue < totalAmount) {
                    return "Naqd/karta to'lovda to'liq summa to'lanishi kerak";
                  }
                  if (paymentTypeWatch === "debt" && numValue > totalAmount) {
                    return "To'langan summa umumiy summadan oshmasligi kerak";
                  }
                  return true;
                }
              })}
              error={errors.paidAmount?.message}
              disabled={loading}
            />


          </div>

          {paymentTypeWatch === "debt" && (
            <div className="row-form">
              <Input
                label="Qarz miqdori"
                value={debtAmount}
                disabled
              />
              <Input
                label="Qarz qaytarilish sanasi"
                type="datetime-local"
                min={minDateReturned}
                {...register("date_returned", {
                  required: "Qarz uchun muddat majburiy",
                  validate: (value) => {
                    if (!value) return "Qarz uchun muddat majburiy";
                    return value >= minDateReturned || `Sanani ${minDateReturned} dan keyin tanlang`;
                  }
                })}
                error={errors.date_returned?.message}
                disabled={loading}
              />
            </div>
          )}

          <div className="row-form">
            <Input
              label="Izoh"
              {...register("notes", {
                maxLength: {
                  value: 500,
                  message: "Izoh 500 ta belgidan oshmasligi kerak"
                }
              })}
              error={errors.notes?.message}
              disabled={loading}
            />
          </div>

          <div className="products-list">
            <div className="products-header">
              <h3>Mahsulotlar</h3>
            </div>

            {fields.map((field, index) => (
              <React.Fragment key={field.id}>
                <div>
                  <Controller
                    control={control}
                    name={`products.${index}.product`}
                    rules={{ required: "Mahsulot majburiy" }}
                    render={({ field: productField }) => (
                      <Select
                        label="Mahsulot"
                        options={productsList
                          .filter(product =>
                            !fields.some((f, i) =>
                              i !== index && f.product === product._id
                            )
                          )
                          .map((product) => ({
                            label: product.name,
                            value: product._id,
                          }))}
                        value={productField.value}
                        onChange={(v) => {
                          handleProductChange(v, index);
                          productField.onChange(v);
                        }}
                        error={errors.products?.[index]?.product?.message}
                        required
                        disabled={loading}
                      />
                    )}
                  />
                  <Input
                    label="Miqdori"
                    type="number"
                    {...register(`products.${index}.quantity`, {
                      required: "Miqdor majburiy",
                      min: {
                        value: 1,
                        message: "Miqdor 1 dan katta bo'lishi kerak"
                      }
                    })}
                    required
                    error={errors.products?.[index]?.quantity?.message}
                    disabled={loading}
                  />
                  <Input
                    label="Narxi"
                    type="number"
                    {...register(`products.${index}.price`, {
                      required: "Narx majburiy",
                      min: {
                        value: 0,
                        message: "Narx 0 dan katta bo'lishi kerak"
                      }
                    })}
                    required
                    error={errors.products?.[index]?.price?.message}
                    disabled={loading}
                  />
                </div>
                <button
                  type="button"
                  className="btn secondary"
                  onClick={() => remove(index)}
                  disabled={loading || fields.length === 1}
                >
                  <Trash color="#fff" />
                </button>
              </React.Fragment>
            ))}
          </div>
          <div className="row-form">
            <button
              type="button"
              className="btn primary"
              onClick={handleAddProduct}
              disabled={loading}
            >
              <X size={24} color="#fff" as="+" />
              <span>Yana Qo'shish</span>
            </button>
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

export default OrdersPage;
