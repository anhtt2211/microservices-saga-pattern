# Order Process Microservices

This repository contains a set of microservices for managing the order process. The system is composed of four services: order-service, customer-service, stock-service, and saga-coordinator.

## Table of Contents

- [Introduction](#introduction)
- [Services](#services)
  - [Order Service](#order-service)
  - [Customer Service](#customer-service)
  - [Stock Service](#stock-service)
  - [Saga Coordinator](#saga-coordinator)
- [Getting Started](#getting-started)
- [Contributing](#contributing)

## Introduction

The order process microservices provide a distributed architecture for handling the order placement, payment processing, and inventory management. It follows the saga pattern for managing long-lived transactions that span multiple services.

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

To run the order process microservices locally using Docker Compose, follow these steps:

1. Clone this repository:

   `https://github.com/anhtt2211/microservices-saga-pattern.git`

2. Navigate to the cloned directory:

   `cd microservices-saga-pattern`

3. Set up the necessary configurations for each service, such as database connections and external service credentials. Modify the environment variables in the respective service's Docker Compose file (docker-compose.yml).

4. Build and start the services using Docker Compose:

   `docker-compose up -d`

   This command will build the Docker images and start the containers in detached mode.

5. Ensure that the services are running correctly by checking the logs:

   `docker-compose logs`

6. Verify that the services are communicating with each other correctly by accessing their API endpoints.

7. Use the provided APIs or a client application to place orders, process payments, and update inventory.

## Contributing

Contributions are welcome! If you want to contribute to this project, please follow these steps:

1. Fork this repository.
2. Create a new branch: `git checkout -b my-new-feature`.
3. Make your changes and commit them: `git commit -am 'Add some feature'`.
4. Push the changes to your fork: `git push origin my-new-feature`.
5. Submit a pull request.
