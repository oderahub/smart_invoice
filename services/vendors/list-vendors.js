const { VendorRepo } = require('@app/repository');

async function listVendors(query = {}) {
  const filter = { status: query.status || 'active' };

  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { email: { $regex: query.search, $options: 'i' } },
      { role: { $regex: query.search, $options: 'i' } },
    ];
  }

  if (query.role) {
    filter.role = query.role;
  }

  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const vendors = await VendorRepo.findMany(filter, {
    sort: { created: -1 },
    skip,
    limit,
  });

  const total = await VendorRepo.raw((model) => model.countDocuments(filter));

  return {
    vendors,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

module.exports = listVendors;
