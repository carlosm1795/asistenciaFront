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
} from "@material-ui/core";
import * as XLSX from "xlsx";
import useAPI from "../../Hooks/useApi.js";
import { CSVLink, CSVDownload } from "react-csv";
import Waiter from "../Waiter/Waiter.jsx";
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
  const getPersonas = useAPI(
    {
      method: "POST",
      url: "https://asistenciarabackend.herokuapp.com/asistencia/getAsistenciaByDate",
    },
    false
  );
  useEffect(() => {
    if (getfechas.dataReady) {
      setDates(getfechas.data[0]);
    }
    setIsLoading(false);
  }, [getfechas.isLoading]);

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
  return (
    <>
      {loading ? (
        <Waiter show={loading} isTotalOpacity={loading} />
      ) : (
        <Container>
          <Grid container spacing={3}>
            <Grid item xs={10}>
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
                        Ingrese el archivo que amablemente California su papa en
                        Fifa Le dio.
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
