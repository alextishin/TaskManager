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


        form.innerHTML = '<h2>Add Task</h2>';

        input.className = 'task-manager__input';
        input.type = 'text';
        input.name = 'title';
        input.placeholder = 'Title';
        input.maxLength = "50";
        input.oninput = input.onchange = input.onpaste = input.oncut = function (e) {
            var value = e.target.value;

            if(value) {
                btn.disabled = false;
            } else {
                btn.disabled = true;
            }
        }

        btn.className = 'task-manager__btn';
        btn.innerHTML = 'Add';
        btn.type = 'button';
        btn.disabled = true;
        btn.addEventListener('click', function () {
            var id = new Date().valueOf();
            var value = input.value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

            if(!self.compareTitle(value)) {
                var item = {id: id, title: value, isCompleted: false};


                self.addTask(item, function () {
                    //bug in mozzila
                    if(!self._tasks) self._tasks = {};


                    self._tasks[id] = item;
                    self.updateStore();
                    self.sortTasks();
                    input.value = '';
                    btn.disabled = true;
                });
            } else {
                alert('Task "'+value+'" are exist!');
            }


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


    TaskManager.prototype.addTask = function (taskItem, onAfterAdd) {
        var self = this;
        var taskNode = document.createElement('LI');
        var taskTitle = document.createElement('SPAN');
        var completeBtn = document.createElement('BUTTON');
        var editBtn = document.createElement('BUTTON');
        var removeBtn = document.createElement('BUTTON');

        taskNode.className = 'task-manager__task';

        taskTitle.className = 'task__title';
        taskTitle.innerHTML = taskItem.title;
        completeBtn.className = 'task__btn task__btn--complete';
        editBtn.className = 'task__btn task__btn--edit';
        removeBtn.className = 'task__btn task__btn--remove';

        completeBtn.addEventListener('click', function () {
            self.markAsComplete(taskNode, function () {
                self._tasks[taskItem.id].isCompleted = true;
                self.updateStore();
            });
        });

        editBtn.addEventListener('click', function () {

            completeBtn.setAttribute('disabled', 'disabled');
            editBtn.setAttribute('disabled', 'disabled');
            removeBtn.setAttribute('disabled', 'disabled');

            self.editTask(taskItem.id, taskNode, function () {
                completeBtn.removeAttribute('disabled');
                editBtn.removeAttribute('disabled');
                removeBtn.removeAttribute('disabled');
            });

        })

        removeBtn.addEventListener('click', function () {
            self.removeTask(taskItem.id, taskNode);
        })

        taskNode.appendChild(taskTitle);
        taskNode.appendChild(completeBtn);
        taskNode.appendChild(editBtn);
        taskNode.appendChild(removeBtn);

        if(taskItem.isCompleted)
            self.markAsComplete(taskNode);

        self._list.appendChild(taskNode);

        //вызываем коллбэк, если он есть
        if(typeof onAfterAdd == 'function') {
            onAfterAdd();
        }
    }

    TaskManager.prototype.editTask = function (id, item, onAfterEdit) {
        var self = this;
        var title = item.querySelector('span');
        var editContainter = document.createElement('DIV');
        var input = document.createElement('INPUT');
        var btn = document.createElement('BUTTON');

        editContainter.className = 'edit-container';

        title.style.display = 'none';

        input.className = 'task-manager__input task-manager__input--edit'
        input.value = title.textContent;

        btn.className = 'task__btn task__btn--save';
        btn.addEventListener('click', function () {

            var value = input.value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

            if(value == title.textContent || !self.compareTitle(value)) {
                title.innerHTML = value;
                title.style.display = 'table-cell';
                item.removeChild(editContainter);

                self._tasks[id].title = value;
                self.sortTasks();
                self.updateStore();

                if(typeof onAfterEdit == 'function') {
                    onAfterEdit();
                }
            } else {
                alert('Task "'+value+'" are exist!');
            }
        });

        editContainter.appendChild(input);
        editContainter.appendChild(btn);


        item.insertAdjacentElement('afterBegin', editContainter);


    }

    TaskManager.prototype.removeTask = function (id, item) {
        var self = this;

        self._list.removeChild(item);
        delete self._tasks[id];

        self.updateStore();
    }

    TaskManager.prototype.markAsComplete = function (item, afterComplete) {
        var btns = item.querySelectorAll('button');

        item.style.backgroundColor = 'rgba(70, 185, 80, 0.5)';

        btns[0].disabled = true;
        btns[1].disabled = true;

        btns[0].style.backgroundImage = 'none';
        btns[1].style.backgroundImage = 'none';

        if(typeof afterComplete == 'function') {
            afterComplete();
        }
    }

    TaskManager.prototype.sortTasks = function () {
        var self = this;
        var items = self._list.querySelectorAll('li');

        var itemsArray = [];

        for(var i=0; i<items.length; i++) {
            itemsArray[i] = items[i];
        }

        itemsArray.sort(function (a,b) {
            if(a.textContent.toLowerCase() > b.textContent.toLowerCase())
                return -1;
            else if (a.textContent.toLowerCase() < b.textContent.toLowerCase())
                return 1;
            return 0;
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
            alert("Sorry, your browser does not support Web Storage...");
        }
    }

    TaskManager.prototype.compareTitle = function (title) {
        var self = this;
        var compared = false;


        for(var key in self._tasks) {
            if(self._tasks[key].title.toLocaleLowerCase() == title.toLowerCase()) {
                compared = true;

                return compared;
            }
        }

        return compared;
    }

    TaskManager.prototype.updateStore = function () {
        var self = this;

        if (typeof(localStorage) != "undefined") {
            localStorage.setItem('tasks', JSON.stringify(self._tasks));
        }
    }

    window.TaskManager = TaskManager;
})();
