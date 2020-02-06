const fs = require('fs');

const { App } = require('./app');
const { ToDoList, ToDo, Task } = require('../library/todoList');

const MIME_TYPES = {
  txt: 'text/plain',
  html: 'text/html',
  css: 'text/css',
  js: 'application/javascript',
  json: 'application/json',
  gif: 'image/gif',
  jpg: 'image/jpeg',
  png: 'image/png',
  pdf: 'application/pdf'
};

const TODO_STORE = `${__dirname}/../assets/todoList.json`;
const toDoList = ToDoList.load(fs.readFileSync(TODO_STORE, 'utf8') || '[]');

const serveStaticPage = function(req, res, next) {
  const publicFolder = `${__dirname}/../../public`;
  const path = req.url === '/' ? '/index.html' : req.url;
  const absolutePath = publicFolder + path;
  const stat = fs.existsSync(absolutePath) && fs.statSync(absolutePath);
  if (!stat || !stat.isFile()) {
    next();
    return;
  }
  const content = fs.readFileSync(absolutePath);
  const extension = path.split('.').pop();
  res.setHeader('Content-Type', MIME_TYPES[extension]);
  res.end(content);
};

const getToDos = function(req, res, next) {
  res.end(toDoList.toJSON());
};

const notFound = function(req, res) {
  res.setHeader('Content-Type', MIME_TYPES.html);
  res.writeHead(404);
  res.end('Not Found');
};
const methodNotAllowed = function(req, res) {
  res.setHeader('Content-Type', MIME_TYPES.html);
  res.writeHead(400);
  res.end('Method Not Allowed');
};

const readBody = function(req, res, next) {
  let data = '';
  req.on('data', chunk => (data += chunk));
  req.on('end', () => {
    req.body = data;
    next();
  });
};

const createToDo = function(req, res, next) {
  if (req.url !== '/createToDo') {
    next();
    return;
  }
  const { toDoName } = JSON.parse(req.body);
  const toDo = ToDo.load({ title: toDoName, startDate: new Date() });
  toDoList.addToDo(toDo);
  fs.writeFileSync(TODO_STORE, toDoList.toJSON());
  res.end(toDo.toJSON());
};

const createTask = function(req, res, next) {
  if (req.url !== '/createTask') {
    next();
    return;
  }
  const { taskName, todoId } = JSON.parse(req.body);
  const task = new Task(taskName, new Date());
  toDoList.addTask(todoId, task);
  fs.writeFileSync(TODO_STORE, toDoList.toJSON());
  res.end(task.toJSON());
};

const app = new App();
app.use(readBody);
app.get('', serveStaticPage);
app.get('/getToDos', getToDos);
app.post('/createTask', createTask);
app.post('/createToDo', createToDo);
app.get('', notFound);
app.post('', notFound);
app.use(methodNotAllowed);

module.exports = { app };
