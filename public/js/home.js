const hide = id => (document.getElementById(id).style.display = 'none');

const show = id => (document.getElementById(id).style.display = 'block');
const hideByOpacity = id => (document.getElementById(id).style.opacity = -1);
const showByOpacity = id => (document.getElementById(id).style.opacity = 1);

const clearValue = id => (document.getElementById(id).value = '');

const filter = function(searchText, classname) {
  const stickies = Array.from(document.getElementsByClassName('todo'));
  stickies.forEach(sticky => {
    const labels = Array.from(sticky.getElementsByClassName(classname)).concat([
      ''
    ]);
    const isMatch = labels.some(label => {
      const regEx = new RegExp(`^${searchText}`, 'g');
      return regEx.test(label.value);
    });
    if (isMatch) show(sticky.id);
    else hide(sticky.id);
  });
};

const createTask = function(textBoxId, todoId) {
  const taskName = document.getElementById(textBoxId).value;
  if (taskName) {
    sendXHR(
      JSON.stringify({ taskName, todoId }),
      'createTask',
      'POST',
      handleAllTodo
    );
  }
};

const editTaskCaption = function(caption, taskId) {
  if (caption) {
    sendXHR(
      JSON.stringify({ caption, taskId }),
      'editTaskCaption',
      'POST',
      handleAllTodo
    );
  } else alert('type something in text box and save');
};

const editTodoTitle = function(title, todoId) {
  if (title) {
    sendXHR(
      JSON.stringify({ title, todoId }),
      'editTodoTitle',
      'POST',
      handleAllTodo
    );
  } else alert('type something in text box and save');
};

const editTaskStatus = function(taskId) {
  sendXHR(JSON.stringify({ taskId }), 'editTaskStatus', 'POST', handleAllTodo);
};

const deleteTask = function(taskId) {
  sendXHR(JSON.stringify({ taskId }), 'deleteTask', 'POST', handleAllTodo);
};

const createTodo = function() {
  const todoName = document.getElementById('newTodoTitle').value;
  toggleNewListBox();
  sendXHR(JSON.stringify({ todoName }), 'createTodo', 'POST', handleAllTodo);
};

const deleteTodo = function(todoId) {
  sendXHR(JSON.stringify({ todoId }), 'deleteTodo', 'POST', handleAllTodo);
};

const loadTodos = function() {
  sendXHR({}, 'getTodos', 'GET', handleAllTodo);
};

const handleAllTodo = function() {
  const res = JSON.parse(this.response);
  if (res.errMsg) {
    document.location = '/';
    return;
  }
  const html = res
    .map(todo => {
      return createStickyTemplate(todo);
    })
    .join('');
  document.getElementById('window').innerHTML = html;
};

const logout = function() {
  console.log('something');
  sendXHR('', '/logout', 'POST', function() {
    document.location = '/';
  });
};

const toggleNewListBox = function() {
  const box = document.getElementById('newListPopup');
  const inputBox = document.querySelector('#newTodoTitle');
  if (box.className.includes('hide')) {
    box.classList.remove('hide');
    inputBox.focus();
  } else {
    box.classList.add('hide');
    inputBox.value = '';
  }
};

const toggleTodoDeleteBox = function(todoId) {
  const box = document.getElementById('deleteTodoPopup');
  if (box.className.includes('hide')) {
    box.classList.remove('hide');
    const deleteBtn = box.querySelector('#deleteBtn');
    console.log(todoId);
    deleteBtn.addEventListener('click', () => {
      deleteTodo(todoId);
      toggleTodoDeleteBox();
    });
  } else {
    box.classList.add('hide');
  }
};

const sendXHR = function(data, url, method, responseHandler) {
  const request = new XMLHttpRequest();
  request.open(method, url);
  request.setRequestHeader('Content-Type', 'application/json');
  request.send(data);
  request.onload = responseHandler;
};