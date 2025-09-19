const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Todo = require('../models/Todo');

// Get all todos for user
router.get('/', auth, async (req, res) => {
  try {
    const todos = await Todo.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(todos);
  } catch(err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Create todo
router.post('/', auth, async (req, res) => {
  try {
    const { title, description } = req.body;
    if(!title) return res.status(400).json({ message: 'Title required' });
    const todo = new Todo({ user: req.user.id, title, description });
    await todo.save();
    res.json(todo);
  } catch(err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Update todo - supports partial update or toggle when no body provided
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, completed } = req.body || {};
    const todo = await Todo.findOne({ _id: req.params.id, user: req.user.id });
    if(!todo) return res.status(404).json({ message: 'Todo not found' });
    if(title !== undefined) todo.title = title;
    if(description !== undefined) todo.description = description;
    if(completed !== undefined) todo.completed = completed;
    // If no fields provided, toggle completed
    if(title === undefined && description === undefined && completed === undefined) {
      todo.completed = !todo.completed;
    }
    await todo.save();
    res.json(todo);
  } catch(err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Delete todo
router.delete('/:id', auth, async (req, res) => {
  try {
    const todo = await Todo.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if(!todo) return res.status(404).json({ message: 'Todo not found' });
    res.json({ message: 'Todo removed' });
  } catch(err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
