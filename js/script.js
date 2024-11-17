/* MQTT */
const broker = "ws://broker.hivemq.com:8000/mqtt";
const clientId = "clientId-" + parseInt(Math.random() * 100);
const client = new Paho.MQTT.Client(broker, clientId);
const documento = "123456789";

// Tópicos MQTT
const contaTopic = "Monitoreo/" + documento + "/conta";
const tempCorporalTopic = "Monitoreo/" + documento + "/tempCorporal";
const ritmoCardiacoTopic = "Monitoreo/" + documento + "/RitmoCardiaco";
const saturacionOxigenoTopic = "Monitoreo/" + documento + "/SatueacionOxigeno";
const tempAmbienteTopic = "Monitoreo/" + documento + "/TempAmbiente";
const humedadAmbienteTopic = "Monitoreo/" + documento + "/HumedadAmbiente";

// Variables para almacenar los valores recibidos
let contadorValue = 0;
let tempCorporalValue = 0;
let ritmoCardiacoValue = 0;
let saturacionOxigenoValue = 0;
let temperaturaValue = 0;
let humedadAmbienteValue = 0;

// Conectar al broker MQTT
client.connect({
  onSuccess: onConnect,
  onFailure: onFailure,
});

function onConnect() {
  console.log("Conectado al broker MQTT");

  // Suscribirse a todos los tópicos
  const topics = [
    contaTopic,
    tempCorporalTopic,
    ritmoCardiacoTopic,
    saturacionOxigenoTopic,
    tempAmbienteTopic,
    humedadAmbienteTopic,
  ];

  topics.forEach((topic) => {
    client.subscribe(topic, {
      onSuccess: () => console.log(`Suscrito al tópico: ${topic}`),
      onFailure: (error) =>
        console.error(`Error al suscribirse al tópico ${topic}:`, error),
    });
  });
}

function onFailure(message) {
  console.log("Error al conectar al broker MQTT: " + message.errorMessage);
}

