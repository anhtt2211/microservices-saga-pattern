# Order Process Microservices

This repository contains a set of microservices for managing the order process. The system is composed of four services: order-service, customer-service, stock-service, and saga-coordinator.

## Table of Contents

- [Introduction](#introduction)
- [Dependencies](#dependencies)
- [Services](#services)
  - [Order Service](#order-service)
  - [Customer Service](#customer-service)
  - [Stock Service](#stock-service)
  - [Saga Coordinator](#saga-coordinator)
- [Getting Started](#getting-started)
- [Contributing](#contributing)

## Introduction

The order process microservices provide a distributed architecture for handling the order placement, payment processing, and inventory management. It follows the saga pattern for managing long-lived transactions that span multiple services.

## Dependencies

- RabbitMQ - https://www.rabbitmq.com/
- PostgreSQL - https://www.postgresql.org/

## Services

### Order Service

The order-service is responsible for handling the order placement. It provides APIs for creating new orders, retrieving order details, and updating order statuses. This service communicates with the customer-service and the saga-coordinator to coordinate the order processing.

### Customer Service

The customer-service handles the payment processing for the orders. It integrates with external payment gateways to authorize and process payments. Upon successful payment, it notifies the saga-coordinator about the payment status.

### Stock Service

The stock-service manages the inventory levels for the products. It provides APIs for updating the available stock quantity and retrieving the current stock status. The saga-coordinator communicates with this service to verify the availability of stock before processing an order.

### Saga Coordinator

The saga-coordinator is the central orchestrator of the order processing workflow. It coordinates the interactions between the order-service, customer-service, and stock-service to ensure the consistency of the order process. It handles compensating actions in case of failures or inconsistencies during the transaction.

## Getting Started

### Installation

Install dependencies for root.

```
npm install
```

Install service deps

```
npm run service-install
```

### Build

Build services

```
npm run build
```

### Run

Start services in development mode

```
npm start
```

start services in production mode

```
npm run start:prod
```

### Run docker-compose file with build

Build docker-compose images

```
docker-compose up --build
```

## Contributing

Contributions are welcome! If you want to contribute to this project, please follow these steps:

1. Fork this repository.
2. Create a new branch: `git checkout -b my-new-feature`.
3. Make your changes and commit them: `git commit -am 'Add some feature'`.
4. Push the changes to your fork: `git push origin my-new-feature`.
5. Submit a pull request.
