import React, { useEffect, useState } from "react";
import {
  Grid,
  Paper,
  Card,
  CardContent,
  CardActions,
  Button,
  Typography,
  TextField,
  Container,
  Select,
  MenuItem,
  ButtonGroup,
  AppBar,
  Tabs,
  Tab,
} from "@material-ui/core";
import TabPanel from "../Panels/TabPanel.jsx";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import * as XLSX from "xlsx";
import useAPI from "../../Hooks/useApi.js";
import { CSVLink, CSVDownload } from "react-csv";
import { NotificationManager } from "react-notifications";
import CustomTable from "../CustomTable/CustomTable";
import Waiter from "../Waiter/Waiter.jsx";
import EditDates from "../EditDates/EditDates.jsx";

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const Admin = () => {
  const [login, setLogin] = useState({
    usario: "",
    password: "",
    access: false,
    error: false,
  });
  const [dates, setDates] = useState([]);
  const [columns, setColumns] = useState([]);
  const [csvData, setcsvData] = useState([]);
  const [data, setData] = useState([]);
  const [dateSelected, setDateSelected] = useState("");
  const [loading, setIsLoading] = useState(true);
  const [asistencia, setAsistencia] = useState([]);
  const [actividadesData, setActividadesData] = useState([]);
  const [flagNewChange,setFlagChange] = useState('')
  const [value, setValue] = useState(0);
  const handleChangeTab = (event, newValue) => {
    setValue(newValue);
  };

  const [showDialog, setshowDialog] = useState(false);
  const loginUser = () => {
    let newData = { ...login };
    if (login.usuario === "mrangel" && login.password === "elbicho") {
      newData.access = true;
      newData.error = false;
    } else {
      newData.error = true;
    }
    setLogin(newData);
  };
  const handleChange = (e) => {
    let newdata = { ...login };
    newdata[e.target.id] = e.target.value;
    setLogin(newdata);
  };
  const getfechas = useAPI(
    {
      method: "get",
      url: "https://asistenciarabackend.herokuapp.com/asistencia/getDistinctAsistencia",
    },
    true
  );
  const getFullActivities = useAPI(
    {
      method: "get",
      url: "https://asistenciarabackend.herokuapp.com/asistencia/asistencia",
    },
    true
  );
  const getPersonas = useAPI(
    {
      method: "POST",
      url: "https://asistenciarabackend.herokuapp.com/asistencia/getAsistenciaByDate",
    },
    false
  );
  const addNewDate = useAPI(
    {
      method: "POST",
      url: "https://asistenciarabackend.herokuapp.com/actividades/newActividad",
    },
    false
  );
  const deleteAsistencia = useAPI(
    {
      method: "POST",
      url: "https://asistenciarabackend.herokuapp.com/asistencia/deleteAsistencia",
    },
    false
  );
  const actividadesCrud = useAPI(
    {
      method: "GET",
      url: "https://asistenciarabackend.herokuapp.com/actividades/getActividades",
    },
    true
  );
  useEffect(() => {
    if (getfechas.dataReady) {
      setDates(getfechas.data[0]);
    }
    setIsLoading(false);
  }, [getfechas.isLoading]);

  useEffect(() => {
    if (getFullActivities.dataReady) {
      setAsistencia(getFullActivities.data);
    }
  }, [getFullActivities.isLoading]);

  useEffect(() => {
    if (actividadesCrud.dataReady) {
      setActividadesData(actividadesCrud.data);
    }
  }, [actividadesCrud.isLoading]);

  useEffect(() => {
    actividadesCrud.setFire(true)
  },[flagNewChange])

  const handleFileSelected = (e) => {
    const files = Array.from(e.target.files);
    console.log("files:", files);
  };
  const processData = (dataString) => {
    const dataStringLines = dataString.split(/\r\n|\n/);
    const headers = dataStringLines[0].split(
      /,(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)/
    );

    const list = [];
    for (let i = 1; i < dataStringLines.length; i++) {
      const row = dataStringLines[i].split(
        /,(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)/
      );
      if (headers && row.length == headers.length) {
        const obj = {};
        for (let j = 0; j < headers.length; j++) {
          let d = row[j];
          if (d.length > 0) {
            if (d[0] == '"') d = d.substring(1, d.length - 1);
            if (d[d.length - 1] == '"') d = d.substring(d.length - 2, 1);
          }
          if (headers[j]) {
            obj[headers[j]] = d;
          }
        }

        // remove the blank rows
        if (Object.values(obj).filter((x) => x).length > 0) {
          list.push(obj);
        }
      }
    }

    // prepare columns list from headers
    const columns = headers.map((c) => ({
      name: c,
      selector: c,
    }));

    setData(list);
    setColumns(columns);
  };
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      /* Parse data */
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      /* Get first worksheet */
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      /* Convert array of arrays */
      const data = XLSX.utils.sheet_to_csv(ws, { header: 1 });
      processData(data);
    };
    reader.readAsBinaryString(file);
  };

  const downloadAsistencia = () => {
    getPersonas.setParameters((state) => ({
      ...state,
      data: {
        fechaActividad: dateSelected,
      },
    }));
    getPersonas.setFire(true);
    setIsLoading(true);
  };

  useEffect(() => {
    if (getPersonas.dataReady) {
      createAndDownloadFile(getPersonas.data);
      setIsLoading(false);
    }
  }, [getPersonas.isLoading]);

  const createAndDownloadFile = (asistenciaResponse) => {
    let newAsistencia = [];
    asistenciaResponse.forEach((element) => {
      let newPerson = data.filter((row) => row.id === element.idPersona);
      if (newPerson.length > 0) {
        newAsistencia = [
          ...newAsistencia,
          {
            idPersona: element.idPersona,
            fechaActividad: element.fechaActividad,
            numeroBurbuja: element.numeroBurbuja,
            comentarios: element.comentarios,
            nombreTerrenal: newPerson[0]["Nombre Terrenal"],
            nombreAstral: newPerson[0]["Nombre Astral"],
          },
        ];
      }
    });
    console.log(newAsistencia);
    setcsvData(newAsistencia);
  };
  const [datosActividad, setDatosActividad] = useState({
    fechaActividad: "",
    maxDateToRegister: "",
  });
  const handleChangeDate = (e) => {
    let newdata = { ...datosActividad };
    newdata[e.target.id] = e.target.value;
    setDatosActividad(newdata);
  };

  const insertNewDate = () => {
    addNewDate.setParameters((state) => ({
      ...state,
      data: {
        fechaActividad: datosActividad.fechaActividad,
        maxDateToRegister: datosActividad.maxDateToRegister,
      },
    }));
    addNewDate.setFire(true);
    setIsLoading(true);
  };
  useEffect(() => {
    if (addNewDate.dataReady) {
      NotificationManager.success("New Date Inserted", "Excellent");
      setDatosActividad({
        fechaActividad: "",
        maxDateToRegister: "",
      });
    }
    if (insertNewDate.error) {
      NotificationManager.error("Sorry we had an error", "Dear Friend");
    }
    setIsLoading(false);
  }, [addNewDate.isLoading]);

  const customColumns = [
    {
      label: "Fecha",
      filter: true,
    },
    {
      label: "Burbuja",
      filter: true,
    },
    {
      label: "Fecha De Ingreso",
      filter: true,
    },
    {
      label: "Actions",
      options: {
        customBodyRender: (value, tableMeta, updateValue) => {
          return (
            <Button
              variant="contained"
              color="primary"
              onClick={(e) => deleteEntry(tableMeta.rowData)}
            >
              Eliminar
            </Button>
          );
        },
      },
    },
  ];
  const customColumnsDates = [
    {
      label: "ID",
      filter: true,
    },
    {
      label: "Fecha",
      filter: true,
    },
    {
      label: "Max Date",
      filter: true,
    },
    {
      label: "Actions",
      options: {
        customBodyRender: (value, tableMeta, updateValue) => {
          return <EditDates data={tableMeta} setFlagChange={setFlagChange}/>;
        },
      },
    },
  ];
  const deleteEntry = (data) => {
    deleteAsistencia.setParameters((state) => ({
      ...state,
      data: {
        fechaActividad: data[0],
        numeroBurbuja: data[1],
        idPersona: data[2],
        fechaIngreso: data[3],
      },
    }));
    deleteAsistencia.setFire(true);
    setIsLoading(true);
  };
  useEffect(() => {
    if (deleteAsistencia.dataReady) {
      NotificationManager.success("Entry is gone", "Excellent");
      getFullActivities.setFire(true);
    }
    if (deleteAsistencia.error) {
      NotificationManager.error("Sorry we had an error", "Dear Friend");
    }
    setIsLoading(false);
  }, [deleteAsistencia.isLoading]);
  return (
    <>
      {loading ? (
        <Waiter show={loading} isTotalOpacity={loading} />
      ) : (
        <Container>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  {login.access === false ? (
                    <div>
                      Ingrese El Usuario
                      <TextField
                        id="usuario"
                        variant="outlined"
                        value={login.usuario}
                        onChange={(e) => handleChange(e)}
                        fullWidth
                      />
                      Ingrese el password
                      <TextField
                        id="password"
                        type="password"
                        variant="outlined"
                        value={login.password}
                        onChange={(e) => handleChange(e)}
                        fullWidth
                      />
                      <br></br>
                      {login.error ? (
                        <p color="red">Datos Incorrectos</p>
                      ) : null}
                      <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        onClick={loginUser}
                      >
                        Acceder
                      </Button>
                    </div>
                  ) : (
                    <>
                      <AppBar position="static">
                        <Tabs
                          value={value}
                          onChange={handleChangeTab}
                          aria-label="simple tabs example"
                        >
                          <Tab label="Donwload Assistance" {...a11yProps(0)} />
                          <Tab label="Register/Edit Dates" {...a11yProps(1)} />
                          <Tab label="Check Assistance" {...a11yProps(2)} />
                        </Tabs>
                      </AppBar>
                      <TabPanel value={value} index={0}>
                        <div>Ingrese la fecha para consultar la lista</div>
                        <Select
                          labelId="demo-simple-select-label"
                          id="demo-simple-select"
                          value={dateSelected}
                          label="Age"
                          fullWidth
                          onChange={(e) => setDateSelected(e.target.value)}
                        >
                          {dates.map((row) => (
                            <MenuItem
                              key={row.fechaActividad}
                              value={row.fechaActividad}
                            >
                              {row.fechaActividad}
                            </MenuItem>
                          ))}
                        </Select>
                        <div>
                          Ingrese el archivo que amablemente California su papa
                          en Fifa Le dio.
                        </div>
                        <input
                          type="file"
                          accept=".csv,.xlsx,.xls"
                          onChange={handleFileUpload}
                        />
                        <br></br>
                        <ButtonGroup fullWidth>
                          <Button
                            fullWidth
                            variant="contained"
                            color="primary"
                            onClick={downloadAsistencia}
                          >
                            Generar Asistencia
                          </Button>
                          <Button
                            fullWidth
                            variant="contained"
                            color="secondarary"
                          >
                            <CSVLink data={csvData}>Download me</CSVLink>
                          </Button>
                        </ButtonGroup>
                      </TabPanel>
                      <TabPanel value={value} index={1}>
                        <Grid item xs={12}>
                          <Card>
                            <CardContent>
                              <h3>Register New Date:</h3>
                              <TextField
                                id="fechaActividad"
                                type="date"
                                variant="outlined"
                                value={datosActividad.fechaActividad}
                                onChange={(e) => handleChangeDate(e)}
                                fullWidth
                              />
                              <h3>Latest time to register people:</h3>
                              <TextField
                                id="maxDateToRegister"
                                type="datetime-local"
                                variant="outlined"
                                value={datosActividad.maxDateToRegister}
                                onChange={(e) => handleChangeDate(e)}
                                fullWidth
                              />
                              <br></br>
                              <br></br>

                              <Button
                                fullWidth
                                variant="contained"
                                color="primary"
                                onClick={insertNewDate}
                              >
                                Register New Date
                              </Button>
                            </CardContent>
                          </Card>
                        </Grid>
                        <Grid item xs={12}>
                          <Card>
                            <CardContent>
                              {actividadesData.length > 0 ? (
                                <CustomTable
                                  customRows={customColumnsDates}
                                  title="Edit Dates"
                                  header={["ID", "Fecha", "Max Date"]}
                                  rows={actividadesData.map((row) => [
                                    row.identficadorActividad,
                                    row.fechaActividad,
                                    row.maxDateToRegister,
                                  ])}
                                />
                              ) : null}
                            </CardContent>
                          </Card>
                        </Grid>
                      </TabPanel>
                      <TabPanel value={value} index={2}>
                        <Grid item xs={12}>
                          <Card>
                            <CardContent>
                              {asistencia.length > 0 ? (
                                <CustomTable
                                  customRows={customColumns}
                                  title="Resumen de personas anotadas"
                                  header={[
                                    "Fecha Actividad",
                                    "Burbuja",
                                    "Identificador",
                                    "Fecha Ingreso",
                                    "Comentarios",
                                  ]}
                                  rows={asistencia.map((row) => [
                                    row.fechaActividad,
                                    row.numeroBurbuja,
                                    row.idPersona,
                                    row.fechaIngreso,
                                    row.comentarios,
                                  ])}
                                />
                              ) : null}
                            </CardContent>
                          </Card>
                        </Grid>
                      </TabPanel>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
           
          </Grid>
        </Container>
      )}
    </>
  );
};

export default Admin;
