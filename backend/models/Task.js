import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    maxlength: 50 
  },
  description: { 
    type: String, 
    required: true,
    maxlength: 200 
  },
  timestamp: { 
    type: Date, 
    required: true 
  },
  dueDate: { 
    type: Date, 
    required: true 
  },
  category: { 
    type: String, 
    required: true,
    enum: ['ToDo', 'InProgress', 'Done'],
    default: 'ToDo'
  },
  userName: { 
    type: String, 
    required: true 
  },
  userEmail: { 
    type: String, 
    required: true 
  },
  serial: {
    type: Number,
    default: 1
  },
  isLocked: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export default mongoose.model('Task', taskSchema);