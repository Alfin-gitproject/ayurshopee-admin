export async function getPaginatedResults(Model, query = {}, req) {
    // Extract pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
  
    // Calculate skip index
    const skipIndex = (page - 1) * limit;
  
    // Find total number of documents
    const total = await Model.countDocuments(query);
  
    // Find documents with pagination
    const results = await Model.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skipIndex)
      .exec();
  
    // Calculate total pages
    const totalPages = Math.ceil(total / limit);
  
    return {
      results,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalItems: total,
        itemsPerPage: limit
      }
    };
  }
  