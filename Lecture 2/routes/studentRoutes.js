import express from 'express';
import students from '../data/students.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({ success: true, data: students });
});

router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ success: false, message: 'Invalid ID' });

  const student = students.find((s) => s.id === id);
  if (!student) return res.status(404).json({ success: false, message: 'Student Not Found' });

  res.status(200).json({ success: true, data: student });
});

router.post('/', (req, res) => {
  const { name, course } = req.body;
  if (!name || !course) {
    return res.status(400).json({ success: false, message: 'Name and course are required' });
  }

  const newId = students.length > 0 ? Math.max(...students.map((s) => s.id)) + 1 : 1;
  const newStudent = { id: newId, name, course };
  students.push(newStudent);

  res.status(201).json({ success: true, message: 'New Student Created', data: newStudent });
});


router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { name, course } = req.body;

  const studentIndex = students.findIndex((s) => s.id === id);
  if (studentIndex === -1) {
    return res.status(404).json({ success: false, message: 'Student Not Found' });
  }

  if (name) students[studentIndex].name = name;
  if (course) students[studentIndex].course = course;

  res.status(200).json({ success: true, message: 'Student updated', data: students[studentIndex] });
});


router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const studentIndex = students.findIndex((s) => s.id === id);

  if (studentIndex === -1) {
    return res.status(404).json({ success: false, message: 'Student Not Found' });
  }

  const deletedStudent = students.splice(studentIndex, 1)[0];
  res.status(200).json({ success: true, message: 'Student deleted', data: deletedStudent });
});

export default router;
