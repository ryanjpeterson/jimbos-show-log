const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const slugify = require('slugify');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// --- DYNAMIC FILE UPLOAD SETUP ---
const isDocker = process.env.NODE_ENV === 'production' || fs.existsSync('/.dockerenv');
const uploadBaseDir = isDocker 
    ? '/app/uploads' 
    : path.join(__dirname, '../uploads'); 

if (!fs.existsSync(uploadBaseDir)) {
  fs.mkdirSync(uploadBaseDir, { recursive: true });
}

const createSlug = (text) => slugify(text, { lower: true, strict: true });

const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    const concertId = parseInt(req.body.concertId);
    if (!concertId || isNaN(concertId)) return cb(new Error("Missing 'concertId' in upload request."));
    try {
        const concert = await prisma.concert.findUnique({ where: { id: concertId }, select: { date: true, artist: true } });
        if (!concert) return cb(new Error(`Concert ID ${concertId} not found.`));
        const datePart = new Date(concert.date).toISOString().slice(0, 10).replace(/-/g, '');
        const artistSlug = createSlug(concert.artist);
        const destinationDir = path.join(uploadBaseDir, `${datePart}-${artistSlug}`);
        if (!fs.existsSync(destinationDir)) fs.mkdirSync(destinationDir, { recursive: true });
        cb(null, destinationDir);
    } catch (error) { cb(error); }
  },
  filename: async function (req, file, cb) {
    const concertId = parseInt(req.body.concertId);
    try {
        const concert = await prisma.concert.findUnique({ where: { id: concertId }, select: { gallery: true, imageUrl: true, date: true, artist: true } });
        const nextFileNumber = (concert.gallery || []).length + (concert.imageUrl ? 1 : 0) + 1; 
        const datePart = new Date(concert.date).toISOString().slice(0, 10).replace(/-/g, '');
        const artistSlug = createSlug(concert.artist);
        const fileExtension = path.extname(file.originalname).toLowerCase();
        cb(null, `${datePart}-${artistSlug}-${nextFileNumber}${fileExtension}`);
    } catch (error) { cb(error); }
  }
});

const upload = multer({ 
  storage: storage, limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) cb(null, true);
    else cb(new Error('Only images and videos are allowed.'));
  }
});

// --- ROUTES ---

router.get('/', async (req, res) => {
  try {
    const concerts = await prisma.concert.findMany({ include: { venue: true }, orderBy: { date: 'desc' } });
    res.json(concerts);
  } catch (error) { res.status(500).json({ message: "Server Error", error: error.message }); }
});

router.get('/concerts/:id', async (req, res) => {
  try {
    const concertId = parseInt(req.params.id);
    const concert = await prisma.concert.findUnique({ where: { id: concertId }, include: { venue: true } });
    if (!concert) return res.status(404).json({ message: "Concert not found" });

    const startOfDay = new Date(concert.date); startOfDay.setUTCHours(0,0,0,0);
    const endOfDay = new Date(concert.date); endOfDay.setUTCHours(23,59,59,999);

    const relatedConcerts = await prisma.concert.findMany({
      where: { venueId: concert.venueId, date: { gte: startOfDay, lte: endOfDay }, id: { not: concertId } },
      orderBy: { artist: 'asc' }, select: { id: true, artist: true, artistSlug: true, type: true }
    });
    res.json({ ...concert, relatedConcerts });
  } catch (error) { res.status(500).json({ message: "Server Error", error: error.message }); }
});

router.get('/venues', async (req, res) => {
  try { res.json(await prisma.venue.findMany({ orderBy: { name: 'asc' } })); } 
  catch (error) { res.status(500).json({ message: "Server Error", error: error.message }); }
});

router.get('/venues/id/:id', async (req, res) => {
  try {
    const venue = await prisma.venue.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!venue) return res.status(404).json({ message: "Venue not found" });
    res.json(venue);
  } catch (error) { res.status(500).json({ message: "Server Error", error: error.message }); }
});

router.get('/venues/:slug', async (req, res) => {
  try {
    const venue = await prisma.venue.findUnique({ where: { slug: req.params.slug }, include: { concerts: { orderBy: { date: 'desc' }, include: { venue: true } } } });
    if (!venue) return res.status(404).json({ message: "Venue not found" });
    res.json(venue);
  } catch (error) { res.status(500).json({ message: "Server Error", error: error.message }); }
});

router.get('/artists/:slug', async (req, res) => {
  try {
    const concerts = await prisma.concert.findMany({ where: { artistSlug: req.params.slug }, include: { venue: true }, orderBy: { date: 'desc' } });
    res.json(concerts);
  } catch (error) { res.status(500).json({ message: "Server Error", error: error.message }); }
});

