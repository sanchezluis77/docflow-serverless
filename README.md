# 🚀 DocFlow Serverless

![Python](https://img.shields.io/badge/Python-3.10-blue?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?logo=docker&logoColor=white)
![CI Status](https://github.com/tu-usuario/docflow-serverless/actions/workflows/ci.yml/badge.svg)

**DocFlow** es un sistema SaaS de gestión y procesamiento de documentos diseñado con una arquitectura orientada a microservicios y patrones asíncronos. 

El proyecto demuestra la implementación de un flujo completo de ingeniería de software: desde una API RESTful de alto rendimiento hasta un frontend reactivo, orquestado mediante contenedores y validado con pipelines de integración continua (CI).

---

## 🏗️ Arquitectura del Sistema

El sistema sigue un patrón de **Eventual Consistency** (Consistencia Eventual) para simular una arquitectura Serverless real (tipo AWS Lambda).

```mermaid
graph TD
    Client[🖥️ React Client] -->|HTTP POST /upload| API[⚡ FastAPI Core]
    Client -->|Polling Status| API
    API -->|Auth JWT| DB[(🐘 PostgreSQL)]
    API -->|Save File| Storage[📂 Local/S3 Storage]
    API -.->|Trigger Task| Worker[⚙️ Background Worker]
    
    Worker -->|Read PDF| Storage
    Worker -->|Extract Text| Logic[🧠 ETL Logic]
    Logic -->|Update Status| DB