import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';

@Controller('xr')
export class XrController {
  @Get()
  getXrEnvironment(@Res() res: Response) {
    const rootPath = join(__dirname, '..', '..', 'public');
    return res.sendFile('index.html', { root: rootPath }, (err) => {
      if (err) {
        console.error('Error sending index.html:', err);
        res.status(500).send('Error sending index.html: ' + err.message + ' Root attempted: ' + rootPath);
      }
    });
  }

  @Get('demo')
  getXrDemo(@Res() res: Response) {
    const rootPath = join(__dirname, '..', '..', 'public');
    return res.sendFile('index.html', { root: rootPath }, (err) => {
      if (err) {
        console.error('Error sending index.html demo:', err);
        res.status(500).send('Error sending index.html demo: ' + err.message + ' Root attempted: ' + rootPath);
      }
    });
  }

  @Get('info')
  getXrInfo() {
    return {
      message: 'Tropical XR Paradise - Babylon.js Environment',
      features: [
        'WebXR VR/AR Support',
        'Tropical Beach Environment',
        'Animated Ocean Waves',
        'Swaying Palm Trees',
        'Multiplayer via Socket.IO',
        'Beach Umbrellas as Teleportation Points',
        'Floating Boats & Beach Decorations',
        'Dynamic Weather & Lighting',
        'Hand Tracking (if supported)',
        'Cross-platform compatibility',
      ],
      environment: {
        theme: 'Tropical Paradise',
        elements: [
          'Sandy beach with seashells',
          'Animated ocean with waves',
          'Palm trees with coconuts',
          'Floating sailboats',
          'Beach balls and decorations',
          'Gradient tropical sky with clouds',
          'Beach umbrellas for teleportation',
        ],
      },
      endpoints: {
        xr: '/xr - Main tropical XR environment',
        demo: '/xr/demo - XR demo scene',
        websocket: 'ws://localhost:3000 - Real-time multiplayer',
      },
      requirements: {
        browser: 'Chrome/Edge with WebXR support',
        device: 'VR headset (Quest, Vive, etc.) or AR device',
        fallback: 'Mouse/keyboard controls for desktop exploration',
      },
    };
  }

  @Get('pkp-workspace')
  getPKPWorkspace(@Res() res: Response) {
    const rootPath = join(__dirname, '..', '..', 'public');
    return res.sendFile('pkp-vr-workspace.html', { root: rootPath }, (err) => {
      if (err) {
        console.error('Error sending pkp-vr-workspace.html:', err);
        res.status(500).send('Error sending pkp-vr-workspace.html: ' + err.message + ' Root attempted: ' + rootPath);
      }
    });
  }
}
