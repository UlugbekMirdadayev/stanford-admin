import React, { useState } from "react";
import "../styles/table.css";

const Table = ({
  columns,
  data,
  onRowClick,
  sortable = true,
  pagination = true,
  pageSize = 10,
  className = "",
  tableLoading = false,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const handleSort = (key) => {
    if (!sortable) return;

    let direction = "asc";

    if (sortConfig.key === key) {
      if (sortConfig.direction === "asc") {
        direction = "desc";
      } else if (sortConfig.direction === "desc") {
        direction = null;
        key = null;
      } else {
        direction = "asc";
      }
    } else {
      direction = "asc";
    }

    setSortConfig({ key, direction });
  };

  const sortedData = React.useMemo(() => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig]);

  const paginatedData = React.useMemo(() => {
    if (!pagination) return sortedData;

    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize, pagination]);

  const totalPages = Math.ceil(data.length / pageSize);

  return (
    <div className={`table-container ${className}`}>
      <table className="table">
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th
                key={column.key || index}
                onClick={() =>
                  column.key
                    ? handleSort(column.key)
                    : setSortConfig({ key: null, direction: "asc" })
                }
                className={sortable ? "sortable" : ""}
                style={column.style}
              >
                {column.title}
                <span
                  className={`sort-icon ${
                    sortConfig.direction === "asc" ? "up" : "down"
                  } ${sortConfig.key === column.key ? "visible" : ""}`}
                >
                  {sortConfig.direction === "asc" ? "↑" : "↓"}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableLoading ? (
            <tr>
              <td
                colSpan={columns.length}
                style={{ textAlign: "center", padding: "1rem" }}
              >
                Загрузка...
              </td>
            </tr>
          ) : paginatedData.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                style={{ textAlign: "center", padding: "1rem" }}
              >
                Информация не найдена
              </td>
            </tr>
          ) : (
            paginatedData.map((row, index) => (
              <tr
                key={index}
                onClick={() => onRowClick && onRowClick(row)}
                className={onRowClick ? "clickable" : ""}
              >
                {columns.map((column, index) => (
                  <td key={column.key || index} style={column.style}>
                    {column.render
                      ? column.render(row[column.key], row)
                      : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {pagination && totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Orqaga
          </button>
          <span>
            Sahifa {currentPage} / {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Oldinga
          </button>
        </div>
      )}
    </div>
  );
};

export default Table;
