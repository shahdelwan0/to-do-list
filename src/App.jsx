import React, { useState } from 'react';
import { Plus, X, Edit3, Check, Trash2 } from 'lucide-react';

export default function TodoApp() {
    const [tasks, setTasks] = useState([
        { id: 1, text: 'Изучить React', completed: false },
        { id: 2, text: 'Создать TODO приложение', completed: true },
        { id: 3, text: 'Добавить стильный дизайн', completed: true },
        { id: 4, text: 'Выиграть катку в доту', completed: false }
    ]);

    const [newTask, setNewTask] = useState('');
    const [filter, setFilter] = useState('all');
    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState('');


    const addTask = () => {
        if(newTask.trim()){
            setTasks([...tasks, {
                    id: Date.now(),
                    text: newTask,
                    completed: false
                }]);
            setNewTask('');
        }
    }

    const toggleTask = (id) => {
        setTasks(tasks.map(task => task.id === id ? {...task, completed: !task.completed} : task));
    }

    const clearCompleted = () => {
        setTasks(tasks.filter(task => !task.completed));
    }

    const deleteTask = (id) => {
        setTasks(tasks.filter(task=> task.id !== id));
    }

    const startEditing = (id, text) => {
        setEditingId(id);
        setEditText(text);
    };

    const saveEdit = () => {
        if (editText.trim()) {
            setTasks(tasks.map(task =>
                task.id === editingId ? { ...task, text: editText.trim() } : task
            ));
        }
        setEditingId(null);
        setEditText('');
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditText('');
    };

    const filteredTasks = tasks.filter(task => {
        if (filter === 'active') return !task.completed;
        if (filter === 'completed') return task.completed;
        return true;
    });

    const activeTasks = tasks.filter(task => !task.completed).length;
    const completedTasks = tasks.filter(task => task.completed).length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
                        ToDo List
                    </h1>
                    <p className="text-gray-600 text-lg">Организуйте свои задачи эффективно</p>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
                    <div className="p-8 border-b border-gray-100">
                        <div className="flex gap-3">
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    value={newTask}
                                    onChange={e =>setNewTask(e.target.value)}
                                    onKeyPress={e => e.key === 'Enter' && addTask()}
                                    placeholder="Добавить новую задачу..."
                                    className="w-full px-6 py-4 text-lg bg-gray-50/80 backdrop-blur-sm border-2 border-transparent rounded-2xl focus:border-indigo-400 focus:bg-white transition-all duration-300 outline-none"
                                />
                            </div>
                            <button
                                onClick={addTask}
                                className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                                <Plus size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="px-8 py-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-100">
                        <div className="flex justify-between items-center text-sm">
                            <div className="flex gap-6">
                            <span className="text-indigo-600 font-medium">
                              📝 Активных: <span className="font-bold">{activeTasks}</span>
                            </span>
                                            <span className="text-green-600 font-medium">
                              ✅ Выполнено: <span className="font-bold">{completedTasks}</span>
                            </span>
                            </div>
                            {completedTasks > 0 && (
                                <button
                                    onClick={clearCompleted}
                                    className="text-red-500 hover:text-red-700 font-medium transition-colors">
                                    Очистить выполненные
                                </button>
                            )}
                        </div>
                    </div>


                    <div className="max-h-96 overflow-y-auto">
                        {filteredTasks.length === 0 ? (
                            <div className="p-12 text-center text-gray-400">
                                <div className="text-6xl mb-4">📝</div>
                                <p className="text-lg">
                                    {filter === 'all' ? 'Задач пока нет' :
                                        filter === 'active' ? 'Нет активных задач' :
                                            'Нет выполненных задач'}
                                </p>
                            </div>
                            ) : (
                            <div className="divide-y divide-gray-100">
                                {filteredTasks.map((task, index) => (
                                    <div
                                        key={task.id}
                                        className={`group p-6 hover:bg-gray-50/80 transition-all duration-200 ${
                                            task.completed ? 'bg-green-50/30' : ''
                                        }`}>
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => toggleTask(task.id)}
                                                className={`flex-shrink-0 w-6 h-6 rounded-full border-2 transition-all duration-200 ${
                                                    task.completed
                                                        ? 'bg-green-500 border-green-500 text-white'
                                                        : 'border-gray-300 hover:border-indigo-400'
                                                }`}>
                                                {task.completed ? <Check size={16} className="m-auto" /> : null}
                                            </button>

                                            <div className="flex-1">
                                                {editingId === task.id ? (
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            value={editText}
                                                            onChange={e => setEditText(e.target.value)}
                                                            className="flex-1 px-3 py-2 border border-indigo-300 rounded-lg focus:outline-none focus:border-indigo-500"
                                                            autoFocus
                                                        />
                                                        <button
                                                            onClick={() => saveEdit(task.id)}
                                                            className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                                                            <Check size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => cancelEdit(task.id)}
                                                            className="px-3 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500">
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                    ) : (
                                                    <span
                                                        className={`text-lg transition-all duration-200 ${
                                                            task.completed
                                                                ? 'line-through text-gray-500'
                                                                : 'text-gray-800'
                                                        }`}>
                                                        {task.text}
                                                    </span>
                                                )}
                                            </div>

                                            {editingId !== task.id && (
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => startEditing(task.id, task.text)}
                                                        className="p-2 text-indigo-500 hover:bg-indigo-100 rounded-lg transition-colors"
                                                    >
                                                        <Edit3 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteTask(task.id)}
                                                        className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="text-center mt-8 text-gray-500">
                    <p>Создано с ❤️ для продуктивности</p>
                </div>
            </div>
        </div>
    );
}