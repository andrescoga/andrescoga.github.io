# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio website for a video editor/motion designer. Static site hosted on GitHub Pages at andrescoga.com.

**Tech Stack:** Vanilla JavaScript (ES6+), HTML5, CSS3 (no build tools or frameworks)
**Video Hosting:** Bunny.net CDN (primary) with Vimeo iframe fallback

## Development

No build process. Edit files directly and push to main branch for automatic GitHub Pages deployment.

**Local development:** Open HTML files directly in browser or use any local server.

## Architecture

### Pages
- **index.html** - Main portfolio with interactive video previews (hover on desktop, click on mobile)
- **snippets.html** - Motion design gallery with lazy-loaded video grid
- **information.html** - About page with interactive photo grid effect

### JavaScript Modules (js/)
- **reveal.js** - Core portfolio logic: video preview/expand system, mobile vs desktop behavior switching, page transitions, dual video source handling (Bunny.net + Vimeo fallback)
- **snippets.js** - Gallery management: Intersection Observer lazy loading, hover-to-play, first frame capture for posters
- **information.js** - 4x4 photo grid chunking with mouse-tracking displacement effect

### Key Implementation Details

**Video URL Mapping:** Video sources are hardcoded in JavaScript objects within each file, not in HTML data attributes.

**Mobile Detection:** Uses `window.innerWidth < 992px` threshold (matches CSS breakpoint). System reinitializes on viewport changes.

**Page Transitions:** Body opacity fade (300ms) - SPA-like experience with traditional links.

**CSS Transitions:** 900ms video player expansion transitions coordinated with JavaScript timing.

**Responsive Breakpoints:**
- Desktop: 992px+
- Tablet: 768px-991px
- Mobile: 576px-767px
- Small mobile: <576px (2-column snippet grid)

### External Dependencies
- Bunny.net CDN: `index-videos.b-cdn.net` & `snippetsportfolio.b-cdn.net`
- Vimeo embeds (fallback only)
- System fonts only (no external fonts)
