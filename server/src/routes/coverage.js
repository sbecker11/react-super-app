const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

/**
 * Coverage Report Routes
 * Serves markdown coverage reports for client and server tests
 */

// Get client coverage report
router.get('/client', (req, res) => {
  const reportPath = path.join(__dirname, '../../../coverage-reports/client-coverage.md');

  try {
    if (!fs.existsSync(reportPath)) {
      return res.status(404).json({
        error: 'Client coverage report not found',
        message: 'Please run tests with coverage first: npm run test:coverage'
      });
    }

    const markdown = fs.readFileSync(reportPath, 'utf8');
    const stats = fs.statSync(reportPath);

    res.json({
      markdown,
      lastModified: stats.mtime,
      size: stats.size
    });
  } catch (error) {
    console.error('Error reading client coverage report:', error);
    res.status(500).json({ error: 'Failed to read coverage report' });
  }
});

// Get server coverage report
router.get('/server', (req, res) => {
  const reportPath = path.join(__dirname, '../../../coverage-reports/server-coverage.md');

  try {
    if (!fs.existsSync(reportPath)) {
      return res.status(404).json({
        error: 'Server coverage report not found',
        message: 'Please run server tests with coverage first: cd server && npm test -- --coverage'
      });
    }

    const markdown = fs.readFileSync(reportPath, 'utf8');
    const stats = fs.statSync(reportPath);

    res.json({
      markdown,
      lastModified: stats.mtime,
      size: stats.size
    });
  } catch (error) {
    console.error('Error reading server coverage report:', error);
    res.status(500).json({ error: 'Failed to read coverage report' });
  }
});

// Get both reports
router.get('/all', (req, res) => {
  const clientPath = path.join(__dirname, '../../../coverage-reports/client-coverage.md');
  const serverPath = path.join(__dirname, '../../../coverage-reports/server-coverage.md');

  const result = {
    client: null,
    server: null
  };

  try {
    if (fs.existsSync(clientPath)) {
      const markdown = fs.readFileSync(clientPath, 'utf8');
      const stats = fs.statSync(clientPath);
      result.client = {
        markdown,
        lastModified: stats.mtime,
        size: stats.size
      };
    }

    if (fs.existsSync(serverPath)) {
      const markdown = fs.readFileSync(serverPath, 'utf8');
      const stats = fs.statSync(serverPath);
      result.server = {
        markdown,
        lastModified: stats.mtime,
        size: stats.size
      };
    }

    res.json(result);
  } catch (error) {
    console.error('Error reading coverage reports:', error);
    res.status(500).json({ error: 'Failed to read coverage reports' });
  }
});

// Regenerate client coverage report
router.post('/regenerate/client', async (req, res) => {
  try {
    console.log('Regenerating client coverage report...');

    // Run the client tests with coverage
    const { stdout, stderr } = await execPromise('npm run test:coverage', {
      cwd: path.join(__dirname, '../../..'),
      timeout: 300000 // 5 minute timeout
    });

    console.log('Client coverage regenerated:', stdout);
    if (stderr) console.error('Stderr:', stderr);

    res.json({
      success: true,
      message: 'Client coverage report regenerated successfully'
    });
  } catch (error) {
    console.error('Error regenerating client coverage:', error);
    res.status(500).json({
      error: 'Failed to regenerate client coverage report',
      details: error.message
    });
  }
});

// Regenerate server coverage report
router.post('/regenerate/server', async (req, res) => {
  try {
    console.log('Regenerating server coverage report...');

    // Run the server tests with coverage
    const { stdout, stderr } = await execPromise('npm run test:coverage', {
      cwd: path.join(__dirname, '../../'),
      timeout: 300000 // 5 minute timeout
    });

    console.log('Server coverage regenerated:', stdout);
    if (stderr) console.error('Stderr:', stderr);

    res.json({
      success: true,
      message: 'Server coverage report regenerated successfully'
    });
  } catch (error) {
    console.error('Error regenerating server coverage:', error);
    res.status(500).json({
      error: 'Failed to regenerate server coverage report',
      details: error.message
    });
  }
});

module.exports = router;
