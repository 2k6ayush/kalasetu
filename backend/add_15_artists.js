require('dotenv').config();
const { connectDB } = require('./src/config/db');
const Artist = require('./src/models/Artist');
const Artwork = require('./src/models/Artwork');

async function run() {
  try {
    await connectDB();
    
    const newArtists = [
      { name: 'Ramesh Gond', bio: 'Gond artist from Madhya Pradesh, known for vibrant wildlife depictions and dotted line textures.', socialLink: 'https://example.com/rameshgond' },
      { name: 'Lakshmi Srinivas', bio: 'Master of Tanjore painting, embellishing deities with 22-carat gold foil and semi-precious stones.', socialLink: 'https://example.com/lakshmis' },
      { name: 'Anjali Kalam', bio: 'Kalamkari artisan from Andhra Pradesh using natural dyes to paint mythological epics on cotton canvas.', socialLink: 'https://example.com/anjalik' },
      { name: 'Rohan Pithora', bio: 'A dedicated Pithora painter preserving the ritualistic wall art of the Rathwa tribe in Gujarat.', socialLink: 'https://example.com/rohanp' },
      { name: 'Sita Devi', bio: 'Award-winning Madhubani artist known for her Kachni (line work) style and intricate geometric borders.', socialLink: 'https://example.com/sitadevi' },
      { name: 'Arjun Verma', bio: 'Pattachitra scroll painter from Odisha, maintaining the 12th-century tradition of cloth painting.', socialLink: 'https://example.com/arjunv' },
      { name: 'Fatima Shaikh', bio: 'Textile creator reviving ancient Phulkari embroidery techniques from Punjab with modern color palettes.', socialLink: 'https://example.com/fatimas' },
      { name: 'Krishnan Iyer', bio: 'Traditional bronze sculptor from Swamimalai, casting Chola-style idols using the lost-wax process.', socialLink: 'https://example.com/krishnani' },
      { name: 'Sunita Rathwa', bio: 'Tribal Terracotta artisan molding spiritual figurines and pots from local river clay.', socialLink: 'https://example.com/sunitar' },
      { name: 'Rajiv Sharma', bio: 'Miniature artist from Rajasthan painting with squirrel-hair brushes and pure organic pigments.', socialLink: 'https://example.com/rajivs' },
      { name: 'Devika Nair', bio: 'Kerala muralist creating majestic frescoes characterized by ochre hues and dynamic figures.', socialLink: 'https://example.com/devikan' },
      { name: 'Manisha Koli', bio: 'Warli painter bringing the rhythmic, monochromatic tribal village scenes to modern galleries.', socialLink: 'https://example.com/manishak' },
      { name: 'Vikram Das', bio: 'Dhokra casting specialist from Chhattisgarh, shaping brass into intricate folk art.', socialLink: 'https://example.com/vikramd' },
      { name: 'Aarohi Patel', bio: 'Lippan Kam (mud and mirror work) artist from Kutch, creating mesmerizing reflective wall pieces.', socialLink: 'https://example.com/aarohip' },
      { name: 'Tenzin Gyatso', bio: 'Thangka painter based in Dharamshala, meticulously detailing Buddhist mandalas and deities.', socialLink: 'https://example.com/tenzing' }
    ];
    
    const insertedArtists = await Artist.insertMany(newArtists);
    
    const artworksData = [
      { artistNote: 'Majestic Tiger in the forest, textured with classic Gond dots.', tags: { medium: 'Gond Painting', technique: 'Dot & Line', culturalInfluence: 'Gond Tribe', mood: ['Vibrant', 'Wild'] }, imagePath: 'https://images.unsplash.com/photo-1582561424760-0321d67fa3ce?w=800&q=80' },
      { artistNote: 'Goddess Saraswati adorned with gold foil and rubies.', tags: { medium: 'Tanjore Painting', technique: 'Gold Foil Relief', culturalInfluence: 'Tamil Nadu', mood: ['Divine', 'Opulent'] }, imagePath: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80' },
      { artistNote: 'Tree of Life drawn with tamarind pen and natural dyes.', tags: { medium: 'Kalamkari', technique: 'Natural Dyeing', culturalInfluence: 'Andhra Pradesh', mood: ['Earthy', 'Spiritual'] }, imagePath: 'https://images.unsplash.com/photo-1536924430914-91f9e2041b83?w=800&q=80' },
      { artistNote: 'Ritualistic horses galloping across a village wall.', tags: { medium: 'Pithora Art', technique: 'Wall Painting', culturalInfluence: 'Rathwa Tribe', mood: ['Festive', 'Sacred'] }, imagePath: 'https://images.unsplash.com/photo-1544928147-79a2dbc1f389?w=800&q=80' },
      { artistNote: 'Sun God surrounded by intricate geometric Kachni line work.', tags: { medium: 'Madhubani Painting', technique: 'Kachni', culturalInfluence: 'Mithila', mood: ['Radiant', 'Intricate'] }, imagePath: 'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?w=800&q=80' },
      { artistNote: 'Lord Krishna and Gopis, painted on treated cloth with stone colors.', tags: { medium: 'Pattachitra', technique: 'Scroll Painting', culturalInfluence: 'Odisha', mood: ['Devotional', 'Classic'] }, imagePath: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&q=80' },
      { artistNote: 'Bagh Phulkari featuring dense geometric floral embroidery.', tags: { medium: 'Phulkari Embroidery', technique: 'Hand Stitching', culturalInfluence: 'Punjab', mood: ['Joyful', 'Textured'] }, imagePath: 'https://images.unsplash.com/photo-1563298723-dcfebaa392e3?w=800&q=80' },
      { artistNote: 'Nataraja, the cosmic dancer, cast in panchaloha bronze.', tags: { medium: 'Bronze Sculpture', technique: 'Lost-Wax Casting', culturalInfluence: 'Chola Dynasty', mood: ['Dynamic', 'Eternal'] }, imagePath: 'https://images.unsplash.com/photo-1618331835717-801e976710b2?w=800&q=80' },
      { artistNote: 'A tribal terracotta horse offering for the forest spirits.', tags: { medium: 'Terracotta', technique: 'Hand Modeling', culturalInfluence: 'Tribal India', mood: ['Earthy', 'Rustic'] }, imagePath: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80' },
      { artistNote: 'Royal procession crossing a desert oasis, highly detailed.', tags: { medium: 'Miniature Painting', technique: 'Opaque Watercolor', culturalInfluence: 'Mughal-Rajput', mood: ['Regal', 'Detailed'] }, imagePath: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&q=80' },
      { artistNote: 'Fresco of a sleeping Vishnu surrounded by celestial beings.', tags: { medium: 'Kerala Mural', technique: 'Fresco', culturalInfluence: 'Kerala Temples', mood: ['Serene', 'Majestic'] }, imagePath: 'https://images.unsplash.com/photo-1629814696208-11a5b672cbcc?w=800&q=80' },
      { artistNote: 'Harvest festival dance (Tarpa), painted with rice paste.', tags: { medium: 'Warli Painting', technique: 'Rice Paste Art', culturalInfluence: 'Warli Tribe', mood: ['Joyous', 'Communal'] }, imagePath: 'https://images.unsplash.com/photo-1580136608260-4ebcebfaf266?w=800&q=80' },
      { artistNote: 'Intricate brass elephant cast using the traditional Dhokra method.', tags: { medium: 'Dhokra Casting', technique: 'Metal Casting', culturalInfluence: 'Bastar', mood: ['Antique', 'Folk'] }, imagePath: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800&q=80' },
      { artistNote: 'Desert moonscape captured with clay relief and inlaid mirrors.', tags: { medium: 'Lippan Kam', technique: 'Mud Relief', culturalInfluence: 'Kutch', mood: ['Sparkling', 'Geometric'] }, imagePath: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&q=80' },
      { artistNote: 'Wheel of Life mandala, painted with ground mineral pigments.', tags: { medium: 'Thangka', technique: 'Mineral Painting', culturalInfluence: 'Himalayan', mood: ['Meditative', 'Profound'] }, imagePath: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&q=80' }
    ];
    
    const newArtworks = artworksData.map((data, idx) => ({
      artistId: insertedArtists[idx]._id,
      imagePath: data.imagePath,
      artistNote: data.artistNote,
      tags: data.tags,
      moderationStatus: 'approved',
      moderationReason: 'Added via script',
      aiProvider: 'script',
      visibility: 'public'
    }));
    
    await Artwork.insertMany(newArtworks);
    
    console.log('Successfully inserted 15 artists and 15 artworks!');
    process.exit(0);
  } catch(err) {
    console.error(err);
    process.exit(1);
  }
}

run();
