import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import ListItemText from "@material-ui/core/ListItemText";
import ListItem from "@material-ui/core/ListItem";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import CloseIcon from "@material-ui/icons/Close";
import Slide from "@material-ui/core/Slide";
import { TextField } from "@material-ui/core";
const useStyles = makeStyles((theme) => ({
  appBar: {
    position: "relative",
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1,
  },
}));

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});
const EditDates = (props) => {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  console.log(props);

  const [newDate, setNewDate] = useState({
    fechaActividad: props.data.rowData[1],
    maxDateToRegister: props.data.rowData[2],
  });
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChangeDate = (e) => {
    let newdata = { ...newDate };
    newdata[e.target.id] = e.target.value;
    setNewDate(newdata);
  };

  return (
    <div>
      <Button variant="contained" color="primary" onClick={handleClickOpen}>
        Edit
      </Button>
      <Dialog
        fullScreen
        open={open}
        onClose={handleClose}
        TransitionComponent={Transition}
      >
        <AppBar className={classes.appBar}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleClose}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
            <Typography variant="h6" className={classes.title}>
              Update Activity
            </Typography>
            <Button autoFocus color="inherit" onClick={handleClose}>
              Update
            </Button>
          </Toolbar>
        </AppBar>
        <List>
          <ListItem button>
            <ListItemText primary="Fecha Actividad" fullWidth />
            <TextField
              id="fechaActividad"
              type="date"
              variant="outlined"
              value={newDate.fechaActividad}
              onChange={(e) => handleChangeDate(e)}
              fullWidth
            />
          </ListItem>
          <ListItem button>
            <ListItemText primary="Max Date To Register" fullWidth />
            <TextField
              id="maxDateToRegister"
              type="datetime-local"
              variant="outlined"
              value={newDate.maxDateToRegister}
              onChange={(e) => handleChangeDate(e)}
              fullWidth
            />
          </ListItem>
          <Divider />
          <Button
            autoFocus
            onClick={handleClose}
            fullWidth
            variant="contained"
            color="primary"
          >
            Update
          </Button>
        </List>
      </Dialog>
    </div>
  );
};

export default EditDates;
