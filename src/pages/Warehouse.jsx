import React, { useEffect, useState } from "react";
import { Pen, Trash, Upload, WereHouse, X, Loader } from "../assets/icons";
import Table from "../components/Table";
import "../styles/warehouse.css";
import Input from "../components/Input";
import Select from "../components/Select";
import { useForm } from "react-hook-form";
import api from "../services/api";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";


const Warehouse = () => {
  const [opened, setOpened] = useState(false);
  const [openedBatch, setOpenedBatch] = useState(false);
  const [products, setProducts] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editBatchId, setEditBatchId] = useState(null);
  const { user } = useSelector(({ user }) => user);

  const {
    register: registerProduct,
    setValue: setValueProduct,
    formState: { errors: errorsProduct },
    handleSubmit: handleSubmitProduct,
    reset: resetProduct,
    watch: watchProduct,
  } = useForm({
    defaultValues: {
      name: "",
      price: "",
      quantity: "",
      batch_number: "",
    },
  });

  const {
    register: registerBatch,
    setValue: setValueBatch,
    formState: { errors: errorsBatch },
    handleSubmit: handleSubmitBatch,
    reset: resetBatch,
    watch: watchBatch,
  } = useForm({
    defaultValues: {
      batch_number: "",
    },
  });

  // Fetch products and batches
  const fetchProducts = async () => {
    setTableLoading(true);
    try {
      const res = await api.get("/products");
      setProducts(res.data);
    } catch (err) {
      toast.error("Error fetching products: " + (err.response?.data?.message || err.message));
    } finally {
      setTableLoading(false);
    }
  };

  const fetchBatches = async () => {
    setTableLoading(true);
    try {
      const res = await api.get("/batches");
      setBatches(res.data);
    } catch (err) {
      toast.error("Error fetching batches: " + (err.response?.data?.message || err.message));
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchBatches();
  }, []);

  // CRUD for products
  const createProduct = async (data) => {
    setLoading(true);
    try {
      const res = await api.post("/products", data);
      setProducts((prev) => [res.data, ...prev]);
    } catch (err) {
      toast.error("Error creating product: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (id, data) => {
    setLoading(true);
    try {
      const res = await api.patch(`/products/${id}`, data);
      setProducts((prev) => prev.map((p) => (p._id === id ? res.data : p)));
    } catch (err) {
      toast.error("Error updating product: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    setLoading(true);
    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      toast.error("Error deleting product: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // CRUD for batches
  const createBatch = async (data) => {
    setLoading(true);
    try {
      const res = await api.post("/batches", data);
      setBatches((prev) => [res.data, ...prev]);
    } catch (err) {
      toast.error("Error creating batch: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const updateBatch = async (batch_number, data) => {
    setLoading(true);
    try {
      const res = await api.patch(`/batches/${batch_number}`, data);
      setBatches((prev) => prev.map((b) => (b.batch_number === batch_number ? res.data : b)));
    } catch (err) {
      toast.error("Error updating batch: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const deleteBatch = async (batch_number) => {
    setLoading(true);
    try {
      await api.delete(`/batches/${batch_number}`);
      setBatches((prev) => prev.filter((b) => b.batch_number !== batch_number));
    } catch (err) {
      toast.error("Error deleting batch: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Form submit handlers
  const onSubmit = async (values) => {
    const payload = {
      name: values.name,
      price: Number(values.price),
      quantity: Number(values.quantity),
      createdBy: user._id,
      batch_number: values.batch_number,
    };
    if (editId) {
      await updateProduct(editId, payload);
    } else {
      await createProduct(payload);
    }
    resetProduct();
    setOpened(false);
    setEditId(null);
    fetchProducts();
  };

  const onBatchSubmit = async (values) => {
    if (editBatchId) {
      await updateBatch(editBatchId, values);
    } else {
      await createBatch(values);
    }
    resetBatch();
    setOpenedBatch(false);
    setEditBatchId(null);
    fetchBatches();
  };

  // Edit handlers
  const handleEdit = (obj) => {
    setOpened(true);
    Object.entries(obj).forEach(([key, value]) => setValueProduct(key, value));
    setEditId(obj._id);
  };

  const handleDelete = (id) => {
    if (window.confirm("O'chirishni xohlaysizmi?")) {
      deleteProduct(id);
    }
  };

  const handleBatchEdit = (batch) => {
    setOpenedBatch(true);
    setValueBatch("batch_number", batch.batch_number);
    setEditBatchId(batch.batch_number);
  };

  const handleBatchDelete = (id) => {
    if (window.confirm("O'chirishni xohlaysizmi?")) {
      deleteBatch(id);
    }
  };

  // Table columns
  const columns = [
    { key: "name", title: "Nomi" },
    { key: "price", title: "Narxi" },
    { key: "quantity", title: "Miqdori" },
    { key: "batch_number", title: "Partiya Raqami" },
    { key: "createdBy", title: "Yaratgan", render: (_, row) => row.createdBy?.fullName || "-" },
    {
      title: "Amallar",
      render: (_, obj) => (
        <div className="actions-row">
          <button type="button" onClick={() => handleEdit(obj)} disabled={loading}><Pen /></button>
          <button type="button" onClick={() => handleDelete(obj._id)} disabled={loading}><Trash /></button>
        </div>
      ),
    },
  ];

  // Batch table columns
  const batchColumns = [
    { key: "batch_number", title: "Partiya raqami" },
    {
      key: "actions",
      title: "Amallar",
      render: (_, obj) => (
        <div className="actions-row">
          <button type="button" onClick={() => handleBatchEdit(obj)} disabled={loading}><Pen /></button>
          <button type="button" onClick={() => handleBatchDelete(obj.batch_number)} disabled={loading}><Trash /></button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Escape") {
        setOpened(false);
        setOpenedBatch(false);
        setEditId(null);
        setEditBatchId(null);
        resetProduct();
        resetBatch();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [resetProduct, resetBatch]);

  return (
    <div className="page row-warehouse">
      <div className="page-details">
        <div className="page-header">
          <WereHouse />
          <span>Ombor Moduli</span>
          <button
            onClick={() => {
              setOpenedBatch(true);
              setValueBatch(
                "batch_number",
                Math.random().toString(36).substring(2, 8).toUpperCase()
              );
            }}
          >
            <X size={24} color="#3F8CFF" as="+" />
            <span>Partiya qo'shish</span>
          </button>
          <button
            onClick={() => {
              setOpened(true);
              resetProduct();
              setEditId(null);
            }}
          >
            <X size={24} color="#3F8CFF" as="+" />
            <span>{editId ? "Yangilash" : "Qo'shish"}</span>
          </button>
        </div>
        <h1 className="title-page">Maxsulotlar</h1>
        <Table
          columns={columns}
          data={products}
          onRowClick={(row) => console.log(row)}
          sortable={true}
          pagination={true}
          pageSize={10}
          tableLoading={tableLoading}
        />


      </div>
      {/* Product Form */}
      <form
        onSubmit={handleSubmitProduct(onSubmit)}
        className={`driwer-form${opened ? " opened" : ""}`}
      >
        <div className="form-body">
          <div className="page-header">
            <Upload />
            <span>{editId ? "Yangilash" : "Qo'shish"}</span>
            <button
              onClick={() => {
                setOpened(false);
                setEditId(null);
                resetProduct();
              }}
              type="button"
            >
              <X size={24} color="#3F8CFF" />
              <span>Yopish</span>
            </button>
          </div>
          <div className="row-form">
            <Input
              label="Mahsulot nomi"
              error={errorsProduct.name?.message}
              placeholder="Mahsulot nomi"
              {...registerProduct("name", { required: "Majburiy" })}
              disabled={loading}
            />
            <Input
              label="Narxi"
              error={errorsProduct.price?.message}
              placeholder="Narxi"
              type="number"
              {...registerProduct("price", { required: "Majburiy", min: 0 })}
              disabled={loading}
            />
          </div>
          <div className="row-form">
            <Input
              label="Miqdori"
              error={errorsProduct.quantity?.message}
              placeholder="Miqdori"
              type="number"
              {...registerProduct("quantity", { required: "Majburiy", min: 0 })}
              disabled={loading}
            />
            <Select
              label="Partiya"
              options={batches.map(b => ({ label: b.batch_number, value: b.batch_number }))}
              onChange={v => setValueProduct("batch_number", v ? v.toUpperCase() : "")}
              value={watchProduct("batch_number") || ""}
              disabled={loading}
            />
            {errorsProduct.batch_number && (
              <div className="input-error">{errorsProduct.batch_number.message}</div>
            )}
          </div>
          <div className="row-form">
            <button
              type="reset"
              className="btn secondary"
              onClick={() => { resetProduct(); setEditId(null) }}
              disabled={loading}
            >
              <span>Tozalash</span>
            </button>
            <button type="submit" className="btn primary" disabled={loading}>
              <span>Saqlash</span>
            </button>
          </div>
        </div>
      </form>
      {/* Batch Form */}
      <form
        onSubmit={handleSubmitBatch(onBatchSubmit)}
        className={`driwer-form${openedBatch ? " opened" : ""}`}
      >
        <div className="form-body">
          <div className="page-header">
            <Upload />
            <span>Partiya {editBatchId ? "yangilash" : "qo'shish"}</span>
            <button
              onClick={() => {
                setOpenedBatch(false);
                setEditBatchId(null);
                resetBatch();
              }}
              type="button"
            >
              <X size={24} color="#3F8CFF" />
              <span>Yopish</span>
            </button>
          </div>
          <div className="row-form">
            <Input
              label="Partiya raqami"
              placeholder="Partiya raqami"
              {...registerBatch("batch_number", { required: "Partiya raqami majburiy" })}
              value={watchBatch('batch_number').toUpperCase()}
              error={errorsBatch.batch_number?.message}
            />
          </div>
          <div className="row-form">
            <button type="reset" className="btn secondary"
              onClick={() => { resetBatch(); setEditBatchId(null) }}
            >
              <span>Tozalash</span>
            </button>
            <button type="submit" className="btn primary">
              <span>Saqlash</span>
            </button>
          </div>
          <div className="row-form">
            <Table
              columns={batchColumns}
              data={batches}
              onRowClick={(row) => console.log(row)}
              sortable={true}
              pagination={true}
              pageSize={10}
              tableLoading={tableLoading}
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default Warehouse;
