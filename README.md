# Documentation

## Disclaimers

> Unfortunatelly, time series plugin is not available out of the box in Redis Docker images!
>
> So I wasn't querying Redis TS but Mongo collection which stored events delivered by AMQP.

> Calling of `/ingestion/fetch/*` or `/digestion/upload`  might be a bit long, do not worry if you feel stuck, check logs of pollution service, they are rich.

> Also, installation of packages of Debian GNU+Linux might be time consuming in Docker. Debian was chosen due to that it has much richer repository for legacy dynamic .so libraries, which are required in this project.

> For pagination approach I used cursor-based pagination, because it has proven to be faster than skip-limit pagination.

> Unfortunatelly, I didn't have any more time left to implement end-to-end or unit testing.

> OpenAQ API is really sensitive to queries with Datetime parameters and might give 500s even if data is correct.

## Running

0. Check your Docker Engine properties either via Docker Compose or via system shell. It must have a properly configured property of `dns` with value of `["8.8.8.8", "8.8.4.4"]`. Example:

```json
{
  "builder": {
    "gc": {
      "defaultKeepStorage": "20GB",
      "enabled": true
    }
  },
  "experimental": false,
  "dns": ["8.8.8.8", "8.8.4.4"]
}
```

This is required for `yarn` to resolve its registry properly.

1. Be sure to fill `.env` file from `.env.example`. You may leave all as is but make sure the `OPENAQ_API_KEY` is valid! Register an account or contact me so I could provide you with my key.

2. Run whole infrastructure with environment specified in `.env`:

```sh
docker compose up --env-file .env
```

2. Once all is up and running, procceed to these resources:

- [http://127.0.0.1:3000/api] - Swagger for calling pollution API for gathering air quality data, uploading and etc.
- [http://127.0.0.1:3001/api] - Swagger for calling logger API for searching through events and getting .pdf report

## Project structure

### Simplified and without unnecessary details.

```plain
.
├── apps                        NestJS apps
│   ├── logger                  Logger app, listens to AMQP
│   │   └── src
│   │       └── modules
│   │           ├── app         Main module of this app
│   │           ├── ingestion   Module for event listening and processing
│   │           └── search      Search module, also responsible for .pdf
│   └── pollution               Pollution app, based around OpenAQ API
│       └── src
│           └── modules
│               ├── app         Main module of this app
│               ├── digestion   Processing of .xlsx/.json uploads
│               ├── ingestion   Long API querying, gives .xlsx/json
│               └── search      Searching through processed data
├── data                        Contains volume data of Docker        
└── libs                        Shared libraries
    ├── app-config              Lots of configs for modules
    ├── dtos                    DTOs of different disposition
    │   └── src
    │       ├── base            /-----------------
    │       ├── digestion       | 
    │       ├── event-search    |
    │       ├── ingestion       |   Simply DTOs
    │       ├── pollution-search|
    │       └── rabbitmq        \-----------------
    ├── exception-filters       Exception filters
    ├── mappings                Model-to-plain conversions
    ├── middlewares             Middlewares (ratting queries to AMQP)
    ├── mongo                   Mongo module (uses `mongodb` package)
    │   └── src
    │       ├── models          Models used in project
    │       └── repositories    Repositories used in project
    ├── rabbitmq                RabbitMQ Module
    ├── redis                   Redis module with TS service
    └── validators              File validator for uploads
```

## Additions that would be great

- Health check endpoints
- Better environment management
- Replacing all relative imports with absolute ones (this has proven to be a little unsafe, because NestJS dependency resolver says that there is circular dependency in modules, meanwhile there is no such problem)
- Better styling of .pdf report
- End-to-end and unit testing with decent coverage
- More strict configuration of `eslint` and `prettier`
- Environment variables validation
- Enforcing garbage collection
- JSDoc all over the place in methods, classes and functions
