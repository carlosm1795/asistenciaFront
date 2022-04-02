import React from "react";
import MUIDataTable from "mui-datatables";
const CustomTable = (props) => {
  let columns = null;
  console.log(props)
  if (props.customRows) {
    columns = props.customRows;
  } else {
    columns = props.header;
  }
  return (
    <MUIDataTable title={props.title} data={props.rows} columns={columns} />
  );
};

export default CustomTable;
