/**
 * Seed module — can be called programmatically from the app.
 * All data is fictional / placeholder.
 */
const Artist     = require('./src/models/Artist');
const Artwork    = require('./src/models/Artwork');
const Spotlight  = require('./src/models/Spotlight');
const CraftEntry = require('./src/models/CraftEntry');

async function seedDatabase() {
  // Only seed if DB is empty
  const existing = await Artist.countDocuments();
  if (existing > 0) {
    console.log('[Seed] Database already has data — skipping seed.');
    return;
  }

  console.log('[Seed] Empty database detected — seeding with demo data…\n');

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
      bio: 'Calligrapher and letter-cutter from Galway working in Irish uncial script on local limestone.',
      socialLink: 'https://example.com/liamocathain',
    },
    {
      name: 'Surya Devi',
      bio: 'Madhubani painter from Mithila preserving the Bharni style — dense, vibrant compositions depicting nature and mythology.',
      socialLink: 'https://example.com/suryadevi',
    },
    {
      name: 'Chen Wei',
      bio: 'Ink wash painter exploring shanshui landscapes with a contemporary minimalist approach. Based in Hangzhou.',
      socialLink: 'https://example.com/chenwei',
    },
    {
      name: 'Elena Vasquez',
      bio: 'Mixed-media collage artist from Buenos Aires layering found photographs, botanical prints, and hand-dyed papers.',
      socialLink: 'https://example.com/elenavasquez',
    },
  ]);

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

  await Artwork.insertMany(
    artworksData.map(a => ({
      artistId: artists[a.artist]._id,
      imagePath: '',  // No real images — handled by frontend placeholder
      artistNote: a.note,
      tags: a.tags,
      moderationStatus: 'approved',
      moderationReason: 'Seed data — pre-approved',
      aiProvider: 'seed',
    }))
  );

  await Spotlight.insertMany([
    {
      artistId: artists[0]._id,
      title: 'Priya Mehta: Where Mughal Courts Meet Street Corners',
      body: 'In a quiet Jaipur studio lined with jars of hand-ground pigments, Priya Mehta paints worlds that exist between centuries. Her miniatures borrow the intricate border work and precise line quality of Mughal court painting, but the scenes inside those borders are unmistakably contemporary — auto-rickshaws threading through archways, smartphone screens glowing against marble inlays.\n\nMehta trained for seven years under a traditional ustad before breaking away to develop her hybrid style. "The technique is sacred to me," she says, "but the stories need to be mine." She prepares her own wasli paper, burnishing layers of handmade sheets until the surface is glass-smooth, then applies pigments mixed with gum arabic — the same binding medium used four centuries ago.\n\nHer latest series, "Procession," follows festival crowds through imaginary cityscapes, each figure rendered with individual expression. The gold leaf accents catch light differently depending on the viewing angle, making every encounter with the work slightly new.',
      aiProvider: 'seed',
    },
    {
      artistId: artists[2]._id,
      title: 'Aiko Tanabe: Carving Light Into Wood',
      body: 'Aiko Tanabe\'s Tokyo workshop smells of cherry wood and rice paste. Blocks of yamazakura line the walls — some blank, some mid-carve, each destined to transfer pigment to paper exactly once per colour in prints that may require twelve separate impressions.\n\nTanabe is one of fewer than thirty active mokuhanga printers in Japan still using exclusively natural materials. Her pigments come from minerals, shells, and plants; her paper is handmade kozo washi from a mill in Echizen that has been operating since the 15th century.\n\n"Speed is the enemy of this medium," she notes. A single print edition of twenty sheets can take two months. But the results have a luminosity that synthetic inks cannot replicate — colours that seem to hover just above the paper\'s surface, shifting subtly in different light.',
      aiProvider: 'seed',
    },
    {
      artistId: artists[5]._id,
      title: 'Surya Devi: The Living Lines of Mithila',
      body: 'In the village of Ranti, Surya Devi paints on the same earth floor where her grandmother taught her to draw the first aripan patterns at age five. Madhubani painting has been the visual language of Mithila women for generations — used to decorate walls during weddings, festivals, and rites of passage.\n\nDevi works in the Bharni style, characterized by dense filling of forms with intricate patterns. Every leaf, every fish, every deity is packed with line work so fine it seems to vibrate. She mixes her own colours: lampblack from mustard oil, turmeric yellow, indigo from local plants, and the deep red of sindoor.\n\n"Each painting is a prayer," she explains. "The lines must flow without stopping — a broken line breaks the intention." Her Tree of Life compositions can take weeks, building up layers of meaning through interlocking natural forms.',
      aiProvider: 'seed',
    },
  ]);

  await CraftEntry.insertMany([
    {
      practitionerName: 'Fatou Diallo',
      craftName: 'Bogolan (Mudcloth) Dyeing',
      description: 'Bogolan is a centuries-old West African textile tradition where cloth is dyed using fermented mud and plant-based mordants. The resist-dyeing process creates bold geometric patterns with deep cultural significance.',
      images: [],
      steps: [
        'Harvest and prepare n\'galama leaves — boil in water for several hours to create a yellow-tan dye bath.',
        'Soak the hand-woven cotton strip cloth in the leaf dye. Repeat 3–4 times, sun-drying between soaks, until the fabric is deep yellow.',
        'Collect river mud and ferment it in a clay pot for at least one week.',
        'Using a bamboo stick or metal tool, paint the fermented mud onto the cloth in geometric patterns.',
        'Allow the mud to dry completely in the sun (1–2 days). Scrape off dried mud and wash. Re-apply for deeper colour.',
        'Apply a bleaching solution (caustic soda from wood ash) to the un-mudded areas to lighten them to white or cream.',
        'Final wash and sun-dry. The finished cloth shows dark patterns on a light ground — the reverse of how it was painted.',
      ],
      aiProvider: 'seed',
    },
    {
      practitionerName: 'Liam Ó Catháin',
      craftName: 'Irish Limestone Letter-Cutting',
      description: 'Letter-cutting in stone is one of the oldest forms of inscription. The Irish tradition draws on early medieval models — the half-uncial scripts seen in manuscripts like the Book of Kells, translated into three-dimensional form with mallet and chisel on local Burren limestone.',
      images: [],
      steps: [
        'Select the stone — Burren limestone is preferred for its fine grain. Examine for hidden fractures by tapping and listening for pitch changes.',
        'Prepare the face by hand-tooling it flat with a broad chisel, leaving subtle tooling marks for character.',
        'Draw the inscription directly onto the stone using chalk or wax pencil. Space letters by eye — no rulers or grids.',
        'Cut letters using a flat-bladed "letter chisel" and wooden mallet, forming V-shaped grooves with precise cuts.',
        'Form serifs and terminals by rotating the chisel at each stroke end. Uncial scripts require rounded or wedge-shaped terminals.',
        'Clean the cuts, check from different angles, and make refinement cuts where needed.',
        'Optionally apply diluted paint or limewash into cuts for legibility, or leave to weather naturally.',
      ],
      aiProvider: 'seed',
    },
  ]);

  console.log('[Seed] ✓ Database seeded successfully!');
  console.log(`  → 8 artists, 10 artworks, 3 spotlights, 2 craft entries\n`);
}

module.exports = { seedDatabase };
