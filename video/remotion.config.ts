import { Config } from '@remotion/cli/config';

// The question photos and the app icon live in the app's own assets folder.
// Serving it directly means the videos can never show a different picture from
// the app, and nothing is duplicated into this workspace.
Config.setPublicDir('../assets');

// JPEG frames are much faster to encode than PNG, and there is no
// transparency anywhere in these videos.
Config.setVideoImageFormat('jpeg');
