const { ClientRepo } = require('@app/repository');

async function listClients(query = {}) {
  const filter = { status: query.status || 'active' };

  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { email: { $regex: query.search, $options: 'i' } },
      { company: { $regex: query.search, $options: 'i' } },
    ];
  }

  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const clients = await ClientRepo.findMany(filter, {
    sort: { created: -1 },
    skip,
    limit,
  });

  const total = await ClientRepo.raw((model) => model.countDocuments(filter));

  return {
    clients,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

module.exports = listClients;
