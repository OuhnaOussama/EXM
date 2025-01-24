require('dotenv').config();
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const app = express();
app.use(express.json()); 
const port = process.env.PORT || 3000;

app.post('/tasks', async (req, res) => {
  const { title, description, categoryId } = req.body;

  if (!title || !categoryId) {
    return res.status(400).json({ error: 'Title and categoryId are required' });
  }

  try {
    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        categoryId,
      },
    });
    res.status(201).json(newTask);
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(500).json({ error: 'Error creating task' });
  }
});

app.get('/tasks', async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: {
        status: 'active',
      },
      include: {
        category: true, 
      },
    });
    res.json(tasks);
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ error: 'Error fetching tasks' });
  }
});

app.put('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, categoryId } = req.body;

  if (!title && !description && !categoryId) {
    return res.status(400).json({ error: 'At least one field (title, description, or categoryId) must be provided' });
  }

  try {
    if (categoryId) {
      const category = await prisma.category.findUnique({ where: { id: categoryId } });
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }
    }

    const updatedTask = await prisma.task.update({
      where: { id: parseInt(id) },
      data: {
        title,
        description,
        categoryId,
      },
    });
    res.json(updatedTask);
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(500).json({ error: 'Error updating task' });
  }
});

app.delete('/tasks/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      const deletedTask = await prisma.task.update({
        where: { id: parseInt(id, 10) }, 
        data: { status: 'deleted' },
      });
      res.json(deletedTask);
    } catch (err) {
      console.error('Error deleting task:', err);
      res.status(500).json({ error: 'Error deleting task' });
    }
  });
  

app.get('/categories', async (req, res) => {
  try {
    const categories = await prisma.category.findMany();
    res.json(categories);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: 'Error fetching categories' });
  }
});

app.post('/categories', async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Category name is required' });
  }

  try {
    const category = await prisma.category.create({
      data: {
        name,
      },
    });
    res.status(201).json(category);
  } catch (err) {
    console.error('Error creating category:', err);
    res.status(500).json({ error: 'Error creating category' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
