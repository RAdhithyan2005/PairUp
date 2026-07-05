const express = require('express');
const { Sandbox } = require('@e2b/code-interpreter');
const requireAuth = require('../middleware/auth');

const router = express.Router();

// E2B's code interpreter directly supports these out of the box
const SUPPORTED_LANGUAGES = ['javascript', 'python'];

// POST /api/execute
router.post('/', requireAuth, async (req, res) => {
  let sandbox;
  try {
    const { language, code } = req.body;

    if (!language || !code) {
      return res.status(400).json({ message: 'language and code are required' });
    }

    if (!SUPPORTED_LANGUAGES.includes(language)) {
      return res.status(400).json({ message: `Unsupported language: ${language}` });
    }

    sandbox = await Sandbox.create({ apiKey: process.env.E2B_API_KEY });

    const execution = await sandbox.runCode(code, { language });

    res.json({
      output: execution.logs.stdout.join('\n'),
      error: execution.logs.stderr.join('\n') || execution.error?.value || null,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Code execution failed' });
  } finally {
    if (sandbox) await sandbox.kill();
  }
});

module.exports = router;