;(function () {
    'use strict';

    function TaskManager() {
        this._tasks = {};
        this._list = this._createList();
        this._form = this._createForm();
        this._template = this._createTemplate();

        //инициализация из localStorage
        this.loadFromStore();
    }

    TaskManager.prototype._createList = function () {
        var list = document.createElement("UL");

        list.className = "task-manager__list";

        return list;
    }

    TaskManager.prototype._createForm = function () {
        var self = this;
        var form = document.createElement('FORM');
        var btn = document.createElement('BUTTON');
        var input = document.createElement('INPUT');


        input.type = 'text';
        input.name = 'title';
        input.placeholder = 'title';
        input.oninput = input.onchange = input.onpaste = input.oncut = function (e) {
            var value = e.target.value;

            if(value) {
                btn.disabled = false;
            } else {
                btn.disabled = true;
            }
        }


        btn.innerHTML = 'Add';
        btn.type = 'button';
        btn.disabled = true;
        btn.addEventListener('click', function () {
            var id = self.getTaskCount() + 1;
            var item = {id: id, title: input.value, isCompleted: false};

            self.addTask(item, function () {
                self._tasks[id] = item;
                self.updateStore();
                self.sortTasks();
                input.value = '';
                btn.disabled = true;
            });
        });

        form.appendChild(input);
        form.appendChild(btn);

        return form;
    }

    TaskManager.prototype._createTemplate = function () {
        var self = this;
        var template = document.createElement('DIV');
        var listContainer = document.createElement('DIV');
        var formContainer = document.createElement('DIV');

        template.className = 'task-manager';
        listContainer.className = 'list-container';
        formContainer.className = 'form-container';

        listContainer.appendChild(self._list);
        formContainer.appendChild(self._form);
        template.appendChild(listContainer);
        template.appendChild(formContainer);

        return template;

    }

    TaskManager.prototype.appendTo = function (container) {
        container.appendChild(this._template);
    }

    TaskManager.prototype.getTaskCount = function () {
        var self = this;
        var count = 0;

        for(var key in self._tasks) {
            if(self._tasks.hasOwnProperty(key))
                count++;
        }

        return count;
    }
    
    TaskManager.prototype.addTask = function (taskItem, onAfterAdd) {
        var self = this;
        var taskNode = document.createElement('LI');
        var taskTitle = document.createElement('SPAN');
        var completeBtn = document.createElement('BUTTON');
        var editBtn = document.createElement('BUTTON');
        var removeBtn = document.createElement('BUTTON');

        taskTitle.innerHTML = taskItem.title;
        completeBtn.className = 'task-btn--complete';
        editBtn.className = 'task-btn--edit';
        removeBtn.className = 'task-btn--complete';

        completeBtn.addEventListener('click', function () {
            self.markAsComplete(taskItem.id, taskNode);
        });

        editBtn.addEventListener('click', function () {
            self.editTask(taskItem.id, taskNode);
        })

        removeBtn.addEventListener('click', function () {
            self.removeTask(taskItem.id, taskNode);
        })

        taskNode.appendChild(taskTitle);
        taskNode.appendChild(completeBtn);
        taskNode.appendChild(editBtn);
        taskNode.appendChild(removeBtn);

        self._list.appendChild(taskNode);

        //вызываем коллбэк, если он есть
        if(typeof onAfterAdd == 'function') {
            onAfterAdd();
        }
    }

    TaskManager.prototype.editTask = function (id, item) {
        var self = this;
        var title = item.querySelector('span');
        var editContainter = document.createElement('DIV');
        var input = document.createElement('INPUT');
        var btn = document.createElement('BUTTON');

        editContainter.className = 'edit-container';

        title.style.display = 'none';

        input.value = title.innerText;
        btn.addEventListener('click', function () {
            title.innerHTML = input.value;
            title.style.display = 'inline-block';
            item.removeChild(editContainter);

            self._tasks[id].title = input.value;
            self.sortTasks();
            self.updateStore();
        });

        editContainter.appendChild(input);
        editContainter.appendChild(btn);

        item.prepend(editContainter);
    }
    
    TaskManager.prototype.removeTask = function (id, item) {
        var self = this;

        self._list.removeChild(item);
        delete self._tasks[id];

        self.updateStore();
    }

    TaskManager.prototype.markAsComplete = function (id, item) {
        console.log(arguments)
    }

    TaskManager.prototype.sortTasks = function () {
        var self = this;
        var items = self._list.querySelectorAll('li');

        var itemsArray = [];

        for(var i=0; i<items.length; i++) {
            itemsArray[i] = items[i];
        }

        itemsArray.sort(function (a,b) {
            return a.innerText.toLowerCase() > b.innerText.toLowerCase();
        });

        for (var i = 0, length = items.length; i < length; i++)  {
            self._list.removeChild(items[i]);
        }

        for (var i = 0, length = items.length; i < length; i++)  {
            self._list.appendChild(itemsArray[i]);
        }
    }
    
    TaskManager.prototype.loadFromStore = function () {
        var self = this;

        if (typeof(localStorage) != "undefined") {
            self._tasks = JSON.parse(localStorage.getItem('tasks'));

            for(var key in self._tasks) {
                self.addTask(self._tasks[key]);
            }

            self.sortTasks();

        } else {
            console.log("Sorry, your browser does not support Web Storage...");
        }
    }

    TaskManager.prototype.updateStore = function () {
        var self = this;

        if (typeof(localStorage) != "undefined") {
            localStorage.setItem('tasks', JSON.stringify(self._tasks));
        } else {
            console.log("Sorry, your browser does not support Web Storage...");
        }
    }

    window.TaskManager = TaskManager;
})();
