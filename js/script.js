let activeCounter = 0;
        // Chart.js setup
        const ctx = document.getElementById('ecgCanvas').getContext('2d');
        const ecgChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array.from({ length: 20 }, (_, i) => 19 + i),
                datasets: [{
                    label: 'Ritmo Cardíaco',
                    borderColor: 'rgb(31, 41, 55 )',
                    data: Array(20).fill(75),
                    fill: true,
                    lineTension: 0.3,
                }]
            },
            options: { 
                responsive: true,
                maintainAspectRatio: false,
            }
        });

        // Función para crear gráficos circulares
        function createDoughnutChart(canvasId, value, maxValue, color) {
            return new Chart(document.getElementById(canvasId), {
                type: 'doughnut',
                data: {
                    datasets: [{
                        data: [value, maxValue - value],
                        backgroundColor: [color, '#E5E7EB']
                    }]
                },
                options: {
                    rotation: -90,
                    circumference: 180,
                    cutout: '75%',
                    responsive: false,
                    plugins: {
                        legend: { display: false }
                    }
                }
            });
        }

        // Inicialización de gráficos individuales
        const temperatureChart = createDoughnutChart('temperature-chart', 36.5, 40, '#3B82F6');
        const heartRateChart = createDoughnutChart('heart-rate-chart', 75, 150, '#EF4444');
        const oxygenSaturationChart = createDoughnutChart('oxygen-saturation-chart', 98, 100, '#10B981');
        const ambientTemperatureChart = createDoughnutChart('ambient-temperature-chart', 22, 50, '#FBBF24');
        const ambientHumidityChart = createDoughnutChart('ambient-humidity-chart', 55, 100, '#A855F7');

        // Generar valores aleatorios para signos vitales
        function generateRandomValue(min, max) {
            return (Math.random() * (max - min) + min).toFixed(1);
        }

        // Actualización de gráficos y valores
        function updateVitalSigns() {
            const newTemperature = generateRandomValue(36.0, 37.5);
            const newHeartRate = generateRandomValue(60, 100);
            const newOxygenSaturation = generateRandomValue(95, 100);
            const newAmbientTemperature = generateRandomValue(20, 25);
            const newAmbientHumidity = generateRandomValue(50, 70);

            document.getElementById('temperature').textContent = `${newTemperature} °C`;
            document.getElementById('heart-rate').textContent = `${newHeartRate} BPM`;
            document.getElementById('oxygen-saturation').textContent = `${newOxygenSaturation}%`;
            document.getElementById('ambient-temperature').textContent = `${newAmbientTemperature} °C`;
            document.getElementById('ambient-humidity').textContent = `${newAmbientHumidity}%`;

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

            document.getElementById('active-counter').textContent = ++activeCounter;

        }

        // Cambiar información del paciente al seleccionarlo y reiniciar valores
        function selectPatient(patientId) {
            const patientData = {
                1: { name: "Paciente 1", id: "12345", age: 30, weight: "70 kg", height: "1.75 m", photo: "/img/user.png" },
                2: { name: "Paciente 2", id: "67890", age: 25, weight: "65 kg", height: "1.80 m", photo: "/img/user2.png" }
            };

            const patient = patientData[patientId];
            document.getElementById('patient-name').textContent = patient.name;
            document.getElementById('patient-id').textContent = `ID: ${patient.id}`;
            document.getElementById('patient-age').textContent = `Edad: ${patient.age} años`;
            document.getElementById('patient-weight').textContent = `Peso: ${patient.weight}`;
            document.getElementById('patient-height').textContent = `Estatura: ${patient.height}`;
            document.getElementById('patient-photo').src = patient.photo;

            // Reiniciar valores de los signos vitales
            activeCounter = 0;
            ecgChart.data.datasets[0].data = Array(10).fill(75);
            ecgChart.update();
        }


        setInterval(updateVitalSigns, 5000); // Actualiza los datos cada 5 segundos
        // Alternar modo oscuro
        document.getElementById('darkModeToggle').addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
        });