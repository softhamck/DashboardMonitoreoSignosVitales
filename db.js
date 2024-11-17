const mysql = require("mysql");
const mqtt = require("mqtt");

const conexion = mysql.createConnection({
  host: "asidi.xyz",
  database: "bddata_iot",
  user: "",
  password: "",
});

conexion.connect(function (error) {
  if (error) {
    throw error;
  } else {
    console.log("CONEXION EXITOSA");
  }
});

// Configuración del broker MQTT
const broker = "ws://broker.hivemq.com:8000/mqtt";
const client = mqtt.connect(broker);

const documento = "123456789";

// Tópicos MQTT
const tempCorporalTopic = `Monitoreo/${documento}/tempCorporal`;
const ritmoCardiacoTopic = `Monitoreo/${documento}/RitmoCardiaco`;
const saturacionOxigenoTopic = `Monitoreo/${documento}/SatueacionOxigeno`;
const tempAmbienteTopic = `Monitoreo/${documento}/TempAmbiente`;
const humedadAmbienteTopic = `Monitoreo/${documento}/HumedadAmbiente`;

// Objeto para almacenar los valores de las métricas
const metricas = {
  tempCorporal: null,
  ritmoCardiaco: null,
  saturacionOxigeno: null,
  tempAmbiente: null,
  humedadAmbiente: null,
};

// Contador para verificar si se han recibido todos los valores
let metricasRecibidas = 0;

// Conectar al broker MQTT
client.on("connect", () => {
  console.log("Conectado al broker MQTT");

  // Suscribirse a todos los tópicos
  const topics = [
    tempCorporalTopic,
    ritmoCardiacoTopic,
    saturacionOxigenoTopic,
    tempAmbienteTopic,
    humedadAmbienteTopic,
  ];

  topics.forEach((topic) => {
    client.subscribe(topic, (err) => {
      if (err) {
        console.error(`Error al suscribirse al tópico ${topic}:`, err);
      } else {
        console.log(`Suscrito al tópico: ${topic}`);
      }
    });
  });
});

// Manejar mensajes entrantes
client.on("message", (topic, message) => {
  const msg = message.toString();

  switch (topic) {
    case tempCorporalTopic:
      metricas.tempCorporal = msg;
      console.log(msg);
      break;
    case ritmoCardiacoTopic:
      metricas.ritmoCardiaco = msg;
      console.log(msg);
      break;
    case saturacionOxigenoTopic:
      metricas.saturacionOxigeno = msg;
      console.log(msg);
      break;
    case tempAmbienteTopic:
      metricas.tempAmbiente = msg;
      console.log(msg);
      break;
    case humedadAmbienteTopic:
      metricas.humedadAmbiente = msg;
      console.log(msg);
      break;
    default:
      console.log(
        `Mensaje recibido de un tópico desconocido (${topic}): ${msg}`
      );
      return;
  }

  metricasRecibidas++;

  // Si se han recibido todos los valores, agregar el paciente
  if (metricasRecibidas === 5) {
    agregarPaciente();
  }
});

function agregarPaciente() {
  const nuevoPaciente = {
    documento: "1021803005",
    nombres: "Luisa",
    apellidos: "Martins",
    genero: 2,
    fechaNacimiento: "2005-01-21",
    estatura: 1.55,
    peso: 45.5,
    idMunicipio: 3,
    anotaciones: "Sin observaciones.",
    fotoPaciente: null,
    metricas: [
      { metricaId: 1, valor: metricas.tempCorporal },
      { metricaId: 2, valor: metricas.ritmoCardiaco },
      { metricaId: 3, valor: metricas.saturacionOxigeno },
      { metricaId: 4, valor: metricas.tempAmbiente },
      { metricaId: 5, valor: metricas.humedadAmbiente },
    ],
  };

  const {
    documento,
    nombres,
    apellidos,
    genero,
    fechaNacimiento,
    estatura,
    peso,
    idMunicipio,
    anotaciones,
    fotoPaciente,
  } = nuevoPaciente;

  const queryPaciente = `INSERT INTO Paciente (Documento, Nombres, Apellidos, Genero, FechaNacimiento, Estatura, Peso, IdMunicipio, Anotaciones, FotoPaciente) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  conexion.query(
    queryPaciente,
    [
      documento,
      nombres,
      apellidos,
      genero,
      fechaNacimiento,
      estatura,
      peso,
      idMunicipio,
      anotaciones,
      fotoPaciente,
    ],
    (error, results) => {
      if (error) {
        console.error("Error al agregar paciente:", error);
        return;
      }
      const idPaciente = results.insertId;
      console.log(`Paciente agregado con ID: ${idPaciente}`);

      // Agregar métricas del paciente
      agregarMetricasPaciente(idPaciente, nuevoPaciente.metricas);
    }
  );
}

// Función para agregar métricas del paciente
function agregarMetricasPaciente(idPaciente, metricas) {
  const fechaHora = new Date().toISOString().slice(0, 19).replace("T", " ");

  metricas.forEach((metrica) => {
    const { metricaId, valor } = metrica;
    if (valor !== null) {
      const queryMetrica = `INSERT INTO DataOrigen (IDPaciente, Metrica, medidaValor, FechaHora, Estado) VALUES (?, ?, ?, ?, ?)`;
      conexion.query(
        queryMetrica,
        [idPaciente, metricaId, valor, fechaHora, 1],
        (error, results) => {
          if (error) {
            console.error("Error al agregar métrica:", error);
            return;
          }
          console.log(
            `Métrica agregada para el paciente con ID: ${idPaciente}`
          );
        }
      );
    }
  });

  // Cerrar la conexión después de agregar el paciente
  conexion.end();
}

// Manejo de errores de conexión a la base de datos
conexion.on("error", (err) => {
  console.error("Error en la conexión a la base de datos:", err);
});

// Manejo de errores de conexión al broker MQTT
client.on("error", (err) => {
  console.error("Error en la conexión al broker MQTT:", err);
});

// Manejo de cierre de la aplicación
process.on("SIGINT", () => {
  console.log("Cerrando la aplicación...");
  conexion.end((err) => {
    if (err) {
      console.error("Error al cerrar la conexión a la base de datos:", err);
    } else {
      console.log("Conexión a la base de datos cerrada");
    }
  });
  client.end(() => {
    console.log("Conexión al broker MQTT cerrada");
    process.exit(0);
  });
});
