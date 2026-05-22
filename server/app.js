import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Progress } from './models.js';

// Factory so server.js and tests share the exact same app instance.
// Mongo connection is the caller's responsibility (server.js connects to
// the real DB; tests connect to mongodb-memory-server before calling this).
export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // Auth Middleware (verbatim from the original server.js — verifies a valid JWT only).
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

  // Authorization Middleware (NEW — canonical cross-plan auth fix).
  // `auth` only proves the JWT is valid; it does NOT check role. The JWT payload is
  // just { id } (see signup/login), so role is not in the token and must be read from
  // the DB. Chain this AFTER `auth` so req.userId is populated. Non-teacher -> 403.
  const requireTeacher = async (req, res, next) => {
    try {
      const user = await User.findById(req.userId);
      if (!user) return res.status(401).send({ error: 'Please authenticate.' });
      if (user.role !== 'teacher') {
        return res.status(403).send({ error: 'Teacher access required.' });
      }
      next();
    } catch (e) {
      res.status(500).send();
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
      // Build the update from only the fields the payload actually carries, so a
      // GAME_SESSION sync (xp/coins/...) and a MASTERY_UPDATE sync (masteryState/
      // interactionLog) can each touch their own fields without clobbering the other.
      const SYNCABLE = ['xp', 'coins', 'level', 'streak', 'history',
        'achievements', 'masteryState', 'interactionLog'];
      const update = { updatedAt: new Date() };
      for (const key of SYNCABLE) {
        if (req.body[key] !== undefined) update[key] = req.body[key];
      }
      const progress = await Progress.findOneAndUpdate(
        { userId: req.userId },
        { $set: update },
        { new: true, upsert: true }
      );
      res.send(progress);
    } catch (e) {
      res.status(400).send(e.message);
    }
  });

  app.get('/api/teacher/students', auth, async (req, res) => {
    try {
      const students = await User.find({ role: 'student' });
      const studentData = await Promise.all(students.map(async (s) => {
        const p = await Progress.findOne({ userId: s._id });
        return { ...s._doc, progress: p };
      }));
      res.send(studentData);
    } catch (e) {
      res.status(500).send();
    }
  });

  // Adaptive engine (spec §7): per-student mastery for the teacher dashboard.
  // Returns exactly the shape src/engine/engineAPI.classMastery(students) consumes:
  //   [{ id, name, attempts: <scalar>, mastery: { [skillId]: P } }]
  // The client engine computes perSkill means + fairRanking; the server only reshapes.
  // Guarded by auth (valid JWT) THEN requireTeacher (role === 'teacher', else 403).
  app.get('/api/teacher/class-mastery', auth, requireTeacher, async (req, res) => {
    try {
      const students = await User.find({ role: 'student' });
      const rows = await Promise.all(students.map(async (s) => {
        const p = await Progress.findOne({ userId: s._id }).lean();
        const ms = p?.masteryState ?? {};
        const belief = ms.belief ?? {};
        const attemptsMap = ms.attempts ?? {};

        // Scalar total attempts = sum of per-skill counts.
        const attempts = Object.values(attemptsMap)
          .reduce((sum, n) => sum + (Number(n) || 0), 0);

        // Only skills the student has actually attempted (fairRanking contract:
        // a dense prior belief map would inflate every skill's mastery).
        const mastery = {};
        for (const skillId of Object.keys(attemptsMap)) {
          if (belief[skillId] != null) mastery[skillId] = belief[skillId];
        }

        return { id: s._id, name: s.name, attempts, mastery };
      }));
      res.send(rows);
    } catch (e) {
      res.status(500).send();
    }
  });

  return app;
}
