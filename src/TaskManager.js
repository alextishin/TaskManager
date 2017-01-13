;(function () {
    'use strict';

    function TaskManager() {
        this._tasks = {};
        this._mode = 'create';
        this._list = this._createList();
        this._form = this._createForm();
        this._template = this._createTemplate();


        //инициализация из localStorage
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

        btn.innerHTML = 'Add';
        btn.type = 'button';
        btn.addEventListener('click', function () {
            self.addTask();
        })

        form.innerHTML =    '<div class="form-element">' +
                                '<input type="text" name="title" placeholder="Title">' +
                            '</div>';

        form.appendChild(btn);

        return form;
    }

    TaskManager.prototype._createTemplate = function () {
        var template = document.createElement('DIV');

        template.className = 'task-manager';

        template.appendChild(this._list);
        template.appendChild(this._form);

        return template;

    }

    TaskManager.prototype.appendTo = function (container) {
        container.appendChild(this._template);
    }
    
    TaskManager.prototype.addTask = function () {
        
    }
    
    TaskManager.prototype.editTask = function () {
        
    }
    
    TaskManager.prototype.removeTask = function () {
        
    }

    window.TaskManager = TaskManager;
})();