// Manejar mensajes entrantes
client.onMessageArrived = function (message) {
  const topic = message.destinationName;
  const msg = message.payloadString;

  // Almacenar valores en variables según el tópico
  switch (topic) {
    case contaTopic:
      contadorValue = msg;
      console.log(`Contador actualizado: ${contadorValue}`);
      break;
    case tempCorporalTopic:
      tempCorporalValue = msg;
      console.log(`Temperatura Corporal actualizada: ${tempCorporalValue}`);
      break;
    case ritmoCardiacoTopic:
      ritmoCardiacoValue = msg;
      console.log(`Ritmo Cardíaco actualizado: ${ritmoCardiacoValue}`);
      break;
    case saturacionOxigenoTopic:
      saturacionOxigenoValue = msg;
      console.log(
        `Saturación de Oxígeno actualizada: ${saturacionOxigenoValue}`
      );
      break;
    case tempAmbienteTopic:
      temperaturaValue = msg;
      console.log(`Temperatura Ambiente actualizada: ${temperaturaValue}`);
      break;
    case humedadAmbienteTopic:
      humedadAmbienteValue = msg;
      console.log(`Humedad Ambiente actualizada: ${humedadAmbienteValue}`);
      break;
    default:
      console.log(
        `Mensaje recibido de un tópico desconocido (${topic}): ${msg}`
      );
      break;
  }
};
let activeCounter = 0;
// Chart.js setup
const ctx = document.getElementById("ecgCanvas").getContext("2d");
const ecgChart = new Chart(ctx, {
  type: "line",
  data: {
    labels: Array.from({ length: 20 }, (_, i) => 19 + i),
    datasets: [
      {
        label: "Ritmo Cardíaco",
        borderColor: "rgb(31, 41, 55 )",
        data: Array(20).fill(75),
        fill: true,
        lineTension: 0.3,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
  },
});

// Función para crear gráficos circulares
function createDoughnutChart(canvasId, value, maxValue, color) {
  return new Chart(document.getElementById(canvasId), {
    type: "doughnut",
    data: {
      datasets: [
        {
          data: [value, maxValue - value],
          backgroundColor: [color, "#E5E7EB"],
        },
      ],
    },
    options: {
      rotation: -90,
      circumference: 180,
      cutout: "75%",
      responsive: false,
      plugins: {
        legend: { display: false },
      },
    },
  });
}

// Inicialización de gráficos individuales
const temperatureChart = createDoughnutChart(
  "temperature-chart",
  36.5,
  40,
  "#3B82F6"
);
const heartRateChart = createDoughnutChart(
  "heart-rate-chart",
  75,
  150,
  "#EF4444"
);
const oxygenSaturationChart = createDoughnutChart(
  "oxygen-saturation-chart",
  98,
  100,
  "#10B981"
);
const ambientTemperatureChart = createDoughnutChart(
  "ambient-temperature-chart",
  22,
  50,
  "#FBBF24"
);
const ambientHumidityChart = createDoughnutChart(
  "ambient-humidity-chart",
  55,
  100,
  "#A855F7"
);

// Generar valores aleatorios para signos vitales
function generateRandomValue(min, max) {
  return (Math.random() * (max - min) + min).toFixed(1);
}

// Actualización de gráficos y valores
function updateVitalSigns() {
  const newTemperature = tempCorporalValue;
  const newHeartRate = ritmoCardiacoValue;
  const newOxygenSaturation = saturacionOxigenoValue;
  const newAmbientTemperature = temperaturaValue;
  const newAmbientHumidity = humedadAmbienteValue;

  document.getElementById("temperature").textContent = `${newTemperature} °C`;
  document.getElementById("heart-rate").textContent = `${newHeartRate} BPM`;
  document.getElementById(
    "oxygen-saturation"
  ).textContent = `${newOxygenSaturation}%`;
  document.getElementById(
    "ambient-temperature"
  ).textContent = `${newAmbientTemperature} °C`;
  document.getElementById(
    "ambient-humidity"
  ).textContent = `${newAmbientHumidity}%`;

  temperatureChart.data.datasets[0].data[0] = newTemperature;
  heartRateChart.data.datasets[0].data[0] = newHeartRate;
  oxygenSaturationChart.data.datasets[0].data[0] = newOxygenSaturation;
  ambientTemperatureChart.data.datasets[0].data[0] = newAmbientTemperature;
  ambientHumidityChart.data.datasets[0].data[0] = newAmbientHumidity;

  temperatureChart.update();
  heartRateChart.update();
  oxygenSaturationChart.update();
  ambientTemperatureChart.update();
  ambientHumidityChart.update();

  ecgChart.data.datasets[0].data.push(newHeartRate);
  ecgChart.data.datasets[0].data.shift();
  ecgChart.update();

  document.getElementById("active-counter").textContent = contadorValue;
}

// Cambiar información del paciente al seleccionarlo y reiniciar valores
function selectPatient(patientId) {
  const patientData = {
    1: {
      name: "Paciente 1",
      id: "12345",
      age: 30,
      weight: "70 kg",
      height: "1.75 m",
      photo: "/img/user.png",
    },
    2: {
      name: "Paciente 2",
      id: "67890",
      age: 25,
      weight: "65 kg",
      height: "1.80 m",
      photo: "/img/user2.png",
    },
  };

  const patient = patientData[patientId];
  document.getElementById("patient-name").textContent = patient.name;
  document.getElementById("patient-id").textContent = `ID: ${patient.id}`;
  document.getElementById(
    "patient-age"
  ).textContent = `Edad: ${patient.age} años`;
  document.getElementById(
    "patient-weight"
  ).textContent = `Peso: ${patient.weight}`;
  document.getElementById(
    "patient-height"
  ).textContent = `Estatura: ${patient.height}`;
  document.getElementById("patient-photo").src = patient.photo;

  // Reiniciar valores de los signos vitales
  activeCounter = 0;
  ecgChart.data.datasets[0].data = Array(10).fill(75);
  ecgChart.update();
}

setInterval(updateVitalSigns, 2000); // Actualiza los datos cada 2 segundos
// Alternar modo oscuro
document.getElementById("darkModeToggle").addEventListener("click", () => {
  const button = document.getElementById("darkModeToggle");
  const isDarkMode = document.body.classList.toggle("dark-mode");

  // Cambiar el contenido del botón entre sol y luna
  if (isDarkMode) {
    button.textContent = "🌞";
  } else {
    button.textContent = "🌑";
  }
});