router.get('/stats', async (req, res) => {
  try {
    const [total, first, latest, topArtists, topVenues, showsByYear, showsByCity] = await Promise.all([
      prisma.concert.count(),
      prisma.concert.findFirst({ orderBy: { date: 'asc' }, include: { venue: true } }),
      prisma.concert.findFirst({ orderBy: { date: 'desc' }, include: { venue: true } }),
      prisma.concert.groupBy({ by: ['artist', 'artistSlug'], _count: { artist: true }, orderBy: { _count: { artist: 'desc' } }, take: 5 }),
      prisma.venue.findMany({ include: { _count: { select: { concerts: true } } }, orderBy: { concerts: { _count: 'desc' } }, take: 5 }),
      prisma.$queryRaw`SELECT EXTRACT(YEAR FROM date)::int as year, COUNT(id)::int as count FROM "Concert" GROUP BY year ORDER BY year DESC`,
      prisma.$queryRaw`SELECT v.city, COUNT(c.id)::int as count FROM "Venue" v JOIN "Concert" c ON v.id = c."venueId" GROUP BY v.city ORDER BY count DESC LIMIT 10`
    ]);
    res.json({
      totalConcerts: total, firstShow: first, latestShow: latest,
      topArtists: topArtists.map(a => ({ name: a.artist, slug: a.artistSlug, count: a._count.artist })),
      topVenues: topVenues.map(v => ({ name: v.name, city: v.city, slug: v.slug, count: v._count.concerts })),
      showsByYear, showsByCity
    });
  } catch (error) { res.status(500).json({ message: "Failed to get stats", error: error.message }); }
});

// --- AUTH & PROTECTED ---

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ userId: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) { res.status(500).json({ message: "Login failed", error: error.message }); }
});

router.get('/export', authMiddleware, async (req, res) => {
  try {
    const venues = await prisma.venue.findMany({ orderBy: { name: 'asc' } });
    const concerts = await prisma.concert.findMany({ include: { venue: true }, orderBy: { date: 'asc' } });
    const exportData = {
      venues: venues.map(v => ({ name: v.name, city: v.city, address: v.address, latitude: v.latitude, longitude: v.longitude })),
      concerts: concerts.map(c => ({
        artist: c.artist, date: c.date, venueName: c.venue.name, type: c.type, eventName: c.eventName, setlist: c.setlist, notes: c.notes, imageUrl: c.imageUrl, gallery: c.gallery
      }))
    };
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=jimbos-show-log-export.json');
    res.json(exportData);
  } catch (error) { res.status(500).json({ message: "Failed to export data", error: error.message }); }
});

router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });
  const concertId = parseInt(req.body.concertId);
  const isMainImage = req.body.isMainImage === 'true';
  const subpath = req.file.destination.substring(uploadBaseDir.length);
  const fileUrl = path.join('/uploads', subpath, req.file.filename).replace(/\\/g, '/');
  try {
    if (isMainImage) await prisma.concert.update({ where: { id: concertId }, data: { imageUrl: fileUrl } });
    else await prisma.concert.update({ where: { id: concertId }, data: { gallery: { push: fileUrl } } });
    res.json({ url: fileUrl });
  } catch (error) { res.status(500).json({ message: 'Upload succeeded, but failed to save URL to database.' }); }
});

// DELETE UPLOADED FILE
router.delete('/upload', authMiddleware, async (req, res) => {
    const { fileUrl, concertId } = req.body;
    if (!fileUrl) return res.status(400).json({ message: "Missing fileUrl" });
    if (!fileUrl.startsWith('/uploads/') || fileUrl.includes('..')) return res.status(400).json({ message: "Invalid file path" });
  
    // 1. Delete from Disk
    const relativePath = fileUrl.replace(/^\/uploads/, ''); 
    const filePath = path.join(uploadBaseDir, relativePath);
  
    try {
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
  
      // 2. Update Database (Remove reference)
      if (concertId) {
          const concert = await prisma.concert.findUnique({ where: { id: parseInt(concertId) } });
          if (concert) {
              // Check if it's the main image
              if (concert.imageUrl === fileUrl) {
                  await prisma.concert.update({ where: { id: parseInt(concertId) }, data: { imageUrl: null } });
              } 
              // Check gallery
              else if (concert.gallery.includes(fileUrl)) {
                  const newGallery = concert.gallery.filter(url => url !== fileUrl);
                  await prisma.concert.update({ where: { id: parseInt(concertId) }, data: { gallery: newGallery } });
              }
          }
      }
  
      res.json({ message: "File deleted successfully" });
    } catch (error) {
      console.error("Delete file error:", error);
      res.status(500).json({ message: "Failed to delete file" });
    }
});

