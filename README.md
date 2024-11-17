# Proyecto de Monitoreo de Signos Vitales

Este proyecto es un sistema de monitoreo de signos vitales que recibe datos desde un broker MQTT y los almacena en una base de datos MySQL. Además, permite agregar nuevos pacientes con sus métricas a la base de datos.

## Estructura del Proyecto

```sh
|- css
    |- styles.css
|- img
|- js
    |- script.js
|- index.html
|- db.js
|- package.json
|- package-lock.json
|- README.md
```

## Requisitos

- Node.js (versión 12 o superior)
- npm (normalmente viene con Node.js)
- MySQL (con acceso a la base de datos `bddata_iot`)
- Broker MQTT (en este caso, se utiliza `broker.hivemq.com`)

## Instalación

### Clonar el Repositorio:

```bash
git clone https://github.com/softhamck/DashboardMonitoreoSignosVitales.git
```

### Instalar Dependencias:

```bash
npm install
```

### Agregar al código db.js:

```bash
user: "admin",
password: "Admin2024",
```

## Ejecución

### Iniciar el Proyecto:

```bash
node db.js
```
