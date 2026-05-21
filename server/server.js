import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { User, Progress } from './models.js';

// Game ID to display name mapping for enriching history entries
const GAME_ID_TO_NAME = {
  'arithmetic': 'Number Ninja',
  'number-catcher': 'Number Catcher',
  'balloon-pop': 'Balloon Pop',
  'geometry': 'Shape Explorer',
  'meteor': 'Multiplication Meteor',
  'fractions': 'Fraction Frenzy',
  'farm-multiply': 'Multiplication Farm',
  'math-racing': 'Math Racing',
  'balancer': 'Equation Balancer',
  'decimal-mall': 'Decimal Mall',
  'fraction-ninja': 'Fraction Ninja',
  'patterns': 'Pattern Puzzle',
  'coordinate-treasure': 'Treasure Map',
  'integer-mountain': 'Integer Mountain',
  'algebra-dungeon': 'Algebra Dungeon',
};

function hasCompletedAssignedSupport(progress) {
  const assigned = progress?.assignedSupport;
  if (!assigned?.gameId || assigned.completed) return Boolean(assigned?.completed);

  const assignedAt = assigned.assignedAt ? new Date(assigned.assignedAt).getTime() : 0;
  const expectedName = GAME_ID_TO_NAME[assigned.gameId]?.toLowerCase();

  return (progress.history || []).some((entry) => {
    const gameId = entry.gameId;
    const gameName = entry.gameName?.toLowerCase();
    const playedAt = new Date(entry.date || entry.timestamp || 0).getTime();
    const matchesGame =
      gameId === assigned.gameId ||
      gameName === assigned.gameId.toLowerCase() ||
      (expectedName && gameName === expectedName);

    return matchesGame && (!assignedAt || !playedAt || playedAt >= assignedAt);
  });
}

function isSameSupportAssignment(a, b) {
  if (!a?.gameId || !b?.gameId) return false;
  const aAssignedAt = a.assignedAt ? new Date(a.assignedAt).getTime() : 0;
  const bAssignedAt = b.assignedAt ? new Date(b.assignedAt).getTime() : 0;
  return a.gameId === b.gameId && aAssignedAt === bAssignedAt;
}

dotenv.config();
const app = express();
// Default mock client ID so backend doesn't crash if env is missing
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'dummy-client-id');

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Auth Middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) throw new Error();
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (e) {
    res.status(401).send({ error: 'Please authenticate.' });
  }
};

// Routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password, role, grade, avatar } = req.body;
    const hashedPassword = await bcrypt.hash(password, 8);

    const user = new User({ name, email, password: hashedPassword, role, grade, avatar });
    await user.save();

    const progress = new Progress({ userId: user._id });
    await progress.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send(e.message);
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error('Invalid login credentials');
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.status(200).send({ user, token });
  } catch (e) {
    res.status(400).send(e.message);
  }
});

app.post('/api/auth/google', async (req, res) => {
  try {
    const { credential, role } = req.body;

    // Verify Google Token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    // Find or create user
    let user = await User.findOne({ email });

    if (!user) {
      if (!role) {
         return res.status(400).send({ error: 'Role is required for first-time Google signin' });
      }
      // Create user with a dummy password since they use Google
      const dummyPassword = await bcrypt.hash(Math.random().toString(36), 8);
      user = new User({
        name,
        email,
        password: dummyPassword,
        role: role || 'student',
        grade: 3,
        avatar: role === 'student' ? '🧒' : '👩‍🏫' // Quick default avatar
      });
      await user.save();

      const progress = new Progress({ userId: user._id });
      await progress.save();
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.status(200).send({ user, token });
  } catch (e) {
    res.status(400).send({ error: 'Google authentication failed', details: e.message });
  }
});

app.get('/api/progress', auth, async (req, res) => {
  try {
    const progress = await Progress.findOne({ userId: req.userId });
    res.send(progress);
  } catch (e) {
    res.status(500).send();
  }
});

app.post('/api/sync', auth, async (req, res) => {
  try {
    const { xp, coins, level, streak, history, achievements, assignedSupport } = req.body;
    const existingProgress = await Progress.findOne({ userId: req.userId });
    let nextAssignedSupport = assignedSupport;

    if (
      existingProgress?.assignedSupport?.completed &&
      isSameSupportAssignment(assignedSupport, existingProgress.assignedSupport)
    ) {
      nextAssignedSupport = {
        ...assignedSupport,
        completed: true,
        assignedAt: assignedSupport.assignedAt || existingProgress.assignedSupport.assignedAt,
      };
    }

    if (nextAssignedSupport?.gameId && !nextAssignedSupport.completed) {
      const progressForCheck = { history, assignedSupport: nextAssignedSupport };
      if (hasCompletedAssignedSupport(progressForCheck)) {
        nextAssignedSupport = { ...nextAssignedSupport, completed: true };
      }
    }

    const progress = await Progress.findOneAndUpdate(
      { userId: req.userId },
      { xp, coins, level, streak, history, achievements, assignedSupport: nextAssignedSupport, updatedAt: new Date() },
      { new: true, upsert: true }
    );
    res.send(progress);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

app.delete('/api/auth/account', auth, async (req, res) => {
  try {
    // Delete user and their progress
    await User.findByIdAndDelete(req.userId);
    await Progress.findOneAndDelete({ userId: req.userId });
    res.status(200).send({ success: true, message: 'Account deleted' });
  } catch (e) {
    res.status(500).send({ error: 'Failed to delete account' });
  }
});

app.get('/api/teacher/students', auth, async (req, res) => {
  try {
    const students = await User.find({ role: 'student' });
    const studentData = await Promise.all(students.map(async (s) => {
      const p = await Progress.findOne({ userId: s._id });
      // Enrich history entries that are missing gameName
      if (p && Array.isArray(p.history)) {
        p.history = p.history.map(h => {
          const entry = h.toObject ? h.toObject() : { ...h };
          if (!entry.gameName && entry.gameId && GAME_ID_TO_NAME[entry.gameId]) {
            entry.gameName = GAME_ID_TO_NAME[entry.gameId];
          }
          return entry;
        });
      }
      if (p?.assignedSupport?.gameId && !p.assignedSupport.completed && hasCompletedAssignedSupport(p)) {
        p.assignedSupport.completed = true;
        p.markModified('assignedSupport');
        await p.save();
      }
      return { ...s._doc, progress: p };
    }));
    res.send(studentData);
  } catch (e) {
    res.status(500).send();
  }
});

app.post('/api/teacher/assign-support', auth, async (req, res) => {
  try {
    const { studentId, gameId, topic } = req.body;
    const progress = await Progress.findOneAndUpdate(
      { userId: studentId },
      {
        assignedSupport: {
          gameId,
          topic,
          assignedAt: new Date(),
          completed: false
        }
      },
      { new: true, upsert: true }
    );
    res.send(progress);
  } catch (e) {
    res.status(400).send({ error: e.message });
  }
});

app.get('/api/leaderboard', async (req, res) => {
  try {
    // Get progress entries sorted by XP, populate user info (including role),
    // then filter to only include students in the leaderboard.
    const allProgress = await Progress.find()
      .sort({ xp: -1 })
      .populate('userId', 'name avatar grade role');

    // Keep only entries where a user exists and the user is a student
    const studentProgress = allProgress.filter(p => p.userId && p.userId.role === 'student');

    const formatted = studentProgress.slice(0, 20).map((p) => ({
      id: p.userId._id,
      name: p.userId.name,
      avatar: p.userId.avatar,
      grade: p.userId.grade,
      level: p.level,
      xp: p.xp,
      streak: p.streak
    }));

    res.send(formatted);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