router.post('/create/:type', authMiddleware, async (req, res) => {
  const { type } = req.params;
  try {
    if (type === 'concert') {
      const { date, artist, venueId, imageUrl, gallery, ...rest } = req.body;
      const newConcert = await prisma.concert.create({
        data: { date: new Date(date), artist, artistSlug: createSlug(artist), venueId: parseInt(venueId), imageUrl: imageUrl || null, gallery: Array.isArray(gallery) ? gallery : [], ...rest },
      });
      return res.status(201).json(newConcert);
    } 
    if (type === 'venue') {
      const { name, latitude, longitude, address, ...rest } = req.body;
      const newVenue = await prisma.venue.create({
        data: { name, slug: createSlug(name), city: rest.city, address: address || null, latitude: parseFloat(latitude), longitude: parseFloat(longitude) },
      });
      return res.status(201).json(newVenue);
    }
    res.status(400).json({ message: 'Invalid create type' });
  } catch (error) {
    if (error.code === 'P2002') return res.status(409).json({ message: 'Duplicate entry.' });
    res.status(500).json({ message: 'Creation failed', error: error.message });
  }
});

router.put('/edit/:type/:id', authMiddleware, async (req, res) => {
  const { type, id } = req.params;
  const data = req.body;
  try {
    if (type === 'concert') {
      const { venueId, date, venue, imageUrl, gallery, ...rest } = data;
      const updateData = { ...rest, date: date ? new Date(date) : undefined, venueId: venueId ? parseInt(venueId) : undefined, imageUrl: imageUrl || null, gallery: Array.isArray(gallery) ? gallery : [] };
      if (rest.artist) updateData.artistSlug = createSlug(rest.artist);
      const updated = await prisma.concert.update({ where: { id: parseInt(id) }, data: updateData });
      return res.json(updated);
    } 
    else if (type === 'venue') {
      const { id: _id, type: _type, latitude, longitude, concerts, address, ...rest } = data; 
      const updateData = { ...rest, address: address || null, latitude: latitude ? parseFloat(latitude) : undefined, longitude: longitude ? parseFloat(longitude) : undefined };
      if (rest.name) updateData.slug = createSlug(rest.name);
      const updated = await prisma.venue.update({ where: { id: parseInt(id) }, data: updateData });
      return res.json(updated);
    } 
    res.status(400).json({ message: 'Invalid edit type' });
  } catch (error) { res.status(500).json({ message: 'Update failed', error: error.message }); }
});

router.delete('/delete/:type/:id', authMiddleware, async (req, res) => {
  try {
    if (req.params.type === 'concert') await prisma.concert.delete({ where: { id: parseInt(req.params.id) } });
    else await prisma.venue.delete({ where: { id: parseInt(req.params.id) } });
    res.status(204).send();
  } catch (error) { res.status(500).json({ message: 'Delete failed', error: error.message }); }
});

router.post('/import', authMiddleware, async (req, res) => {
  const { venues = [], concerts = [] } = req.body;
  if (!Array.isArray(venues) || !Array.isArray(concerts)) return res.status(400).json({ message: "Invalid JSON" });

  try {
    const result = await prisma.$transaction(async (tx) => {
      let importedVenues = 0, importedConcerts = 0;
      for (const venue of venues) {
        const slug = createSlug(venue.name);
        await tx.venue.upsert({
          where: { slug },
          update: { name: venue.name, city: venue.city, address: venue.address || null, latitude: parseFloat(venue.latitude), longitude: parseFloat(venue.longitude) },
          create: { name: venue.name, slug, city: venue.city, address: venue.address || null, latitude: parseFloat(venue.latitude), longitude: parseFloat(venue.longitude) }
        });
        importedVenues++;
      }
      for (const concert of concerts) {
        const venueSlug = createSlug(concert.venueName);
        const foundVenue = await tx.venue.findUnique({ where: { slug: venueSlug } });
        if (!foundVenue) throw new Error(`Venue not found: ${concert.venueName}`);
        await tx.concert.create({
          data: {
            artist: concert.artist, artistSlug: createSlug(concert.artist), date: new Date(concert.date), venueId: foundVenue.id,
            type: concert.type === 'festival' ? 'festival' : 'concert', eventName: concert.eventName, setlist: concert.setlist, notes: concert.notes,
            imageUrl: concert.imageUrl || null, gallery: Array.isArray(concert.gallery) ? concert.gallery : []
          }
        });
        importedConcerts++;
      }
      return { importedVenues, importedConcerts };
    });
    res.status(200).json({ message: `Imported ${result.importedVenues} venues and ${result.importedConcerts} concerts.` });
  } catch (error) { res.status(400).json({ message: "Import failed", error: error.message }); }
});

module.exports = router;