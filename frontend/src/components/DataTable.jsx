import React, { useRef, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";

const DataTable = ({ data, onDataChange, setEnabled, setSelectedRows }) => {
  const gridRef = useRef();
  useEffect(() => {
    if (gridRef.current && gridRef.current.api) {
      const handleSelectionChange = (params) => {
        const selectedRowIds = params.api
          .getSelectedRows()
          .map((row) => row.id);

        if (selectedRowIds.length > 0) {
          setSelectedRows(selectedRowIds);
        }
      };

      gridRef.current.api.onRowSelectionModelChange(handleSelectionChange);
    }
  }, [gridRef]);

  const columns = [
    { field: "id", headerName: "ID", width: 50, editable: false },
    { field: "name", headerName: "Name", width: 130, editable: true },
    { field: "pin", headerName: "Pin", width: 60, editable: true },
    { field: "data_type", headerName: "Data Type", width: 130, editable: true },
    { field: "color", headerName: "Color", width: 100, editable: true },
    { field: "min", headerName: "Min", width: 100, editable: true },
    { field: "max", headerName: "Max", width: 100, editable: true },
    { field: "legend_name", headerName: "Legend", width: 100, editable: true },
    { field: "value", headerName: "Value", width: 130, editable: true },
  ];

  function updateIDs(data) {
    let idCounter = 1;
    const updatedData = data.map((row) => {
      row.id = idCounter++;
      return row;
    });
    return updatedData;
  }

  const handleRowEdit = (newRow) => {
    const newData = data.map((row) => (row.id === newRow.id ? newRow : row));
    onDataChange(newData);
  };

  const handleSelectionChange = (params) => {
    if (params.length > 0) {
      setEnabled(true);
      setSelectedRows(params);
    } else {
      setEnabled(false);
    }
  };
  return (
    <div style={{ height: "auto", width: "100%" }}>
      <div
        style={{
          height: "calc(100vh - 260px)",
          width: "100%",
          marginBottom: "10px",
          overflow: "auto",
        }}
      >
        <DataGrid
          ref={gridRef}
          rows={data}
          columns={columns}
          pageSize={5}
          checkboxSelection
          onEditCellChangeCommitted={handleRowEdit}
          onRowSelectionModelChange={handleSelectionChange}
          style={{ maxHeight: "100%" }}
        />
      </div>
    </div>
  );
};

export default DataTable;
