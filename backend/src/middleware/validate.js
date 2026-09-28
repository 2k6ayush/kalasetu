function validateArtistInput(req, res, next) {
  const { name, bio, socialLink } = req.body;
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Artist name is required.' });
  }
  if (name.length > 100) {
    return res.status(400).json({ error: 'Artist name must be under 100 characters.' });
  }
  if (bio && bio.length > 2000) {
    return res.status(400).json({ error: 'Bio must be under 2000 characters.' });
  }
  if (socialLink && socialLink.length > 500) {
    return res.status(400).json({ error: 'Social link must be under 500 characters.' });
  }
  next();
}

function validateArtworkInput(req, res, next) {
  const { artistId, artistNote } = req.body;
  if (!artistId || typeof artistId !== 'string' || !artistId.trim()) {
    return res.status(400).json({ error: 'artistId is required.' });
  }
  if (artistNote && artistNote.length > 1000) {
    return res.status(400).json({ error: 'Artist note must be under 1000 characters.' });
  }
  next();
}

function validateCraftInput(req, res, next) {
  const { practitionerName, craftName, description, region } = req.body;
  if (!craftName || typeof craftName !== 'string' || !craftName.trim()) {
    return res.status(400).json({ error: 'craftName is required.' });
  }
  if (!practitionerName || typeof practitionerName !== 'string' || !practitionerName.trim()) {
    return res.status(400).json({ error: 'practitionerName is required.' });
  }
  if (!description || typeof description !== 'string' || !description.trim()) {
    return res.status(400).json({ error: 'description is required.' });
  }
  if (craftName.length > 150) {
    return res.status(400).json({ error: 'craftName must be under 150 characters.' });
  }
  if (practitionerName.length > 150) {
    return res.status(400).json({ error: 'practitionerName must be under 150 characters.' });
  }
  if (region && region.length > 150) {
    return res.status(400).json({ error: 'region must be under 150 characters.' });
  }
  if (description.length > 5000) {
    return res.status(400).json({ error: 'description must be under 5000 characters.' });
  }
  next();
}

function validateSpotlightInput(req, res, next) {
  const { artistId } = req.params;
  if (!artistId || typeof artistId !== 'string' || !artistId.trim()) {
    return res.status(400).json({ error: 'artistId parameter is required.' });
  }
  next();
}

module.exports = {
  validateArtistInput,
  validateArtworkInput,
  validateCraftInput,
  validateSpotlightInput,
};
