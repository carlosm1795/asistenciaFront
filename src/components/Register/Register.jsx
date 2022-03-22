import React, { useState, useEffect } from "react";
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
} from "@material-ui/core";
import Select from "react-select";
import dayjs from "dayjs";
import useAPI from "../../Hooks/useApi.js";
import { makeStyles } from "@material-ui/core/styles";
import DatePicker from "react-datepicker";
import Waiter from "../Waiter/Waiter";
import "react-datepicker/dist/react-datepicker.css";
const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.secondary,
  },
}));

const Register = () => {
  const insertData = useAPI(
    {
      method: "post",
      url: "https://asistenciarabackend.herokuapp.com/asistencia/newAsistencia",
    },
    false
  );
  const getDates = useAPI(
    {
      method: "GET",
      url: "https://asistenciarabackend.herokuapp.com/actividades/getActividades",
    },
    true
  );
  const getIds = useAPI(
    {
      method: "get",
      url: "https://asistenciarabackend.herokuapp.com/ids/getIds",
    },
    true
  );
  const [loading, setLoading] = useState(false);
  const [opacity, setTotalOpacity] = useState(false);
  const [ids, setIds] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [dates, setDates] = useState([]);
  const [datosActividad, setDatosActividad] = useState({
    identificadorPersona: "",
    fechaActividad: '',
    comentarios: "",
  });
  const classes = useStyles();
  const handleChange = (e) => {
    let newdata = { ...datosActividad };
    newdata.fechaActividad = e.value;
    setDatosActividad(newdata);
  };

  useEffect(() => {
    setLoading(true);
  }, []);

  useEffect(() => {
    if (getDates.dataReady && getIds.dataReady) {
      setLoading(false);
    }
  }, [getDates.isLoading, getIds.isLoading]);
  const addDays = (date, days) => {
    date.setDate(date.getDate() + days);
    return date;
  };
  //Function that is going to get an array of dates and its going to return the dates for the current month
  const returnValidDate = (arrayOfDates) => {
    let currentDate = dayjs();
    let validDates = [];

    for (let date of arrayOfDates) {
      let maxDate = dayjs(date.maxDateToRegister);
      let fechaActividad = dayjs(date.fechaActividad);

      if (
        fechaActividad.month() === currentDate.month() &&
        currentDate < maxDate
      ) {
        validDates = [
          ...validDates,
          { ...date, value: date.fechaActividad, label: date.fechaActividad },
        ];
      }
    }
    return validDates;
  };
  useEffect(() => {
    if (getDates.dataReady) {
      setDates(returnValidDate(getDates.data));
    }
  }, [getDates.isLoading]);
  const AddPerson = () => {
    if (datosActividad.identificadorPersona !== "") {
      let aux = personas.filter(
        (row) => row === datosActividad.identificadorPersona
      );
      if (aux.length > 0) {
        alert("Esta persona ya esta ingresada en esta burbuja");
        let newdata = { ...datosActividad };
        newdata.identificadorPersona = "";
        setDatosActividad(newdata);
      } else {
        setPersonas([...personas, datosActividad.identificadorPersona]);
        let newdata = { ...datosActividad };
        newdata.identificadorPersona = "";
        setDatosActividad(newdata);
      }
    } else {
      alert("Por favor ingrese una persona.");
    }
  };
  const DeletePerson = (id) => {
    let newPersonas = personas.filter((row) => row !== id);
    setPersonas(newPersonas);
  };
  useEffect(() => {
    if (getIds.dataReady) {
      let newInfo = [];
      for (let data of getIds.data) {
        newInfo = [
          ...newInfo,
          {
            value: data.identficador,
            label: data.identficador,
          },
        ];
      }
      setIds(newInfo);
    }
    setLoading(false);
    setTotalOpacity(false);
  }, [getIds.isLoading]);
  const insertDataIntoDB = () => {
    if (personas.length > 0) {
      let dataToInsert = [];
      for (let person of personas) {
        dataToInsert = [
          ...dataToInsert,
          {
            idPersona: person,
            fechaActividad: datosActividad.fechaActividad,
            numeroBurbuja: "1",
            fechaIngreso: `${new Date()}`,
            comentarios: datosActividad.comentarios,
          },
        ];
      }
      insertData.setParameters((state) => ({
        ...state,
        data: {
          data: dataToInsert,
        },
      }));
      insertData.setFire(true);
      setLoading(true);
      setTotalOpacity(true);
    }
  };
  useEffect(() => {
    if (insertData.dataReady) {
      console.log("Registro Completado");
    }
    setLoading(false);
    setTotalOpacity(false);
  }, [insertData.isLoading]);
  const handleChangeSelect = (e) => {
    let newdata = { ...datosActividad };
    newdata.identificadorPersona = e.value;
    setDatosActividad(newdata);
  };

  return (
    <>
      {loading ? (
        <Waiter show={loading} isTotalOpacity={loading} />
      ) : (
        <Container>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card className={classes.root}>
                <CardContent>
                  <Typography
                    className={classes.title}
                    color="textSecondary"
                    gutterBottom
                  >
                    Ingrese los identificadores de las personas que van a
                    asistir a la actividad
                  </Typography>
                  {/* <TextField
                id="identificadorPersona"
                label="Identificador de la persona"
                variant="outlined"
                value={datosActividad.identificadorPersona}
                onChange={(e) => handleChange(e)}
              /> */}
                  <Select
                    options={ids}
                    onChange={(e) => handleChangeSelect(e)}
                  />
                  <Typography
                    className={classes.title}
                    color="textSecondary"
                    gutterBottom
                  >
                    Fecha de la Actividad
                  </Typography>
                  {/* <TextField
                    id="fechaActividad"
                    type="date"
                    variant="outlined"
                    value={datosActividad.fechaActividad}
                    onChange={(e) => handleChange(e)}
                    fullWidth
                  /> */}
                  <Select
                    id="fechaActividad"
                    options={dates}
                    onChange={(e) => handleChange(e)}
                  />
                  <br />
                  <Typography
                    className={classes.title}
                    color="textSecondary"
                    gutterBottom
                  >
                    Si la persona no posee identificador ingrese el nombre en el
                    siguiente campo
                  </Typography>
                  <Typography
                    className={classes.title}
                    color="textSecondary"
                    gutterBottom
                  >
                    Comentarios
                  </Typography>
                  <TextField
                    id="comentarios"
                    variant="outlined"
                    fullWidth
                    value={datosActividad.comentarios}
                    onChange={(e) => handleChange(e)}
                  />

                  <br />
                  <br />
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={AddPerson}
                  >
                    Agregar persona
                  </Button>
                  <Typography variant="body2" component="p">
                    Personas Agregadas a la actividad.
                    {personas.length > 0 ? `Total:${personas.length}` : null}
                    <br />
                    {personas.map((row) => (
                      <div key={row}>
                        <li key={row}>
                          {row}
                          <Button
                            onClick={(e) => DeletePerson(row)}
                            variant="contained"
                            color="secondary"
                          >
                            Eliminar
                          </Button>
                        </li>
                      </div>
                    ))}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    disabled={
                      personas.length > 0 &&
                      datosActividad.fechaActividad !== ""
                        ? false
                        : true
                    }
                    onClick={insertDataIntoDB}
                  >
                    Terminar Registro
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          </Grid>
        </Container>
      )}
    </>
  );
};

export default Register;
