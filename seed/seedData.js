/**
 * Seed Script — populates the database with fictional demo data.
 *
 * All artists, artworks, spotlights, and crafts are entirely fictional.
 * No real third-party art is scraped or referenced.
 *
 * Usage: cd backend && node ../seed/seedData.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', 'backend', '.env') });

const mongoose = require('mongoose');
const path = require('path');

// Load models
const Artist     = require('../backend/src/models/Artist');
const Artwork    = require('../backend/src/models/Artwork');
const Spotlight  = require('../backend/src/models/Spotlight');
const CraftEntry = require('../backend/src/models/CraftEntry');

// ── In-memory MongoDB for dev ──
const { MongoMemoryServer } = require(path.join(__dirname, '..', 'backend', 'node_modules', 'mongodb-memory-server'));

async function seed() {
  let uri = process.env.MONGO_URI;
  let mongoServer = null;

  if (!uri) {
    console.log('No MONGO_URI — using in-memory MongoDB for seeding…');
    console.log('⚠  Note: In-memory data is ephemeral. For persistent seed data,');
    console.log('   set MONGO_URI in backend/.env and run this script again.');
    console.log('   The app.js server also starts its own in-memory instance.');
    console.log('   To share seed data, both must use the same external MongoDB.\n');
    mongoServer = new MongoMemoryServer();
    await mongoServer.start();
    uri = mongoServer.getUri();
  }

  await mongoose.connect(uri);
  console.log('✓ Connected to MongoDB\n');

  // ── Clear existing data ──
  await Artist.deleteMany({});
  await Artwork.deleteMany({});
  await Spotlight.deleteMany({});
  await CraftEntry.deleteMany({});
  console.log('✓ Cleared existing collections\n');

  // ═══════════════════════════════════════════════════════════════
  // FICTIONAL ARTISTS
  // ═══════════════════════════════════════════════════════════════
  const artists = await Artist.insertMany([
    {
      name: 'Priya Mehta',
      bio: 'Miniature painter from Jaipur blending Mughal motifs with contemporary street art sensibilities. Works primarily on handmade wasli paper.',
      socialLink: 'https://example.com/priyamehta',
    },
    {
      name: 'Tomás Reyes',
      bio: 'Ceramic sculptor from Oaxaca exploring pre-Columbian forms through modern reduction firing. Each piece takes 3–6 weeks.',
      socialLink: 'https://example.com/tomasreyes',
    },
    {
      name: 'Aiko Tanabe',
      bio: 'Woodblock printmaker continuing the mokuhanga tradition in Tokyo. Prints exclusively with natural pigments on washi.',
      socialLink: 'https://example.com/aikotanabe',
    },
    {
      name: 'Fatou Diallo',
      bio: 'Textile artist from Dakar weaving bogolan (mudcloth) narratives into large-scale installations about migration and memory.',
      socialLink: 'https://example.com/fatoudiallo',
    },
    {
      name: 'Liam Ó Catháin',
      bio: 'Calligrapher and letter-cutter from Galway working in Irish uncial script on local limestone. Commissions for public memorials.',
      socialLink: 'https://example.com/liamocathain',
    },
    {
      name: 'Surya Devi',
      bio: 'Madhubani painter from Mithila preserving the Bharni style — dense, vibrant compositions depicting nature and mythology.',
      socialLink: 'https://example.com/suryadevi',
    },
    {
      name: 'Chen Wei',
      bio: 'Ink wash painter exploring shanshui (mountain-water) landscapes with a contemporary minimalist approach. Based in Hangzhou.',
      socialLink: 'https://example.com/chenwei',
    },
    {
      name: 'Elena Vasquez',
      bio: 'Mixed-media collage artist from Buenos Aires layering found photographs, botanical prints, and hand-dyed papers.',
      socialLink: 'https://example.com/elenavasquez',
    },
  ]);

  console.log(`✓ Created ${artists.length} artists\n`);

  // ═══════════════════════════════════════════════════════════════
  // FICTIONAL ARTWORKS (no real images — paths are placeholders)
  // ═══════════════════════════════════════════════════════════════
  const artworksData = [
    { artist: 0, note: 'Dawn over the old city — gold leaf on wasli', tags: { medium: 'Miniature Painting', technique: 'Gold Leaf Application', culturalInfluence: 'Mughal-Rajput Fusion', mood: ['Serene', 'Luminous'] }},
    { artist: 0, note: 'Festival procession study, natural pigments', tags: { medium: 'Miniature Painting', technique: 'Natural Pigment Wash', culturalInfluence: 'Rajasthani', mood: ['Joyful', 'Vibrant'] }},
    { artist: 1, note: 'Vessel form VII — smoke-fired terracotta', tags: { medium: 'Ceramic Sculpture', technique: 'Reduction Firing', culturalInfluence: 'Pre-Columbian Mesoamerican', mood: ['Earthy', 'Contemplative'] }},
    { artist: 1, note: 'Ritual bowl with serpent motif', tags: { medium: 'Ceramic Sculpture', technique: 'Coil Building', culturalInfluence: 'Oaxacan', mood: ['Mysterious', 'Ancient'] }},
    { artist: 2, note: 'Bamboo grove at dusk — 12-colour woodblock', tags: { medium: 'Woodblock Print', technique: 'Mokuhanga', culturalInfluence: 'Japanese', mood: ['Peaceful', 'Meditative'] }},
    { artist: 3, note: 'Memory map — bogolan on cotton canvas, 2m×3m', tags: { medium: 'Textile Art', technique: 'Mudcloth Dyeing', culturalInfluence: 'West African', mood: ['Nostalgic', 'Bold'] }},
    { artist: 4, note: 'Psalm fragment — limestone letter-cutting', tags: { medium: 'Stone Carving', technique: 'Letter Cutting', culturalInfluence: 'Celtic-Irish', mood: ['Solemn', 'Timeless'] }},
    { artist: 5, note: 'Tree of life — Bharni style Madhubani on handmade paper', tags: { medium: 'Madhubani Painting', technique: 'Bharni (Filled)', culturalInfluence: 'Mithila', mood: ['Vibrant', 'Sacred'] }},
    { artist: 6, note: 'Misty peaks, ink on xuan paper', tags: { medium: 'Ink Wash Painting', technique: 'Shanshui', culturalInfluence: 'Chinese Classical', mood: ['Ethereal', 'Minimalist'] }},
    { artist: 7, note: 'Layered garden — collage with botanical prints', tags: { medium: 'Mixed Media Collage', technique: 'Paper Layering', culturalInfluence: 'Latin American Contemporary', mood: ['Dreamlike', 'Organic'] }},
  ];

  const artworkImages = [
    'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1606744824163-985d376605aa?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1584727638096-042c45049ebe?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&auto=format&fit=crop',
  ];

  const artworks = await Artwork.insertMany(
    artworksData.map((a, index) => ({
      artistId: artists[a.artist]._id,
      imagePath: artworkImages[index],
      artistNote: a.note,
      tags: a.tags,
      moderationStatus: 'approved',
      moderationReason: 'Seed data — pre-approved',
      aiProvider: 'seed',
    }))
  );

  console.log(`✓ Created ${artworks.length} artworks\n`);

  // ═══════════════════════════════════════════════════════════════
  // FICTIONAL SPOTLIGHTS
  // ═══════════════════════════════════════════════════════════════
  const spotlights = await Spotlight.insertMany([
    {
      artistId: artists[0]._id,
      title: 'Priya Mehta: Where Mughal Courts Meet Street Corners',
      body: `In a quiet Jaipur studio lined with jars of hand-ground pigments, Priya Mehta paints worlds that exist between centuries. Her miniatures borrow the intricate border work and precise line quality of Mughal court painting, but the scenes inside those borders are unmistakably contemporary — auto-rickshaws threading through archways, smartphone screens glowing against marble inlays.\n\nMehta trained for seven years under a traditional ustad before breaking away to develop her hybrid style. "The technique is sacred to me," she says, "but the stories need to be mine." She prepares her own wasli paper, burnishing layers of handmade sheets until the surface is glass-smooth, then applies pigments mixed with gum arabic — the same binding medium used four centuries ago.\n\nHer latest series, "Procession," follows festival crowds through imaginary cityscapes, each figure rendered with individual expression. The gold leaf accents catch light differently depending on the viewing angle, making every encounter with the work slightly new.`,
      aiProvider: 'seed',
    },
    {
      artistId: artists[2]._id,
      title: 'Aiko Tanabe: Carving Light Into Wood',
      body: `Aiko Tanabe's Tokyo workshop smells of cherry wood and rice paste. Blocks of yamazakura line the walls — some blank, some mid-carve, each destined to transfer pigment to paper exactly once per colour in prints that may require twelve separate impressions.\n\nTanabe is one of fewer than thirty active mokuhanga printers in Japan still using exclusively natural materials. Her pigments come from minerals, shells, and plants; her paper is handmade kozo washi from a mill in Echizen that has been operating since the 15th century.\n\n"Speed is the enemy of this medium," she notes. A single print edition of twenty sheets can take two months. But the results have a luminosity that synthetic inks cannot replicate — colours that seem to hover just above the paper's surface, shifting subtly in different light. Her "Bamboo at Dusk" series captures twilight transitions with a graduated bokashi technique that requires re-wetting the block between every impression.`,
      aiProvider: 'seed',
    },
    {
      artistId: artists[5]._id,
      title: 'Surya Devi: The Living Lines of Mithila',
      body: `In the village of Ranti, Surya Devi paints on the same earth floor where her grandmother taught her to draw the first aripan patterns at age five. Madhubani painting has been the visual language of Mithila women for generations — used to decorate walls during weddings, festivals, and rites of passage.\n\nDevi works in the Bharni style, characterized by dense filling of forms with intricate patterns. Every leaf, every fish, every deity is packed with line work so fine it seems to vibrate. She mixes her own colours: lampblack from mustard oil, turmeric yellow, indigo from local plants, and the deep red of sindoor.\n\n"Each painting is a prayer," she explains. "The lines must flow without stopping — a broken line breaks the intention." Her Tree of Life compositions can take weeks, building up layers of meaning through interlocking natural forms. International exhibitions have brought her work global attention, but she continues to paint exclusively on handmade paper, using brushes made from bamboo slivers and cotton wrapped around twigs.`,
      aiProvider: 'seed',
    },
  ]);

  console.log(`✓ Created ${spotlights.length} spotlights\n`);

  // ═══════════════════════════════════════════════════════════════
  // FICTIONAL CRAFT ENTRIES
  // ═══════════════════════════════════════════════════════════════
  const crafts = await CraftEntry.insertMany([
    {
      practitionerName: 'Fatou Diallo',
      craftName: 'Bogolan (Mudcloth) Dyeing',
      description: 'Bogolan is a centuries-old West African textile tradition where cloth is dyed using fermented mud and plant-based mordants. The resist-dyeing process creates bold geometric patterns with deep cultural significance — each symbol carries specific meaning related to history, social status, or proverbs.',
      images: [],
      steps: [
        'Harvest and prepare n\'galama leaves — boil them in water for several hours to create a yellow-tan dye bath.',
        'Soak the hand-woven cotton strip cloth (made of narrow bands sewn together) in the leaf dye. Repeat 3–4 times, sun-drying between soaks, until the fabric is deep yellow.',
        'Collect river mud and ferment it in a clay pot for at least one week. The fermentation produces iron-rich compounds that will react with the tannins in the dyed cloth.',
        'Using a bamboo stick or metal tool, paint the fermented mud onto the cloth in geometric patterns. The mud-covered areas will turn dark brown/black through the chemical reaction.',
        'Allow the mud to dry completely in the sun — this takes 1–2 days. Scrape off the dried mud and wash the cloth. Re-apply mud and dry again for deeper colour.',
        'Apply a bleaching solution (traditionally caustic soda from wood ash) to the un-mudded yellow areas to lighten them to white or cream, creating maximum contrast.',
        'Final wash and sun-dry. The finished cloth shows dark patterns on a light ground — the reverse of how it was painted. Each cloth typically takes 2–3 weeks from start to finish.',
      ],
      aiProvider: 'seed',
    },
    {
      practitionerName: 'Liam Ó Catháin',
      craftName: 'Irish Limestone Letter-Cutting',
      description: 'Letter-cutting in stone is one of the oldest forms of inscription, and the Irish tradition draws on early medieval models — the half-uncial scripts seen in manuscripts like the Book of Kells, translated into three-dimensional form with mallet and chisel on local Burren limestone.',
      images: [],
      steps: [
        'Select the stone — Burren limestone is preferred for its fine grain, even colour, and workability. Examine the block for hidden fractures by tapping and listening for changes in pitch.',
        'Prepare the face by hand-tooling it flat with a broad chisel, leaving subtle tooling marks that give the surface character. Avoid machine-polishing — the slightly rough surface holds shadows better.',
        'Draw the inscription directly onto the stone surface using chalk or a wax pencil. Space the letters by eye — no rulers or grids. The letter-cutter must internalise the proportions of the chosen script.',
        'Cut the letters using a flat-bladed chisel (the "letter chisel") and a wooden mallet. Each letter is formed by a series of precise cuts that create V-shaped grooves. The chisel angle determines the profile of each stroke.',
        'Form serifs and terminals by rotating the chisel at the end of each stroke. In uncial scripts, these are often rounded or wedge-shaped, requiring a steady hand and consistent pressure.',
        'Clean the cuts by brushing away dust and checking each letter from different angles. Make refinement cuts where needed — a misplaced strike cannot be undone in stone.',
        'Optional: apply a thin wash of diluted paint or limewash into the cut letters to improve legibility from a distance, or leave the letters to weather naturally and fill with lichen over decades.',
      ],
      aiProvider: 'seed',
    },
  ]);

  console.log(`✓ Created ${crafts.length} craft entries\n`);

  // ── Summary ──
  console.log('════════════════════════════════════════');
  console.log('  Seed complete!');
  console.log(`  ${artists.length} artists, ${artworks.length} artworks,`);
  console.log(`  ${spotlights.length} spotlights, ${crafts.length} craft entries`);
  console.log('════════════════════════════════════════\n');

  // Print artist IDs for reference
  console.log('Artist IDs (for testing):');
  artists.forEach(a => console.log(`  ${a.name}: ${a._id}`));
  console.log('');

  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
