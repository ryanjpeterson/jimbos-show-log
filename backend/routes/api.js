const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const slugify = require('slugify'); // Required for generating URL-friendly names
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Helper to create consistent slugs
const createSlug = (text) => slugify(text, { lower: true, strict: true });

// ==========================================
// PUBLIC GET ROUTES
// ==========================================

// GET / - All concerts (for the homepage grid)
router.get('/', async (req, res) => {
  try {
    const concerts = await prisma.concert.findMany({
      include: { venue: true },
      orderBy: { date: 'desc' },
    });
    res.json(concerts);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// GET /concerts/:id - Single concert by ID + Related Shows
router.get('/concerts/:id', async (req, res) => {
  try {
    const concertId = parseInt(req.params.id);
    
    // 1. Fetch the main concert
    const concert = await prisma.concert.findUnique({
      where: { id: concertId },
      include: { venue: true },
    });

    if (!concert) return res.status(404).json({ message: "Concert not found" });

    // 2. Fetch related concerts (Same Date AND Same Venue, excluding self)
    const startOfDay = new Date(concert.date);
    startOfDay.setUTCHours(0,0,0,0);
    
    const endOfDay = new Date(concert.date);
    endOfDay.setUTCHours(23,59,59,999);

    const relatedConcerts = await prisma.concert.findMany({
      where: {
        venueId: concert.venueId,
        date: {
          gte: startOfDay,
          lte: endOfDay
        },
        id: { not: concertId } // Exclude the current concert
      },
      orderBy: { artist: 'asc' }, // Alphabetical order for line-ups
      select: {
        id: true,
        artist: true,
        artistSlug: true,
        type: true
      }
    });

    // 3. Attach related concerts to response
    res.json({ ...concert, relatedConcerts });
    
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// GET /venues - All venues (Used for the dropdown in Create/Edit pages)
router.get('/venues', async (req, res) => {
  try {
    const venues = await prisma.venue.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(venues);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// GET /venues/id/:id - Specific route for fetching by ID (Used by EditPage)
router.get('/venues/id/:id', async (req, res) => {
  try {
    const venue = await prisma.venue.findUnique({
      where: { id: parseInt(req.params.id) }, // Lookup by ID
    });
    if (!venue) return res.status(404).json({ message: "Venue not found" });
    res.json(venue);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// GET /venues/:slug - Single venue by Slug + its concerts
router.get('/venues/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const venue = await prisma.venue.findUnique({
      where: { slug: slug }, // Lookup by SLUG, not ID
      include: {
        concerts: {
          orderBy: { date: 'desc' },
          include: { venue: true } // Include venue info so the grid can link back if needed
        },
      },
    });
    
    if (!venue) return res.status(404).json({ message: "Venue not found" });
    res.json(venue);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// GET /artists/:slug - All concerts by a specific artist (via artistSlug)
router.get('/artists/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const concerts = await prisma.concert.findMany({
      where: { artistSlug: slug }, // Lookup by artistSlug column
      include: { venue: true },
      orderBy: { date: 'desc' },
    });
    res.json(concerts);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// GET /concerts/today - "On This Day" logic
router.get('/concerts/today', async (req, res) => {
  try {
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    
    const concerts = await prisma.$queryRaw`
      SELECT c.*, v.name as "venueName", v.city as "venueCity", v.slug as "venueSlug"
      FROM "Concert" c
      JOIN "Venue" v ON c."venueId" = v.id
      WHERE EXTRACT(MONTH FROM date) = ${month}
        AND EXTRACT(DAY FROM date) = ${day}
        AND EXTRACT(YEAR FROM date) < ${today.getFullYear()}
      ORDER BY date DESC
    `;
    
    // Map raw results to match standard shape if needed, or send as is
    res.json(concerts);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// GET /stats
router.get('/stats', async (req, res) => {
  try {
    // 1. Existing queries
    const totalConcerts = prisma.concert.count();

    const firstShow = prisma.concert.findFirst({
      orderBy: { date: 'asc' },
      include: { venue: true },
    });

    const latestShow = prisma.concert.findFirst({
      orderBy: { date: 'desc' },
      include: { venue: true },
    });

    const topArtistsRaw = prisma.concert.groupBy({
      by: ['artist', 'artistSlug'],
      _count: { artist: true },
      orderBy: { _count: { artist: 'desc' } },
      take: 5,
    });

    const topVenuesRaw = prisma.venue.findMany({
      include: { _count: { select: { concerts: true } } },
      orderBy: { concerts: { _count: 'desc' } },
      take: 5,
    });

    // --- NEW RAW QUERIES ---
    
    // 2. Shows by Year (Extract Year from Date)
    // We cast to ::int to ensure JavaScript gets a Number, not a BigInt string
    const showsByYearRaw = prisma.$queryRaw`
      SELECT EXTRACT(YEAR FROM date)::int as year, COUNT(id)::int as count
      FROM "Concert"
      GROUP BY year
      ORDER BY year DESC
    `;

    // 3. Shows by City (Join Venue table)
    const showsByCityRaw = prisma.$queryRaw`
      SELECT v.city, COUNT(c.id)::int as count
      FROM "Venue" v
      JOIN "Concert" c ON v.id = c."venueId"
      GROUP BY v.city
      ORDER BY count DESC
      LIMIT 10
    `;

    // Run everything in parallel
    const [
      total, first, latest, topArtists, topVenues,
      showsByYear, showsByCity
    ] = await Promise.all([
      totalConcerts, firstShow, latestShow, topArtistsRaw, topVenuesRaw,
      showsByYearRaw, showsByCityRaw
    ]);

    // Construct response
    const stats = {
      totalConcerts: total,
      firstShow: first,
      latestShow: latest,
      topArtists: topArtists.map(a => ({
        name: a.artist,
        slug: a.artistSlug,
        count: a._count.artist,
      })),
      topVenues: topVenues.map(v => ({
        name: v.name,
        city: v.city,
        slug: v.slug,
        count: v._count.concerts,
      })),
      // Add the new data to the response
      showsByYear: showsByYear, 
      showsByCity: showsByCity
    };

    res.json(stats);

  } catch (error) {
    console.error("Failed to get stats:", error);
    res.status(500).json({ message: "Failed to get stats", error: error.message });
  }
});


// ==========================================
// AUTH ROUTES
// ==========================================

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
});


// ==========================================
// PROTECTED ROUTES (Create, Edit, Delete, Import, Export)
// ==========================================

// EXPORT ROUTE
router.get('/export', authMiddleware, async (req, res) => {
  try {
    const venues = await prisma.venue.findMany({ orderBy: { name: 'asc' } });
    const concerts = await prisma.concert.findMany({ include: { venue: true }, orderBy: { date: 'asc' } });

    const formattedConcerts = concerts.map(c => ({
      artist: c.artist,
      date: c.date,
      venueName: c.venue.name,
      type: c.type,
      eventName: c.eventName,
      setlist: c.setlist,
      notes: c.notes,
      imageUrl: c.imageUrl,
      gallery: c.gallery
    }));

    const formattedVenues = venues.map(v => ({
      name: v.name,
      city: v.city,
      address: v.address, // Include address
      latitude: v.latitude,
      longitude: v.longitude
    }));

    const exportData = { venues: formattedVenues, concerts: formattedConcerts };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=jimbos-show-log-export.json');
    res.json(exportData);
  } catch (error) {
    console.error("Export Error:", error);
    res.status(500).json({ message: "Failed to export data", error: error.message });
  }
});

// POST /create/:type
router.post('/create/:type', authMiddleware, async (req, res) => {
  const { type } = req.params;

  try {
    if (type === 'concert') {
      const { date, artist, venueId, imageUrl, gallery, ...rest } = req.body;
      
      // Create concert AND generate the artistSlug
      const newConcert = await prisma.concert.create({
        data: {
          date: new Date(date),
          artist,
          artistSlug: createSlug(artist), // <--- Generate Slug
          venueId: parseInt(venueId),
          imageUrl: imageUrl || null,
          gallery: Array.isArray(gallery) ? gallery : [],
          ...rest,
        },
      });
      return res.status(201).json(newConcert);
    } 
    
    if (type === 'venue') {
      const { name, latitude, longitude, address, ...rest } = req.body;
      
      // Create venue AND generate the slug
      const newVenue = await prisma.venue.create({
        data: {
          name,
          slug: createSlug(name), // <--- Generate Slug
          city: rest.city,
          address: address || null,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          // ...rest
        },
      });
      return res.status(201).json(newVenue);
    }
    
    res.status(400).json({ message: 'Invalid create type' });
  } catch (error) {
    // Handle Unique Constraint violation (e.g., Venue slug already exists)
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'A venue with this name/slug already exists.' });
    }
    res.status(500).json({ message: 'Creation failed', error: error.message });
  }
});

// PUT /edit/:type/:id
router.put('/edit/:type/:id', authMiddleware, async (req, res) => {
  const { type, id } = req.params;
  const data = req.body;

  try {
    if (type === 'concert') {
      // Destructure to remove nested 'venue' object and handle specific fields
      const { venueId, date, venue, imageUrl, gallery, ...rest } = data;
      
      // Prepare update data
      const updateData = {
        ...rest,
        date: date ? new Date(date) : undefined,
        venueId: venueId ? parseInt(venueId) : undefined,
        imageUrl: imageUrl || null,
        gallery: Array.isArray(gallery) ? gallery : [],
      };

      // If artist name is being updated, we must regenerate the slug
      if (rest.artist) {
        updateData.artistSlug = createSlug(rest.artist);
      }

      const updated = await prisma.concert.update({
        where: { id: parseInt(id) },
        data: updateData
      });
      return res.json(updated);
    } 
    
    else if (type === 'venue') {
      // Remove 'id' and 'type' so they don't get sent to the DB update
      const { id: _id, type: _type, latitude, longitude, concerts, address, ...rest } = data; 
      
      const updateData = {
        ...rest,
        address: address || null,
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
      };

      // If venue name changed, regenerate the slug
      if (rest.name) {
        updateData.slug = createSlug(rest.name);
      }

      const updated = await prisma.venue.update({
        where: { id: parseInt(id) }, // We typically edit venues by ID in the admin panel
        data: updateData
      });
      return res.json(updated);
    } 
    
    res.status(400).json({ message: 'Invalid edit type' });

  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'Name collision: This name generates a slug that already exists.' });
    }
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Record not found' });
    }
    console.error('Update Error:', error);
    res.status(500).json({ message: 'Update failed', error: error.message });
  }
});

// DELETE /delete/:type/:id
router.delete('/delete/:type/:id', authMiddleware, async (req, res) => {
  const { type, id } = req.params;
  
  try {
    if (type === 'concert') {
      await prisma.concert.delete({ where: { id: parseInt(id) } });
    } else if (type === 'venue') {
      await prisma.venue.delete({ where: { id: parseInt(id) } });
    } else {
      return res.status(400).json({ message: 'Invalid type' });
    }
    res.status(204).send();
    
  } catch (error) {
    if (error.code === 'P2003') { 
      return res.status(409).json({ message: 'Cannot delete venue. It still has associated concerts.' });
    }
    res.status(500).json({ message: 'Delete failed', error: error.message });
  }
});

// IMPORT ROUTE
router.post('/import', authMiddleware, async (req, res) => {
  const { venues = [], concerts = [] } = req.body;

  if (!Array.isArray(venues) || !Array.isArray(concerts)) {
    return res.status(400).json({ message: "Invalid JSON format: 'venues' and 'concerts' must be arrays." });
  }

  let importedVenues = 0;
  let importedConcerts = 0;

  try {
    // Use a transaction to ensure all or nothing
    const result = await prisma.$transaction(async (tx) => {
      
      // 1. Upsert all Venues first.
      for (const venue of venues) {
        if (!venue.name || !venue.city) {
          throw new Error('Venue missing required field: name or city.');
        }
        const slug = createSlug(venue.name);
        
        await tx.venue.upsert({
          where: { slug: slug },
          update: {
            name: venue.name,
            city: venue.city,
            address: venue.address || null,
            latitude: parseFloat(venue.latitude) || 0,
            longitude: parseFloat(venue.longitude) || 0,
          },
          create: {
            name: venue.name,
            slug: slug,
            city: venue.city,
            address: venue.address || null,
            latitude: parseFloat(venue.latitude) || 0,
            longitude: parseFloat(venue.longitude) || 0,
          }
        });
        importedVenues++;
      }

      // 2. Create Concerts
      for (const concert of concerts) {
        if (!concert.artist || !concert.date || !concert.venueName) {
          throw new Error('Concert missing required field: artist, date, or venueName.');
        }

        // Find the venueId based on the venueName
        const venueSlug = createSlug(concert.venueName);
        const foundVenue = await tx.venue.findUnique({
          where: { slug: venueSlug }
        });

        if (!foundVenue) {
          throw new Error(`Venue not found for concert: "${concert.artist}" at "${concert.venueName}". Ensure venue is in the JSON or already in the DB.`);
        }

        // Create the concert
        await tx.concert.create({
          data: {
            artist: concert.artist,
            artistSlug: createSlug(concert.artist),
            date: new Date(concert.date),
            venueId: foundVenue.id,
            type: concert.type === 'festival' ? 'festival' : 'concert',
            eventName: concert.eventName,
            setlist: concert.setlist,
            notes: concert.notes,
            imageUrl: concert.imageUrl || null,
            gallery: Array.isArray(concert.gallery) ? concert.gallery : []
          }
        });
        importedConcerts++;
      }

      return { importedVenues, importedConcerts };
    });

    res.status(200).json({
      message: `Import successful! Added/updated ${result.importedVenues} venues and ${result.importedConcerts} concerts.`,
    });

  } catch (error) {
    console.error("Import Error:", error.message);
    res.status(400).json({ 
      message: "Import failed. The entire transaction has been rolled back.",
      error: error.message 
    });
  }
});

module.exports = router;