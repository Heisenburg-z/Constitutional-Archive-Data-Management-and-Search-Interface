// Add to your API routes
router.get('/directories', async (req, res) => {
  try {
    // Get all directories
    const allDirectories = await Archive.find({ type: 'directory' })
      .populate({
        path: 'children',
        match: { type: 'directory' }
      });
    
    // Filter to only root directories
    const rootDirectories = allDirectories.filter(dir => !dir.parentId);
    
    // Build tree structure
    const buildTree = (rootDirs) => {
      return rootDirs.map(dir => {
        const children = allDirectories.filter(
          child => child.parentId && child.parentId.toString() === dir._id.toString()
        );
        
        return {
          ...dir.toObject(),
          children: children.length ? buildTree(children) : []
        };
      });
    };
    
    res.json(buildTree(rootDirectories));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});