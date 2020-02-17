const hide = id => (document.getElementById(id).style.display = 'none');

const show = id => (document.getElementById(id).style.display = 'block');
const hideByOpacity = id => (document.getElementById(id).style.opacity = -1);
const showByOpacity = id => (document.getElementById(id).style.opacity = 1);

const clearValue = id => (document.getElementById(id).value = '');

const filter = function(textBoxId, tagName) {
  const searchText = document.getElementById(textBoxId).value;
  const stickies = Array.from(document.getElementsByClassName('stickNote'));
  stickies.forEach(sticky => {
    const labels = Array.from(sticky.getElementsByTagName(tagName)).concat([
      ''
    ]);
    const isMatch = labels.some(label => {
      const regEx = new RegExp(`${searchText}`, 'g');
      return regEx.test(label.innerHTML);
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

const showEditTask = function(taskId) {
  const label = document.getElementById(`descriptionOf${taskId}`);
  const description = label.innerHTML;
  const input = `<input type="text" id="editedDescriptionOf${taskId}" class="smallerTextBox" value="${description}"/>`;
  label.innerHTML = input;
  const editIconSpan = document.getElementById(`editIconFor${taskId}`);
  const saveIcon = `<i id="saveIconFor${taskId}" class="fa fa-floppy-o" aria-hidden="true" onclick="editTaskCaption('editedDescriptionOf${taskId}','${taskId}')"></i>`;
  editIconSpan.innerHTML = saveIcon;
};

const showEditTitle = function(todoId) {
  const headingSpan = document.getElementById(`titleFor${todoId}`);
  const title = headingSpan.innerHTML;
  const input = `<input type="text" id="editedTitleOf${todoId}" class="smallerTextBox" value="${title}"/>`;
  headingSpan.innerHTML = input;
  const editIconSpan = document.getElementById(`editIconFor${todoId}`);
  const saveIcon = `<i id="saveIconFor${todoId}" class="fa fa-floppy-o" aria-hidden="true" onclick="editTodoTitle('editedTitleOf${todoId}','${todoId}')"></i>`;
  editIconSpan.innerHTML = saveIcon;
};

const editTaskCaption = function(textBoxId, taskId) {
  const caption = document.getElementById(textBoxId).value;
  if (caption) {
    sendXHR(
      JSON.stringify({ caption, taskId }),
      'editTaskCaption',
      'POST',
      handleAllTodo
    );
  } else alert('type something in text box and save');
};

const editTodoTitle = function(textBoxId, todoId) {
  const title = document.getElementById(textBoxId).value;
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
  sendXHR(JSON.stringify({ taskId }), 'editTaskStatus', 'POST', () => {});
};

const deleteTask = taskId =>
  sendXHR(JSON.stringify({ taskId }), 'deleteTask', 'POST', handleAllTodo);

const createTodo = function(textBoxId) {
  const todoName = document.getElementById(textBoxId).value;
  if (todoName) {
    sendXHR(JSON.stringify({ todoName }), 'createTodo', 'POST', handleAllTodo);
  }
};

const deleteTodo = function(todoId) {
  sendXHR(JSON.stringify({ todoId }), 'deleteTodo', 'POST', handleAllTodo);
};

const loadTodos = () => sendXHR({}, 'getTodos', 'GET', handleAllTodo);

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
  document.getElementById('mainBox').innerHTML = html;
};

const createStickyTemplate = function(todo) {
  const tasksInHtml = todo.tasks
    .map(task => {
      return createTaskTemplate(task);
    })
    .join('');
  const html = `<div class="stickNote" id="div${todo.id}">
            <img id="edit${todo.id}" class="editTodoIcon" src="./images/editTodoIcon.png" alt="edit" />
            <img id="delete${todo.id}"  class="deleteTodoIcon" src="./images/deleteTodoIcon.png" alt="delete" onclick="deleteTodo('${todo.id}')"/>
             <div class="stickyTitle">
               <h2><span id="titleFor${todo.id}">${todo.title}</span>&nbsp<span id="editIconFor${todo.id}"><i  class="fa fa-pencil" aria-hidden="true" onclick="showEditTitle('${todo.id}')"></i>&nbsp
               <i class="fa fa-chevron-down" aria-hidden="true" onclick="show('input${todo.id}')"></i></span></h2>
             </div>
             <div class="smallTextBoxDiv hideIt" id="input${todo.id}">
               <input type="text"  class="smallTextBox" name="stickyInputBox" id="taskTo${todo.id}" placeholder="type task and enter"/>
               <i  id="addIconFor${todo.id}" class="fa fa-plus-circle" aria-hidden="true" onclick="createTask('taskTo${todo.id}','${todo.id}')"></i>&nbsp
               <i id="cancelIconFor${todo.id}" class="fa fa-times-circle" aria-hidden="true" onclick="hide('input${todo.id}'),clearValue('taskTo${todo.id}')"></i>
             </div><br>
            <div id="tasksOf${todo.id}">
              ${tasksInHtml}
            </div>
          </div>`;
  return html;
};

const createTaskTemplate = function(task) {
  return `<div class="taskDiv" id="${
    task.id
  }"><input type="checkbox" name="checkBox" onclick="editTaskStatus('${
    task.id
  }')" id="checkbox${task.id}" ${
    task.done ? 'checked' : ''
  } /><label class="taskLabel" id="descriptionOf${task.id}" for="checkbox${
    task.id
  }">${task.caption}</label>&emsp;<span id="editIconFor${
    task.id
  }"><i  class="fa fa-pencil-square-o" aria-hidden="true" onclick="showEditTask('${
    task.id
  }')"></i>&nbsp<i id="deleteIconFor${
    task.id
  }" class="fa fa-minus-square-o" aria-hidden="true" onclick="deleteTask('${
    task.id
  }')"></i></span></div><br />`;
};

const logout = function() {
  sendXHR('', '/logout', 'POST', function() {
    document.location = '/';
  });
};

const sendXHR = function(data, url, method, responseHandler) {
  const request = new XMLHttpRequest();
  request.open(method, url);
  request.setRequestHeader('Content-Type', 'application/json');
  request.send(data);
  request.onload = responseHandler;
};
