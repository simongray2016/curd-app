# CURD App

A simplified CURD application built with Angular, Angular Material and TailwindCSS

## Setting up development environment

Run commands by steps:

- `git clone https://github.com/simongray2016/curd-app.git`
- `cd curd-app`

The application uses [JSON Server](https://github.com/typicode/json-server#getting-started) for mock REST API so you should generate the server by following the steps:

- `npm run generate`
- `npm run server`
- The API server should run on `http://localhost:3000`
- `npm run start` for angular web application
- The angular web application should run on `http://localhost:4200/`

## Main features

- Create item
- Update item
- Read item
- Delete item
- Search item
- Sort items list
- Filter items list
- Pagination

# Tech stack
- [Angular](https://angular.io/)
- [Angular Material](https://material.angular.io/)
- [TailwindCSS](https://tailwindcss.com/)
- [JSON Server](https://github.com/typicode/json-server)