/**
 * Synthetic Demo Data Seed Script
 * Generates realistic analytics sessions, page views, and click events for "demo-store".
 * 
 * Safety Rule: NEVER run in production.
 */
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../src/config/db');
const Event = require('../src/models/Event');
const { normalizeUrl } = require('../src/utils/urlNormalizer');
const { isProduction } = require('../src/config/env');

if (isProduction) {
  console.error('[CRITICAL] Cannot run seed script in production environment!');
  process.exit(1);
}

const WEBSITE_ID = 'demo-store';
const BASE_URL = 'http://localhost:3000';

const PAGES = [
  `${BASE_URL}/`,
  `${BASE_URL}/products.html`,
  `${BASE_URL}/product-detail.html?id=aurora-headphones`,
  `${BASE_URL}/product-detail.html?id=zenith-smartwatch`,
  `${BASE_URL}/cart.html`
];

const CLICK_TARGETS = [
  { tag: 'button', id: 'btn-hero-shop', cls: 'btn btn-primary', text: 'Shop Latest Tech', x: 260, y: 380 },
  { tag: 'button', id: 'btn-add-cart-1', cls: 'btn btn-accent', text: 'Add to Cart', x: 420, y: 640 },
  { tag: 'button', id: 'btn-add-cart-2', cls: 'btn btn-accent', text: 'Add to Cart', x: 740, y: 640 },
  { tag: 'a', id: 'nav-products', cls: 'nav-link', text: 'Products', x: 480, y: 45 },
  { tag: 'a', id: 'nav-cart', cls: 'nav-link badge-icon', text: 'Cart (2)', x: 920, y: 45 },
  { tag: 'button', id: 'btn-checkout', cls: 'btn btn-success btn-block', text: 'Proceed to Checkout', x: 650, y: 520 },
  { tag: 'div', id: 'product-card-1', cls: 'card product-card', text: 'Aurora Wireless ANC Headphones', x: 380, y: 480 },
  { tag: 'button', id: 'tab-specifications', cls: 'tab-item', text: 'Technical Specs', x: 350, y: 720 }
];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function runSeed() {
  console.log('🌱 Starting synthetic data seed for CausalFunnel Analytics...');
  await connectDB();

  // Clear existing demo-store data to ensure clean repeatability
  const deleted = await Event.deleteMany({ website_id: WEBSITE_ID });
  console.log(`Cleaned up ${deleted.deletedCount} existing demo events.`);

  const eventsToInsert = [];
  const now = new Date();
  const totalSessions = 18;

  for (let s = 1; s <= totalSessions; s++) {
    const sessionId = `demo-session-${s.toString().padStart(3, '0')}-${Math.random().toString(36).substring(2, 9)}`;
    // Stagger sessions over the past 3 days
    const hoursAgo = getRandomInt(1, 72);
    let sessionTime = new Date(now.getTime() - hoursAgo * 3600 * 1000);

    // Number of pages visited in this session
    const pageSteps = getRandomInt(2, 5);
    const visitedPages = [];
    for (let p = 0; p < pageSteps; p++) {
      visitedPages.push(PAGES[Math.min(p, PAGES.length - 1)]);
    }

    for (const page of visitedPages) {
      // 1. Page view event
      sessionTime = new Date(sessionTime.getTime() + getRandomInt(5000, 30000));
      eventsToInsert.push({
        session_id: sessionId,
        website_id: WEBSITE_ID,
        event_type: 'page_view',
        page_url: normalizeUrl(page),
        timestamp: new Date(sessionTime),
        metadata: {
          referrer: 'direct',
          browser: 'Chrome 122'
        }
      });

      // 2. Click events on this page (1 to 4 clicks)
      const clicksOnPage = getRandomInt(1, 4);
      for (let c = 0; c < clicksOnPage; c++) {
        sessionTime = new Date(sessionTime.getTime() + getRandomInt(2000, 15000));
        const target = getRandomItem(CLICK_TARGETS);
        const jitterX = getRandomInt(-40, 40);
        const jitterY = getRandomInt(-30, 30);
        const clientX = Math.max(20, target.x + jitterX);
        const clientY = Math.max(20, target.y + jitterY);
        const scrollY = getRandomInt(0, 300);

        eventsToInsert.push({
          session_id: sessionId,
          website_id: WEBSITE_ID,
          event_type: 'click',
          page_url: normalizeUrl(page),
          timestamp: new Date(sessionTime),
          click: {
            clientX,
            clientY,
            pageX: clientX,
            pageY: clientY + scrollY,
            scrollX: 0,
            scrollY,
            viewportWidth: 1280,
            viewportHeight: 800,
            pageWidth: 1280,
            pageHeight: 1800,
            targetTag: target.tag,
            targetId: target.id,
            targetClass: target.cls,
            targetText: target.text
          }
        });
      }
    }
  }

  console.log(`Inserting ${eventsToInsert.length} synthetic events...`);
  await Event.insertMany(eventsToInsert);

  console.log(`✅ Seed completed successfully!`);
  console.log(`- Website ID: ${WEBSITE_ID}`);
  console.log(`- Total Sessions Generated: ${totalSessions}`);
  console.log(`- Total Events: ${eventsToInsert.length}`);

  await disconnectDB();
  process.exit(0);
}

runSeed().catch((err) => {
  console.error('Seed script failed:', err);
  process.exit(1);
});
