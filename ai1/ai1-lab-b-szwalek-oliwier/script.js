class Todo {
    constructor() {
        this.tasks = [];
        this.editingTaskId = null;
        this.term = '';
        document.addEventListener('click', (e) => this.handleOutsideClick(e));
        this.init();
    }

    init() {
        this.loadTasks();
        this.setupEventListeners();
        this.draw();
    }

    loadTasks() {
        const savedTasks = localStorage.getItem('tasks');
        if (savedTasks) {
            this.tasks = JSON.parse(savedTasks);
        }
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }


    setupEventListeners() {
        const addTaskBtn = document.getElementById('addTaskBtn');
        const taskInput = document.getElementById('taskInput');
        const searchInput = document.getElementById('searchInput');

        addTaskBtn.addEventListener('click', () => this.addTask());
        
        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTask();
            }
        });

        searchInput.addEventListener('input', (e) => {
            this.term = e.target.value;
            this.draw();
        });

        document.addEventListener('click', (e) => {
            if (this.editingTaskId !== null) {
                const taskItem = document.querySelector(`[data-task-id="${this.editingTaskId}"]`);
                if (taskItem && !taskItem.contains(e.target)) {
                    this.editingTaskId = null;
                    this.draw();
                }
            }
        });
    }

    validateTaskText(text) {
        const errors = [];
        
        if (!text || text.trim().length < 3) {
            errors.push('Zadanie musi mieć co najmniej 3 znaki');
        }
        
        if (text && text.length > 255) {
            errors.push('Zadanie nie może mieć więcej niż 255 znaków');
        }
        
        return errors;
    }

    validateDeadline(deadline) {
        if (!deadline) {
            return [];
        }
        
        const selectedDate = new Date(deadline);
        const now = new Date();
        
        if (selectedDate <= now) {
            return ['Data musi być w przyszłości'];
        }
        
        return [];
    }

    showErrors(inputId, errorId, errors) {
        const input = document.getElementById(inputId);
        const errorDiv = document.getElementById(errorId);
        
        if (errors.length > 0) {
            input.classList.add('error');
            errorDiv.textContent = errors.join(', ');
            return false;
        } else {
            input.classList.remove('error');
            errorDiv.textContent = '';
            return true;
        }
    }

    addTask() {
        const taskInput = document.getElementById('taskInput');
        const deadlineInput = document.getElementById('deadlineInput');
        const taskText = taskInput.value.trim();
        const deadline = deadlineInput.value;

        const textErrors = this.validateTaskText(taskText);
        const dateErrors = this.validateDeadline(deadline);
        
        const textValid = this.showErrors('taskInput', 'taskError', textErrors);
        const dateValid = this.showErrors('deadlineInput', 'dateError', dateErrors);

        if (!textValid || !dateValid) {
            return;
        }

        const task = {
            id: Date.now(),
            text: taskText,
            deadline: deadline || null,
            createdAt: new Date().toISOString(),
            completed: false
        };

        this.tasks.unshift(task);
        this.saveTasks();
        this.draw();

        taskInput.value = '';
        deadlineInput.value = '';
        taskInput.classList.remove('error');
        deadlineInput.classList.remove('error');
    }

    deleteTask(taskId) {
        if (confirm('Czy na pewno chcesz usunąć to zadanie?')) {
            this.tasks = this.tasks.filter(task => task.id !== taskId);
            this.saveTasks();
            this.draw();
        }
    }

    startEdit(taskId) {
        this.editingTaskId = taskId;
        this.draw();
    }

    saveEdit(taskId) {
        const editInput = document.getElementById(`edit-text-${taskId}`);
        const editDate = document.getElementById(`edit-date-${taskId}`);

        if (!editInput || !editDate) {
            return;
        }

        const newText = editInput.value.trim();
        const newDeadline = editDate.value;

        const textErrors = this.validateTaskText(newText);
        const dateErrors = this.validateDeadline(newDeadline);

        if (textErrors.length > 0) {
            alert(textErrors.join('\n'));
            editInput.focus();
            return;
        }

        if (dateErrors.length > 0) {
            alert(dateErrors.join('\n'));
            editDate.focus();
            return;
        }

        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.text = newText;
            task.deadline = newDeadline || null;
            this.saveTasks();
        }

        this.editingTaskId = null;
        this.draw();
    }

    highlightText(text, searchQuery) {
        if (!searchQuery || searchQuery.length < 2) {
            return this.escapeHtml(text);
        }

        const escapedText = this.escapeHtml(text);
        const escapedQuery = this.escapeHtml(searchQuery);
        const regex = new RegExp(`(${escapedQuery})`, 'gi');
        
        return escapedText.replace(regex, '<span class="highlight">$1</span>');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatDate(dateString) {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = date - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        const formatted = date.toLocaleString('pl-PL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        if (diffDays < 0) {
            return `${formatted} (po terminie)`;
        } else if (diffDays === 0) {
            return `${formatted} (dziś!)`;
        } else if (diffDays === 1) {
            return `${formatted} (jutro)`;
        } else if (diffDays <= 7) {
            return `${formatted} (za ${diffDays} dni)`;
        } else {
            return `${formatted}`;
        }
    }

    
    filter(){
        if(!this.term.length || this.term.length <2) return this.tasks;
        return this.tasks.filter(task => task.text.toLowerCase().includes(this.term.toLowerCase()));
    }

    get filteredTasks(){
        return this.filter();
    }

    draw() {
        const taskList = document.getElementById('taskList');
        const filteredTasks = this.filteredTasks;
        
        if (filteredTasks.length === 0) {
            if (this.term && this.term.length >= 2) {
                taskList.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-text">Nie znaleziono zadań zawierających "${this.escapeHtml(this.term)}"</div>
                    </div>
                `;
            } else {
                taskList.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-text">Brak zadań. Dodaj pierwsze zadanie poniżej!</div>
                    </div>
                `;
            }
            return;
        }

        taskList.innerHTML = filteredTasks.map(task => {
            if (this.editingTaskId === task.id) {
                return `
                    <div class="task-item editing" data-task-id="${task.id}">
                        <input type="checkbox" class="task-checkbox" data-task-id="${task.id}" ${task.completed ? 'checked' : ''} />
                        <div class="task-content">
                            <input type="text" id="edit-text-${task.id}" class="task-edit-input" value="${this.escapeHtml(task.text)}" maxlength="255" />
                            <input type="datetime-local" id="edit-date-${task.id}" class="task-edit-date" value="${task.deadline || ''}" />
                            <div class="edit-controls">
                                <button class="save-btn" data-task-id="${task.id}">Zapisz</button>
                                <button class="cancel-btn" data-task-id="${task.id}">Anuluj</button>
                            </div>
                        </div>
                        <button class="delete-btn" data-task-id="${task.id}">🗑️ Usuń</button>
                    </div>
                `;
            }

            return `
                <div class="task-item" data-task-id="${task.id}">
                    <input type="checkbox" class="task-checkbox" data-task-id="${task.id}" ${task.completed ? 'checked' : ''} />
                    <div class="task-content">
                        <div class="task-text">${this.highlightText(task.text, this.term)}</div>
                        ${task.deadline ? `<div class="task-deadline">${this.formatDate(task.deadline)}</div>` : ''}
                    </div>
                    <button class="delete-btn" data-task-id="${task.id}">🗑️ Usuń</button>
                </div>
            `;
        }).join('');

        document.querySelectorAll('.task-text').forEach(el => {
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                const taskId = parseInt(el.closest('.task-item').dataset.taskId);
                this.startEdit(taskId);
            });
        });

        document.querySelectorAll('.task-checkbox').forEach(cb => {
            cb.addEventListener('click', (e) => {
                e.stopPropagation();
                const taskId = parseInt(cb.dataset.taskId);
                const task = this.tasks.find(t => t.id === taskId);
                if (task) {
                    task.completed = !!cb.checked;
                    this.saveTasks();
                    this.draw();
                }
            });
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const taskId = parseInt(btn.dataset.taskId);
                this.deleteTask(taskId);
            });
        });

        document.querySelectorAll('.save-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const taskId = parseInt(btn.dataset.taskId);
                this.saveEdit(taskId);
            });
        });

        document.querySelectorAll('.cancel-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.editingTaskId = null;
                this.draw();
            });
        });

        document.querySelectorAll('.task-edit-input').forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const taskId = parseInt(input.closest('.task-item').dataset.taskId);
                    this.saveEdit(taskId);
                }
            });
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.editingTaskId = null;
                    this.draw();
                }
            });
        });
    }

    handleOutsideClick(e) {
        if (this.editingTaskId !== null) {
            const editingEl = document.querySelector(`.task-item[data-task-id="${this.editingTaskId}"]`);
            if(editingEl && !editingEl.contains(e.target)) {
                this.editingId = null;
                this.draw();
            }
        }
    }

    
}



document.addEventListener('DOMContentLoaded', () => {
    new Todo();
});